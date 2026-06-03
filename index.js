'use strict';

const createApp = require('./src/app');

const PORT = parseInt(process.env.PORT || '3000', 10);

const app = createApp();

app.listen(PORT, () => {
  console.log(`[Web Server] listening on port ${PORT}`);
  console.log(`[Ex-2 Client] will connect to ${process.env.EX2_HOST || '127.0.0.1'}:${process.env.EX2_PORT || '5555'}`);
});