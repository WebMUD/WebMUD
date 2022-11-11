import * as util from '../common/util';

import { ServerView } from './server-view';
import { Server } from './server';

import * as commands from './plugins/commands';
import { mapEdit } from './plugins/map-edit';

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

const server = (window.server = new Server('my game', {
  plugins: [
    commands.util,
    commands.world,
    mapEdit,
  ]
}));

window.serverView = new ServerView({
  output: el.output,
  input: el.input,
  debug: el.debug,
  server,
});


const world = server.gamestate.createWorld('World');
const rooms = {
  start: server.gamestate.createRoom('Welcome Room', 'Nothing to see here.', world),
  north: server.gamestate.createRoom('North Room', 'A room to the north.', world),
};

server.gamestate.connectNorthSouth(rooms.north, rooms.start);

server.init(world, rooms.start);

server.start();
