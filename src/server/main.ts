import * as util from '../common/util';

import { ServerView } from './server-view';
import { Server } from './server';
import { ClockPlugin } from './plugins/clock-plugin';
import { WebMUDServerPlugin } from './webmud-server-plugin';
import { HelpCommandPluggin } from './plugins/help-command-plugin';
import { ClientBehaviorPlugin } from './plugins/client-behavior-plugin';
import { SaveStatePlugin } from './plugins/savestate-plugin';
import { NPCGreeterPlugin } from './plugins/npc-greeter-plugin';
import { NPCPlugin } from './plugins/npc-plugin';

const PLUGINS = [
  new ClientBehaviorPlugin(),
  new HelpCommandPluggin(),
  new ClockPlugin(),
  new SaveStatePlugin(),
  new NPCPlugin(),
  new NPCGreeterPlugin(),
];

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
    joinURL: document.getElementById('joinURL') ?? undefined,
    joinLink: document.getElementById('joinLink') ?? undefined,
    server,
    devMode,
  });

  server.startDiscovery();
  return server;
}
