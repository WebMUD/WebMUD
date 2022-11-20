import { ChatChannel } from "../gamestate/components";
import { Gamestate } from "../gamestate/gamestate";
import { Server } from "../server";
import { NPCGreeterPlugin } from "./npc-greeter-plugin";

function mock() {
    const greeterPlugin = new NPCGreeterPlugin();
    const PLUGINS = [
        greeterPlugin,
    ];

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
    }

}

test('NpcGreeterPlugin', () => {
  const {
        server,
        greeterPlugin,
        gs,
        world,
        room1,
        room2,
    } = mock();

    const npc = greeterPlugin.create('test', 'testmessage');
    const player = gs.createPlayer('test');

    gs.entity(player).get(ChatChannel).event((msg)=>{
        // console.log(msg);
        expect(msg.content).toBe('testmessage');
    });

    gs.move(npc, room1);
    gs.move(player, room1);
});
