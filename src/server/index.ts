import * as util from '../common/util';

import { ServerView } from './server-view';
import { Server } from './server';
import { MapEditPlugin } from './plugins/map-edit-plugin';
import { ClockPlugin } from './plugins/clock-plugin';
import { WorldUtilPlugin } from './plugins/world-util-plugin';
import { UtilCommandsPlugin } from './plugins/util-commands-plugin';

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
    new UtilCommandsPlugin(),
    new ClockPlugin(),
    new WorldUtilPlugin(),
    new MapEditPlugin(),
  ],
}));

window.serverView = new ServerView({
  output: el.output,
  input: el.input,
  debug: el.debug,
  server,
});

const world = server.gamestate.createWorld('World');
const rooms = {
  start: server.gamestate.createRoom(
    'Welcome Room',
    'Nothing to see here.',
    world
  ),
  north: server.gamestate.createRoom(
    'North Room',
    'A room to the north.',
    world
  ),
};

server.gamestate.connectNorthSouth(rooms.north, rooms.start);

server.init(world, rooms.start);

server.startDiscovery();
