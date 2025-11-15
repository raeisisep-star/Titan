# Changelog

All notable changes to the TITAN Trading System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.1.0] - 2025-11-15

### 🎯 Major Release: Dashboard Cleanup & Real Data Integration

This release represents a complete overhaul of the dashboard system, removing all experimental features and integrating real trading data from MEXC and PostgreSQL database.

### Added

- ✅ **Real MEXC Integration**: Live BTC and ETH prices from MEXC exchange
- ✅ **External APIs**: Fear & Greed Index and BTC Dominance from external sources
- ✅ **PostgreSQL Integration**: Real portfolio data from `v_dashboard_portfolio` view
- ✅ **Auto-refresh**: Dashboard data refreshes every 30 seconds automatically
- ✅ **Persian Timestamps**: All timestamps displayed in Persian (fa-IR) locale
- ✅ **Comprehensive API**: New `/api/dashboard/comprehensive-real` endpoint for consolidated data

### Changed

- 🔄 **Dashboard Simplified**: Reduced from 15+ widgets to 4 core widgets
  - Portfolio (Balance, PnL, Win Rate, Sharpe Ratio)
  - Market Overview (BTC/ETH prices, Fear & Greed, BTC Dominance)
  - System Monitor (Health, Trading Activity, Risk Management)
  - Portfolio Chart (Performance visualization)
- 🔄 **Static File Serving**: Fixed routing to properly serve root-level JS/CSS files
- 🔄 **Module Loading**: Improved module registration system for dashboard components
- 🔄 **API Paths**: Fixed double `/api/api` prefix issues in all endpoints

### Removed

- ❌ **AI Agents**: Removed all 15 AI agent modules and their dependencies
- ❌ **Experimental Features**:
  - Artemis Status widget
  - Learning Progress section (courses, levels, sessions)
  - Widget Library feature (add/remove/clear buttons)
  - Agents Performance chart
  - Trading Volume chart
  - Recent Activities section
  - Drag-and-drop customization
- ❌ **Legacy Widget System**: Removed widgets-integration.js, legacy-annotator.js, safe-mode.js
- ❌ **Mock Data**: All hardcoded mock values replaced with real data or loading states

### Fixed

- 🐛 **Authentication Flow**: Fixed `/api/auth/login` and `/api/auth/verify` endpoints
- 🐛 **Static Files**: Fixed Cloudflare cache issues causing 404 errors
- 🐛 **Module Registration**: Fixed DashboardModule not found error
- 🐛 **API Prefix**: Fixed double `/api/api` prefix in dashboard API calls
- 🐛 **File Serving**: Fixed routing for root-level JavaScript and CSS files

### Technical Details

#### Backend Changes

- Modified `/api/dashboard/comprehensive-real` endpoint in `server.js`
- Added parallel external API calls with `Promise.allSettled`
- Implemented graceful fallbacks for all API failures
- Enhanced chart data generation with realistic historical simulation

#### Frontend Changes

- Cleaned `dashboard.js` to 607 lines (from 2000+ lines)
- Updated `app.js` to fix auth endpoint paths
- Fixed `index.html` to remove experimental script references
- Improved `module-loader.js` with proper cache busting

#### Files Modified

- `public/static/modules/dashboard.js` (-1393 lines, +607 lines)
- `public/static/modules/app.f5839b97.js` (auth path fixes)
- `public/index.html` (removed AI agent scripts)
- `server.js` (static file serving improvements)
- `public/static/modules/module-loader.89cb3ab0.js` (cache busting)

### Commits in this Release

1. `3fdefd7` - feat(dashboard): Phase 1 & 2 Complete - Clean 4-widget dashboard
2. `3dbbb02` - fix(cache): Force browser cache refresh
3. `7b9760d` - docs: Add comprehensive Persian testing instructions
4. `fee1c65` - feat: Phase 1 ACTUAL CLEANUP - Remove ALL experimental features
5. `aac8c02` - feat(cleanup): Remove ALL AI agent files and legacy widget system
6. `f984444` - fix(server): Serve root-level JS/CSS files correctly
7. `8afb020` - fix(server): Proper static file serving for root-level files
8. `38cfd87` - fix(app): Add /api prefix to auth endpoints
9. `d891824` - fix: Add app.f5839b97.js to modules directory
10. `93349fc` - fix(app): Remove /api prefix causing double /api/api paths
11. `68abbea` - fix(dashboard): Register DashboardModule in window.TitanModules
12. `b1c4f4a` - fix(dashboard): Remove /api prefix from comprehensive-real endpoint

### Breaking Changes

⚠️ **Dashboard Structure**: The new simplified dashboard is not backward compatible with the old widget system. All experimental features have been permanently removed.

### Migration Guide

No migration needed for users - this is a frontend-only change. All backend APIs remain compatible.

### Testing

- ✅ Backend `/api/dashboard/comprehensive-real` verified with curl
- ✅ Frontend dashboard loads and displays real data
- ✅ Auto-refresh working every 30 seconds
- ✅ All 4 core widgets functioning correctly
- ✅ Chart rendering with Chart.js
- ✅ Persian timestamps displaying correctly

### Known Issues

- Cloudflare cache may need manual purge after deployment
- Some old documentation files reference removed features

### Credits

- **Development**: GenSpark AI Developer
- **Testing**: User verification on production (https://zala.ir)
- **API Integration**: MEXC, alternative.me (Fear & Greed), CoinGecko (BTC Dominance)

---

## [3.0.0] - Previous Version

See git history for changes prior to this release.
