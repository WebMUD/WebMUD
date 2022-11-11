import * as util from '../common/util';

import { ServerView } from './server-view';
import { Server } from './server';
import { ClockPlugin } from './plugins/clock-plugin';
import { WebMUDServerPlugin } from './webmud-server-plugin';
import { HelpCommandPluggin } from './plugins/help-command-plugin';

const PLUGINS = [new HelpCommandPluggin(), new ClockPlugin()];

declare global {
  interface Window {
    serverView: ServerView;
    server: Server;
  }
}

export function createServer(
  devMode: boolean = false,
  plugins: WebMUDServerPlugin[] = []
) {
  const el = util.getElements({
    output: 'console-output',
    input: 'console-input',
    debug: 'enable-debug',
  });

  const server = (window.server = new Server('my game', {
    plugins: [...PLUGINS, ...plugins],
  }));

  window.serverView = new ServerView({
    output: el.output,
    input: el.input,
    debug: el.debug,
    server,
    devMode,
  });

  server.startDiscovery();
  return server;
}
