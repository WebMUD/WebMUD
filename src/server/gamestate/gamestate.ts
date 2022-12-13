import _ from 'lodash';
import {
  HierarchyChild,
  HierarchyContainer,
  Name,
  Player,
  Description,
  Room,
  Adjacent,
  Item,
  Prop,
  ChatChannel,
  World,
  EntryRoom,
} from './components';
import { Entity, EntityID } from './entity';
import { EntityError } from './entity-error';
import { Manager } from './manager';

/**
 * Holds and manipulates the current game state
 */
export class Gamestate extends Manager {
  public constructor() {
    super();
    this.defineComponent(
      HierarchyChild,
      HierarchyContainer,
      Name,
      Player,
      Description,
      Room,
      EntryRoom,
      Adjacent,
      Item,
      Prop,
      ChatChannel,
      World
    );
  }

  /**
   * Create a player entity
   * @param name
   */
  createPlayer(name: string): EntityID {
    if (this.findPlayer(name))
      throw new Error(`A player by the name ${name} already exists`);

    const e = this.createEntity();
    this.entity(e)
      .add(new Name(name))
      .add(new Player())
      .add(new HierarchyChild())
      .add(new HierarchyContainer())
      .add(new ChatChannel());
    return e;
  }

  /**
   * Create a world entity
   * @param name
   */
  createWorld(name: string): EntityID {
    if (this.findWorld(name))
      throw new Error(`A world by the name ${name} already exists`);

    const e = this.createEntity();
    this.entity(e)
      .add(new Name(name))
      .add(new HierarchyContainer())
      .add(new ChatChannel())
      .add(new World());
    return e;
  }

  /**
   * Create a room entity
   * @param name
   * @param description
   * @param world the world entity this room belongs to
   */
  createRoom(name: string, description: string, world: EntityID): EntityID {
    if (this.findRoom(name))
      throw new Error(`A room by the name ${name} already exists`);

    const e = this.createEntity();
    this.entity(e)
      .add(new Name(name))
      .add(new Description(description))
      .add(new Room())
      .add(new Adjacent())
      .add(new HierarchyChild())
      .add(new HierarchyContainer())
      .add(new ChatChannel());
    this.move(e, world);
    return e;
  }

  connectNorthSouth(north: EntityID, south: EntityID) {
    this.entity(north).get(Adjacent).south = south;
    this.entity(south).get(Adjacent).north = north;
  }

  connectEastWest(east: EntityID, west: EntityID) {
    this.entity(east).get(Adjacent).west = west;
    this.entity(west).get(Adjacent).east = east;
  }

  connectUpDown(up: EntityID, down: EntityID) {
    this.entity(up).get(Adjacent).down = down;
    this.entity(down).get(Adjacent).up = up;
  }

  adjacent(e: EntityID) {
    return this.entity(e).get(Adjacent);
  }
  /**
   * Create a static prop entity
   * Props cannot be picked up
   * @param name
   * @param description
   * @param container is this prop a container? can it hold other items?
   */
  createProp(
    name: string,
    description: string,
    container: boolean = false
  ): EntityID {
    const e = this.createEntity();
    this.entity(e)
      .add(new Name(name))
      .add(new Description(description))
      .add(new Prop())
      .add(new HierarchyChild());
    if (container) this.entity(e).add(new HierarchyContainer());
    return e;
  }

  /**
   * Create an item entity
   * Items can be picked up
   * @param name
   * @param description
   * @param container is this prop a container? can it hold other items?
   */
  createItem(
    name: string,
    description: string,
    container: boolean = false
  ): EntityID {
    const e = this.createEntity();
    this.entity(e)
      .add(new Name(name))
      .add(new Description(description))
      .add(new Prop())
      .add(new Item())
      .add(new HierarchyChild());
    if (container) this.entity(e).add(new HierarchyContainer());
    return e;
  }

