import { HierarchyChild, World } from './components';
import { HierarchyContainer } from './components/hierarchy-container';
import { Gamestate } from './gamestate';

function mock() {
  const gs = new Gamestate();

  const world = gs.createWorld('World');
  const rooms = {
    r1: gs.createRoom('Room 1', 'The first room.', world),
    r2: gs.createRoom('Room 2', 'The second room.', world),
    r3: gs.createRoom('Room 3', 'The third room.', world),
  };

  const props = {
    backpack: gs.createItem('Backpack', 'A backpack', true),
    notebook: gs.createItem('Notebook', 'A notebook', false),
    desk: gs.createProp('Desk', 'Very heavy', true),
  };

  gs.connectEastWest(rooms.r1, rooms.r2);
  gs.connectNorthSouth(rooms.r2, rooms.r3);

  const player = gs.createPlayer('Player 1');
  gs.move(player, rooms.r1);
  gs.move(props.notebook, props.backpack);
  gs.move(props.backpack, rooms.r1);

  return { gs, world, player, rooms, props };
}

test('Gamestate#hierarchy', () => {
  const { gs, world, player, rooms, props } = mock();

  expect(gs.getChildrenIDs(world)).toContain(rooms.r1);
  expect(gs.getParentID(rooms.r1)).toBe(world);

  const nameOf = gs.nameOf.bind(gs);
  expect(gs.getChildrenIDs(rooms.r1)).toContain(player);
  expect(gs.getChildrenIDs(rooms.r1)).toContain(props.backpack);
  expect(gs.getChildrenIDs(props.backpack)).toContain(props.notebook);

  gs.move(player, rooms.r2);
  expect(gs.getChildrenIDs(rooms.r1)).not.toContain(player);
  expect(gs.getChildrenIDs(rooms.r2)).toContain(player);

  gs.pickUp(player, props.notebook);
  expect(gs.getChildrenIDs(player)).toContain(props.notebook);

  expect(() => gs.pickUp(player, props.desk)).toThrow();
  expect(() => gs.pickUp(player, player)).toThrow();

  expect(Array.from(gs.players())).toContain(player);
  expect(Array.from(gs.rooms())).toContain(rooms.r1);
});

test('Gamestate#events', () => {
  const { gs, world, player, rooms, props } = mock();

  let run = 0;

  gs.entity(player)
    .get(HierarchyContainer)
    .onJoin(entity => {
      expect(entity).toBe(props.notebook);
      run++;
    });

  gs.entity(props.backpack)
    .get(HierarchyContainer)
    .onLeave(entity => {
      expect(entity).toBe(props.notebook);
      run++;
    });

  gs.entity(props.notebook)
    .get(HierarchyChild)
    .onMove(_ => {
      run++;
    });

  gs.pickUp(player, props.notebook);

  expect(run).toBe(3);
});

test('Gamestate#seralize', () => {
  const { gs, world, player, rooms, props } = mock();

  const result = gs.seralize();

  expect(result[world]).toEqual([
    { type: 'component-name', data: 'World' },
    {
      type: 'component-hierarchy-container',
      children: [rooms.r1, rooms.r2, rooms.r3],
    },
    { type: 'component-chat-channel' },
    { type: 'component-world' },
  ]);

  const gs2 = new Gamestate();
  gs2.deseralize(result);
  expect(gs2.nameOf(world)).toBe('World');
  expect(gs2.nameOf(rooms.r1)).toBe('Room 1');
  expect(gs2.getParentID(rooms.r1)).toBe(world);
  expect(gs2.getChildrenIDs(rooms.r1)).toContain(player);
});
