// services/rateLimit/drivers/redis.js
const IORedis = require('ioredis');

const LUA_TOKEN_BUCKET = `
-- KEYS[1] = tokens_key
-- KEYS[2] = reset_key
-- KEYS[3] = block_key
-- ARGV[1] = now(ms)
-- ARGV[2] = points
-- ARGV[3] = duration(ms)
-- ARGV[4] = blockMs
local tokens_key = KEYS[1]
local reset_key  = KEYS[2]
local block_key  = KEYS[3]

local now        = tonumber(ARGV[1])
local points     = tonumber(ARGV[2])
local durationMs = tonumber(ARGV[3])
local blockMs    = tonumber(ARGV[4])

-- check block
local blockUntil = redis.call('PTTL', block_key)
if blockUntil > 0 then
  return {0, 0, redis.call('PTTL', reset_key), blockUntil}
end

local tokens = tonumber(redis.call('GET', tokens_key))
local resetAt = tonumber(redis.call('PTTL', reset_key))
if not tokens or resetAt <= 0 then
  tokens = points
  redis.call('SET', tokens_key, tokens, 'PX', durationMs)
  redis.call('SET', reset_key, 1, 'PX', durationMs)
  resetAt = durationMs
end

if tokens > 0 then
  tokens = tokens - 1
  redis.call('SET', tokens_key, tokens, 'KEEPTTL')
  local remainReset = redis.call('PTTL', reset_key)
  return {1, tokens, remainReset, 0}
else
  if blockMs > 0 then
    redis.call('PSETEX', block_key, blockMs, 1)
    return {0, 0, redis.call('PTTL', reset_key), blockMs}
  end
  return {0, 0, redis.call('PTTL', reset_key), 0}
end
`;

class RedisDriver {
  constructor({ url, defaultPolicy } = {}) {
    this.name = 'redis';
    this.url = url || process.env.REDIS_URL || 'redis://localhost:6379';
    this.defaultPolicy = defaultPolicy || { points: 60, duration: 60, blockMs: 0 };
    this.redis = null;
    this.sha = null;
  }

  async init() {
    this.redis = new IORedis(this.url, { 
      lazyConnect: true, 
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      connectTimeout: 10000
    });
    
    await this.redis.connect();
    
    // ثبت اسکریپت Lua
    this.sha = await this.redis.script('LOAD', LUA_TOKEN_BUCKET);
    
    console.log('[RedisDriver] Initialized successfully with Lua script');
  }

  _keys(key) {
    const base = `rl:${key}`;
    return { 
      tokens: `${base}:t`, 
      reset: `${base}:r`, 
      block: `${base}:b` 
    };
  }

  async consume(key, policy = this.defaultPolicy) {
    const p = { ...this.defaultPolicy, ...policy };
    const k = this._keys(key);
    const now = Date.now();
    
    const res = await this.redis.evalsha(
      this.sha,
      3,
      k.tokens, k.reset, k.block,
      now, p.points, p.duration * 1000, p.blockMs || 0
    );
    
    // res = {allowed(1|0), remaining, resetMs, retryAfterMs}
    return {
      allowed: res[0] === 1,
      remaining: Number(res[1]),
      resetMs: Number(res[2]),
      retryAfterMs: Number(res[3]),
    };
  }

  async reset(key) {
    const k = this._keys(key);
    await this.redis.del(k.tokens, k.reset, k.block);
  }

  async status(key) {
    const k = this._keys(key);
    const [tokens, resetTtl, blockTtl] = await this.redis.multi()
      .get(k.tokens)
      .pttl(k.reset)
      .pttl(k.block)
      .exec();
      
    const t = tokens?.[1] ? Number(tokens[1]) : null;
    const rT = resetTtl?.[1] || -1;
    const bT = blockTtl?.[1] || -1;
    
    if (t === null || rT <= 0) return { exists: false };
    
    return { 
      exists: true, 
      remaining: t, 
      resetMs: rT > 0 ? rT : 0, 
      blockedMs: bT > 0 ? bT : 0 
    };
  }
}

module.exports = RedisDriver;
