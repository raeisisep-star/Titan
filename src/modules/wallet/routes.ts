import type { Env } from "../../types/cloudflare"
import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
}

export const walletRoutes = new Hono<{ Bindings: Env }>()

// Get connected wallets
walletRoutes.get('/list', async (c) => {
  return c.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Binance Main',
        type: 'exchange',
        status: 'connected',
        balance_usd: 75000,
        last_sync: '2024-08-22T11:30:00Z'
      },
      {
        id: 2,
        name: 'Coinbase Pro',
        type: 'exchange',
        status: 'connected',
        balance_usd: 35000,
        last_sync: '2024-08-22T11:25:00Z'
      },
      {
        id: 3,
        name: 'MetaMask Wallet',
        type: 'wallet',
        status: 'connected',
        balance_usd: 15000,
        last_sync: '2024-08-22T11:20:00Z'
      }
    ]
  })
})

export default walletRoutes