  /**
   * Move an entity to a container
   * @param target the entity to move
   * @param parent the container to move it to
   */
  move(target: EntityID, parent: EntityID | undefined) {
    if (target === parent)
      throw new EntityError(
        this.entity(target),
        'cannot move entity to itself'
      );

    if (parent && !this.entity(parent).has(HierarchyContainer)) throw new Error(`parent is not a container`);
    if (!this.entity(target).has(HierarchyChild)) throw new Error(`target is not a child`);

    let oldParent: EntityID | undefined;
    const hasOldParent = this.hasParent(target);

    if (hasOldParent) {
      if (this.getParentID(target) === parent) return;
      this.getParent(target).get(HierarchyContainer).children.delete(target);
      oldParent = this.getParentID(target);
    }

    this.entity(target).get(HierarchyChild).parent = parent;
    if (parent)
      this.entity(parent).get(HierarchyContainer).children.add(target);

    if (hasOldParent && oldParent)
      this.entity(oldParent).get(HierarchyContainer).onLeave.emit(target);
    if (parent) this.entity(parent).get(HierarchyContainer).onJoin.emit(target);
    this.entity(target).get(HierarchyChild).onMove.emit();
  }

  pickUp(player: EntityID, item: EntityID) {
    this.entity(player).require(Player);

    if (!this.entity(item).has(Item))
      throw new EntityError(this.entity(item), 'cannot be picked up');
    this.move(item, player);
  }

  getChildrenIDs(entity: EntityID): EntityID[] {
    this.entity(entity).require(HierarchyContainer);
    return Array.from(this.entity(entity).get(HierarchyContainer).children);
  }

  getChildren(entity: EntityID): Entity[] {
    const getEntity = (x: EntityID) => this.entity(x);
    return this.getChildrenIDs(entity).map(getEntity);
  }

  hasParent(entity: EntityID): EntityID | false {
    if (!this.entity(entity).has(HierarchyChild)) return false;
    const id = this.entity(entity).get(HierarchyChild).parent;
    if (!id) return false;
    return id;
  }

  getParentID(entity: EntityID): EntityID {
    const parentID = this.hasParent(entity);
    if (!parentID)
      throw new EntityError(this.entity(entity), 'does not have a parent');
    return parentID;
  }

  getParent(entity: EntityID): Entity {
    return this.entity(this.getParentID(entity));
  }

  nameOf(entity: Entity | EntityID): string {
    if (typeof entity === 'string') entity = this.entity(entity);
    return entity.get(Name).data;
  }

  players(): Iterable<EntityID> {
    return this.filter(Player, Name, HierarchyChild);
  }

  worlds(): Iterable<EntityID> {
    return this.filter(World, Name);
  }

  rooms(): Iterable<EntityID> {
    return this.filter(
      Room,
      Name,
      Description,
      Adjacent,
      HierarchyChild,
      HierarchyContainer
    );
  }

  nameEqual(a: string, b: string) {
    return (
      a.toLowerCase().replace(/\ /g, '-') ===
      b.toLocaleLowerCase().replace(/\ /g, '-')
    );
  }

  findByName(entities: Iterable<EntityID>, name: string) {
    for (const x of entities)
      if (this.nameEqual(this.nameOf(x), name)) return x;
    return undefined;
  }

  findWorld(name: string): EntityID | undefined {
    return this.findByName(this.worlds(), name);
  }

  findRoom(name: string): EntityID | undefined {
    return this.findByName(this.rooms(), name);
  }

  findPlayer(name: string): EntityID | undefined {
    return this.findByName(this.players(), name);
  }

  getByName(name: string) {
    return this.findByName(this.filter(Name), name);
  }

  scrub() {
    for (const e of this.all()) this._scrub(e);
  }

  _scrub(entity: EntityID) {
    if (this.entity(entity).has(HierarchyContainer)) {
      const children = this.entity(entity).get(HierarchyContainer).children;
      for (const child of children) {
        if (!this.entityExists(child)) {
          console.warn(
            `scrubbing reference to ${child} in ${entity} (${this.nameOf(
              entity
            )})`
          );
          children.delete(child);
          console.log(children);
        }
      }
    }

    if (this.entity(entity).has(HierarchyChild)) {
      const parent = this.entity(entity).get(HierarchyChild).parent;
      if (parent) {
        if (!this.entityExists(parent)) {
          console.warn(
            `scrubbing reference to ${parent} in ${entity} (${this.nameOf(
              entity
            )})`
          );
          this.entity(entity).get(HierarchyChild).parent = undefined;
        }
      }
    }
  }

  /**
   * Find by name or ID
   */
  find(x: string): string | false {
    if (this.entityExists(x)) return x;
    const e = this.getByName(x);
    if (e) return e;
    return false;
  }

  moveAllPlayers(target: EntityID | undefined) {
    for (const player of this.filter(Player)) {
      this.move(player, target);
    }
  }
}
