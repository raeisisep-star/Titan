import type { Env } from "../../types/cloudflare"
import { Hono } from 'hono'

export const settingsRoutes = new Hono()

settingsRoutes.get('/general', async (c) => {
  return c.json({
    success: true,
    data: {
      language: 'fa',
      theme: 'dark',
      notifications: true,
      auto_trading: true
    }
  })
})

export default settingsRoutes