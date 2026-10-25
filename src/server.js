require('dotenv').config();
const app = require('./app');

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 SIRKULA (DEMO) server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Mode:        demo-localstorage (no database)`);
  console.log(`   API:         http://localhost:${PORT}/api/v1`);
  console.log(`   UI:          http://localhost:${PORT}/index.html`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

module.exports = server;
