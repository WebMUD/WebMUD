import { createServer } from './main';
import { Server } from './server';

window.setTimeout(() => {
  const server = createServer(false, []);
  server.startDiscovery();
});
