# PM2 Log Rotation Setup - Task-1 Complete

## Configuration Applied

### PM2 Ecosystem Config
- **File**: `ecosystem.config.js`
- **Cluster Mode**: 2 instances
- **Memory Limit**: 512M per instance
- **Log Paths**: `/home/ubuntu/logs/titan/{out,err}.log`

### PM2 Log Rotate Module
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
```

### Startup on Boot
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
```

## Verification

### PM2 Status
```
┌────┬──────────────────┬─────────┬─────────┬──────────┬────────┐
│ id │ name             │ mode    │ status  │ cpu      │ mem    │
├────┼──────────────────┼─────────┼─────────┼──────────┼────────┤
│ 0  │ titan-backend    │ cluster │ online  │ 0%       │ 65.9mb │
│ 1  │ titan-backend    │ cluster │ online  │ 0%       │ 66.1mb │
└────┴──────────────────┴─────────┴─────────┴──────────┴────────┘

Module
│ 2  │ pm2-logrotate    │ online  │ ✅
```

### Log Rotation Config
- **Max Size**: 10M per log file
- **Retention**: 30 archived log files
- **Compression**: gzip enabled (true)
- **Date Format**: YYYY-MM-DD_HH-mm-ss
- **Rotation Schedule**: Daily at midnight (0 0 * * *)

### Systemd Service
- **Service**: `pm2-ubuntu.service`
- **Status**: Enabled
- **Auto-start**: Yes (on boot)

## Testing
```bash
# Check PM2 status
pm2 status

# Check log rotation config
pm2 conf pm2-logrotate

# View logs
tail -f /home/ubuntu/logs/titan/out.log

# Test rotation manually
pm2 flush

# Check systemd service
systemctl status pm2-ubuntu
```

## Rollback
```bash
pm2 delete all
pm2 uninstall pm2-logrotate
cp ecosystem.config.js.backup ecosystem.config.js
pm2 start ecosystem.config.js
```

---
**Date**: 2025-10-25
**Status**: ✅ Complete
**Evidence**: Commit 31ca9f8 + pm2-logrotate configured
