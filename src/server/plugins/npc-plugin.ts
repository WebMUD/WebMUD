import { Component } from "../gamestate/components/base/component";
import { Server } from "../server";
import { WebMUDServerPlugin } from "../webmud-server-plugin";

export class NPCComponent extends Component {}

export class NPCPlugin extends WebMUDServerPlugin {
    init(server: Server) {
        
    }
}