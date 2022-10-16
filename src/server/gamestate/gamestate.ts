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
    //TODO: make a real test
    test() {
        // bind this to this.nameOf so we can use it as a standalone function later
        const nameOf = this.nameOf.bind(this);

        const world = this.createWorld('World');
        const room1 = this.createRoom('Room 1', 'The first room.', world);
        const room2 = this.createRoom('Room 1', 'The second room.', world);
        const room3 = this.createRoom('Room 3', 'The third room.', world);
        this.connectEastWest(room1, room2);
        this.connectNorthSouth(room2, room3);

        const player = this.createPlayer('Player 1');
        this.move(player, room1);

        for (const playerX of this.players()) {
            this.entity(playerX).get(HierarchyContainer).onJoin((entity)=>{
                console.log(`--> EVENT: ${this.nameOf(playerX)} picked up ${this.nameOf(entity)}`)
            })
        }

        const backpack = this.createProp('Backpack', 'A backpack', true, true);
        const notebook = this.createProp('Notebook', 'A notebook', false, true);
        const desk = this.createProp('Desk', 'Very heavy', true, false);

        this.move(backpack, room1);
        console.log('room 1 should have Player 1 and Backpack');
        console.log(
            'Room 1 contains', this.getChildren(room1).map(nameOf),
        );

        this.move(notebook, backpack);
        console.log('Backpack should have Notebook');
        console.log(
            'Backpack contains', this.getChildren(backpack).map(nameOf)
        );

        this.pickUp(player, notebook);
        console.log('Player 1 should have Notebook');
        console.log(
            'Player 1 has', this.getChildren(player).map(nameOf)
        );
        
        console.log('Player 1 should own Notebook');
        console.log(
            'Notebook owned by', this.nameOf(this.getParent(notebook))
        );

        console.log('rooms', Array.from(this.rooms()).map(nameOf))

        console.log('expect error');
        this.pickUp(player, desk);
    }

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
            .add(new HierarchyChild(world))
            .add(new HierarchyContainer())
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
        const mustExit = this.hasParent(target);

        if (mustExit) this.getParent(target).get(HierarchyContainer).children.delete(target);

        this.entity(target).get(HierarchyChild).parent = parent;
        this.entity(parent).get(HierarchyContainer).children.add(target);

        if (mustExit) this.getParent(target).get(HierarchyContainer).onLeave.emit(target);
        this.entity(parent).get(HierarchyContainer).onJoin.emit(target);
    }

    pickUp(player: EntityID, item: EntityID) {
        this.entity(player).require(Player);

        if (!this.entity(item).has(Item)) throw new EntityError(this.entity(item), 'cannot be picked up');
        this.move(item, player);
    }

    getChildren(entity: EntityID): Entity[] {
        this.entity(entity).require(HierarchyContainer);
        const getEntity = (x: EntityID) => this.entity(x);
        return Array.from(this.entity(entity).get(HierarchyContainer).children).map(getEntity);
    }

    hasParent(entity: EntityID): EntityID|false {
        if (!this.entity(entity).has(HierarchyChild)) return false;
        const id = this.entity(entity).get(HierarchyChild).parent;
        if (!id) return false;
        return id;
    }

    getParent(entity: EntityID): Entity {
        const parentID = this.hasParent(entity);
        if (!parentID) throw new EntityError(this.entity(entity), 'does not have a parent');
        return this.entity(parentID);
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