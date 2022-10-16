import { HierarchyContainer } from "./components/hierarchy-container";
import { Gamestate } from "./gamestate";

function mock() {
    const gs = new Gamestate();

    const world = gs.createWorld('World');
    const rooms = {
        r1: gs.createRoom('Room 1', 'The first room.', world),
        r2: gs.createRoom('Room 1', 'The second room.', world),
        r3: gs.createRoom('Room 3', 'The third room.', world),
    };

    const props = {
        backpack: gs.createProp('Backpack', 'A backpack', true, true),
        notebook: gs.createProp('Notebook', 'A notebook', false, true),
        desk: gs.createProp('Desk', 'Very heavy', true, false),
    }

    gs.connectEastWest(rooms.r1, rooms.r2);
    gs.connectNorthSouth(rooms.r2, rooms.r3);

    const player = gs.createPlayer('Player 1');
    gs.move(player, rooms.r1);
    gs.move(props.notebook, props.backpack);
    gs.move(props.backpack, rooms.r1);

    return {gs, world, player, rooms, props};
}

test('Gamestate#hierarchy', () => {
  const {
    gs,
    world,
    player,
    rooms,
    props,
  } = mock();

  expect(gs.getChildrenIDs(world)).toContain(rooms.r1);
  expect(gs.getParentID(rooms.r1)).toBe(world);

  const nameOf = gs.nameOf.bind(gs);
  expect(gs.getChildrenIDs(rooms.r1)).toContain(player);
  expect(gs.getChildrenIDs(rooms.r1)).toContain(props.backpack);
  expect(gs.getChildrenIDs(props.backpack)).toContain(props.notebook);

  gs.move(player, rooms.r2);
  expect(gs.getChildrenIDs(rooms.r1)).not.toContain(player);
  expect(gs.getChildrenIDs(rooms.r2)).toContain(player);

  gs.move(props.notebook, player);
  expect(gs.getChildrenIDs(player)).toContain(props.notebook);

  expect(()=>gs.pickUp(player, props.desk)).toThrow();
  expect(()=>gs.pickUp(player, player)).toThrow();

  expect(Array.from(gs.players())).toContain(player);
  expect(Array.from(gs.rooms())).toContain(rooms.r1);
});

test('Gamestate#events', ()=>{
    const {
        gs,
        world,
        player,
        rooms,
        props,
    } = mock();

    let run = false;

    gs.entity(player).get(HierarchyContainer).onJoin((entity)=>{
        run = true;
    });

    gs.move(props.notebook, player);

    expect(run).toBe(true);
});