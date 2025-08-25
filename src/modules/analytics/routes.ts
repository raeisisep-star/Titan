import type { Env } from "../../types/cloudflare"
import { Hono } from 'hono'

export const analyticsRoutes = new Hono()

analyticsRoutes.get('/overview', async (c) => {
  return c.json({
    success: true,
    data: {
      total_profit: 12450.75,
      win_rate: 78.5,
      avg_trade_time: '2h 15m',
      best_performer: 'BTC/USDT'
    }
  })
})

export default analyticsRoutes