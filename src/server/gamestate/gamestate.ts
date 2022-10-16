import { Entity, EntityID } from "./entity";
import { Manager } from "./manager";

import { Name } from "./components/name";
import { HierarchyContainer } from "./components/hierarchy-container";
import { HierarchyChild } from "./components/hierarchy-child";
import { Adjacent } from "./components/adjacent";
import { Description } from "./components/description";
import { Player } from "./components/player";
import { Room } from "./components/room";
import { Prop } from "./components/prop";
import { Item } from "./components/item";
import { EntityError } from "./entity-error";

export class Gamestate extends Manager {
    /**
     * Create a player entity
     * @param name 
     */
    createPlayer(name: string): EntityID {
        const e = this.createEntity();
        this.entity(e)
            .add(new Name(name))
            .add(new Player())
            .add(new HierarchyChild())
            .add(new HierarchyContainer())
        return e;
    }

    /**
     * Create a world entity
     * @param name 
     */
    createWorld(name: string): EntityID {
        const e = this.createEntity();
        this.entity(e)
            .add(new Name(name))
            .add(new HierarchyContainer())
        return e;
    }

    /**
     * Create a room entity
     * @param name 
     * @param description 
     * @param world the world entity this room belongs to
     */
    createRoom(name: string, description: string, world: EntityID): EntityID {
        const e = this.createEntity();
        this.entity(e)
            .add(new Name(name))
            .add(new Description(description))
            .add(new Room())
            .add(new Adjacent())
            .add(new HierarchyChild())
            .add(new HierarchyContainer())
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

    /**
     * Create a prop entity
     * @param name 
     * @param description 
     * @param container is this prop a container? can it hold other items?
     * @param item can this prop be picked up?
     */
    createProp(name: string, description: string, container: boolean = false, item: boolean = false): EntityID {
        const e = this.createEntity();
        this.entity(e)
            .add(new Name(name))
            .add(new Description(description))
            .add(new Prop())
            .add(new HierarchyChild())
        if (container) this.entity(e).add(new HierarchyContainer());
        if (item) this.entity(e).add(new Item());
        return e;
    }

    /**
     * Move an entity to a container
     * @param target the entity to move
     * @param parent the container to move it to
     */
    move(target: EntityID, parent: EntityID) {
        if (target === parent) throw new EntityError(this.entity(target), 'cannot move entity to itself');
        
        const hasOldParent = this.hasParent(target);

        if (hasOldParent) this.getParent(target).get(HierarchyContainer).children.delete(target);

        this.entity(target).get(HierarchyChild).parent = parent;
        this.entity(parent).get(HierarchyContainer).children.add(target);

        if (hasOldParent) this.getParent(target).get(HierarchyContainer).onLeave.emit(target);
        this.entity(parent).get(HierarchyContainer).onJoin.emit(target);
    }

    pickUp(player: EntityID, item: EntityID) {
        this.entity(player).require(Player);

        if (!this.entity(item).has(Item)) throw new EntityError(this.entity(item), 'cannot be picked up');
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

    hasParent(entity: EntityID): EntityID|false {
        if (!this.entity(entity).has(HierarchyChild)) return false;
        const id = this.entity(entity).get(HierarchyChild).parent;
        if (!id) return false;
        return id;
    }

    getParentID(entity: EntityID): EntityID {
        const parentID = this.hasParent(entity);
        if (!parentID) throw new EntityError(this.entity(entity), 'does not have a parent');
        return parentID;
    }

    getParent(entity: EntityID): Entity {
        return this.entity(this.getParentID(entity));
    }

    nameOf(entity: Entity|EntityID): string {
        if (typeof entity === 'string') entity = this.entity(entity);
        return entity.get(Name).data;
    }

    players(): Iterable<EntityID> {
        return this.filter(Player, Name, HierarchyChild);
    }

    rooms(): Iterable<EntityID> {
        return this.filter(Room, Name, Description, Adjacent, HierarchyChild, HierarchyContainer);
    }
}