import { createServer } from './main';

window.setTimeout(() => {
  const server = createServer(false, []);

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
});
