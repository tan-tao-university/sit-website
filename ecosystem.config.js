// PM2 process config — run all three apps in production.
// Build first (see README/commands), then: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'sit-backend',
      cwd: './backend',
      script: 'dist/src/main.js', // output of `pnpm build` (nest build)
      env: { NODE_ENV: 'production', PORT: 8080 },
    },
    {
      name: 'sit-app', // public site
      cwd: './app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'sit-dashboard', // admin
      cwd: './dashboard',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4000',
      env: { NODE_ENV: 'production' },
    },
  ],
};
