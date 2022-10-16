import * as util from '../common/util';

import { ServerView } from './server-view';
import { Server } from './server';

declare global {
  interface Window {
    serverView: ServerView;
    server: Server;
  }
}

const el = util.getElements({
  output: 'console-output',
  input: 'console-input',
  debug: 'enable-debug',
});

const server = window.server = new Server('my game', {});

window.serverView = new ServerView({
  output: el.output,
  input: el.input,
  debug: el.debug,
  server,
});

server.init();