import { ChatChannel, Name } from './gamestate/components';
import { LocalConnection } from '../common/connection/local-connection';
import { Server } from './server';
import { Gamestate } from './gamestate/gamestate';
import { ChatMessage } from './gamestate/components/chat-channel';
import { stringify } from 'querystring';

function mock(useConsole: boolean = false) {
  const server = new Server('Server');
  if (useConsole) server.useConsole();

  const world = server.gamestate.createWorld('Test World');
  const startingRoom = server.gamestate.createRoom(
    'Starting Room',
    'A boring room',
    world
  );

  server.init(world, startingRoom);

  const [serverConnection2, clientConnection2] = LocalConnection.create();

  function createClient(name: string) {
    const [serverConnection, clientConnection] = LocalConnection.create();
    const client = server.createClient(serverConnection, name);

    return {
      client,
      serverConnection,
      clientConnection,
    };
  }

  return {
    server,
    world,
    startingRoom,
    createClient,
    player1: createClient('Player1'),
    player2: createClient('Player2'),
  };
}

test('Server', () => {
  const { server, world, startingRoom, player1 } = mock(false);
});

test('Chat', () => {
  const { server, world, startingRoom, player1, player2 } = mock(false);

  const msgData = {
    senderID: player1.client.player,
    senderName: server.gamestate.nameOf(player1.client.player),
    content: 'test',
  };

  let msg: { msg: ChatMessage; verb: string } | null = null;
  player2.client.onMessage(data => (msg = data));

  // test room chat
  msg = null;
  player1.client.sendChat(startingRoom, 'test');
  expect(msg).toStrictEqual({ msg: msgData, verb: 'says' });

  // test whisper chat
  msg = null;
  player1.client.sendChat(player2.client.player, 'test');
  expect(msg).toStrictEqual({ msg: msgData, verb: 'whispers' });

  // test world chat
  msg = null;
  player1.client.sendChat(world, 'test');
  expect(msg).toStrictEqual({ msg: msgData, verb: 'shouts' });
});
