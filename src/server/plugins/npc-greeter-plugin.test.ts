import { ChatChannel, Player } from '../gamestate/components';
import { Entity, EntityID } from '../gamestate/entity';
import { Gamestate } from '../gamestate/gamestate';
import { Server } from '../server';
import { NPCGreeterComponent, NPCGreeterPlugin } from './npc-greeter-plugin';

function mock() {
  const greeterPlugin = new NPCGreeterPlugin();
  const PLUGINS = [greeterPlugin];

  const server = new Server('my game', {
    plugins: [...PLUGINS],
  });

  const gs = server.gs;

  const world = gs.createWorld('test');
  const room1 = gs.createRoom('room1', '', world);
  const room2 = gs.createRoom('room2', '', world);
  gs.connectNorthSouth(room1, room2);

  return {
    server,
    greeterPlugin,
    gs,
    world,
    room1,
    room2,
  };
}

test('NpcGreeterPlugin', () => {
  const { server, greeterPlugin, gs, world, room1, room2 } = mock();

  const messageArray = ['testmessage', 'test2'];

  const npc = greeterPlugin.create('test', 1, messageArray);
  const player = gs.createPlayer('test');
  const player2 = gs.createPlayer('test2');

  gs.entity(player)
    .get(ChatChannel)
    .event(msg => {
      expect(messageArray).toContain(msg.content);
      // expect(msg.content).toBe('testmessage');
    });

  gs.entity(player2)
    .get(ChatChannel)
    .event(msg => {
      expect(messageArray).toContain(msg.content);
      // expect(msg.content).toBe('message');
    });

  gs.move(npc, room1);
  gs.move(player, room1);
  expect(
    server.gs
      .entity(npc)
      .get(NPCGreeterComponent)
      .greeted.has(server.gs.entity(player).id)
  ).toBe(true);
  gs.move(player2, room2);
});
