module.exports = {
  apps: [
    {
      name: 'titan-trading',
      script: 'npx', 
      args: 'wrangler pages dev dist --d1=webapp-production --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
}
