import { DataType } from "ajv/dist/compile/validate/dataType";
import { TIMEOUT } from "dns";
import { ChatChannel, HierarchyChild, HierarchyContainer, Name, Player } from "../gamestate/components";
import { Component } from "../gamestate/components/base/component";
import { Entity, EntityID } from "../gamestate/entity";
import { Server } from "../server";
import { WebMUDServerPlugin } from "../webmud-server-plugin"
import { NPCComponent } from "./npc-plugin";


export class NPCGreeterComponent extends Component {
    // "%p" replaced with player name
    message: String[] = [];

    greeted=new Set<EntityID>();

    constructor(message: string | string[]) {
        super();
        if (typeof message === 'string' ){
        
        this.message.push(message);
        return;}

        var length = message.length;
        for (var i = 0; i<length; i++) {
            message.push(message[i]);
        }
    }
}

export class NPCGreeterPlugin extends WebMUDServerPlugin {
    server: Server;

    init(server: Server) {
        this.server = server;
        const self = this;
        // add create-npc-greeter command
        server.commands.addCommand({
            command: 'create-npc-greeter',
            alias: ['cnpc-greeter'],
            usage: 'create-npc-greeter <name> <message>',
            about: 'create a greeter npc',
      
            use(argv: string[]) {
                const name = argv.shift();
                const message = argv.shift();
                if (!name) return server.error(`Missing value for name`);
                if (!message) return server.error(`Missing value for message`);
                self.create(name, message);
                server.info(`Created NPC ${name}`);
            },
        });
    }

    create(name: string, message: string | string[]) {
        // create entity
        const e = this.server.gs.createEntity();
        this.server.gs.entity(e)
          .add(new Name(name))
          .add(new NPCComponent())
          .add(new HierarchyChild())
          .add(new HierarchyContainer());
        if (typeof message === 'string') {
        this.server.gs.entity(e).add(new NPCGreeterComponent(message));
        this.server.gs.entity(e).get(HierarchyChild).onMove(() => this.onNPCMove(e));
        return e;}

        var length = message.length;
        for (var i = 0; i<length; i++) {
            this.server.gs.entity(e).add(new NPCGreeterComponent(message[i]));
        }

        this.server.gs.entity(e).get(HierarchyChild).onMove(() => this.onNPCMove(e));
        return e;
    }
    sendMessageArray(e: EntityID, target: EntityID, greeterComponent: NPCGreeterComponent, i: number) {
        this.server.gs.entity(target).get(ChatChannel).event.emit({
        senderID: e,
        senderName: this.server.gs.nameOf(e),
        content: greeterComponent.message[i].replace("%p", this.server.gs.nameOf(target))
    });}

// Hardcoding delay at 1 second for testing purposes, can add variable for it later
    onNPCMove(e: EntityID, delay: number = 100) {
        const parent = this.server.gs.getParent(e);
        const stop = parent.get(HierarchyContainer).onJoin((target: EntityID) => {
            if (!(this.server.gs.entity(target).has(Player) && this.server.gs.entity(target).has(ChatChannel))) return;
            const greeterComponent = this.server.gs.entity(e).get(NPCGreeterComponent);
            if (greeterComponent.greeted.has(target)) return;
            greeterComponent.greeted.add(target);

            var length = greeterComponent.message.length;
            for (var i = 0; i<length; i++) {
                // add wait logic
                setTimeout(this.sendMessageArray, i*delay, e, target, greeterComponent, i);
        };    
        this.server.gs.entity(e).get(HierarchyChild).onMove.once(stop);
      })
    };
}