import Peer from 'peerjs';
import { Connection } from '../common/connection/connection';
import { ConnectionBase, ConnectionStatus } from '../common/connection/connection-base';
import { Logger } from '../common/logger';
import { Frame, FrameMessage, frames, FrameSendCommand } from '../common/frames';
import { EventEmitter } from '../common/event-emitter';
import { ClientView } from './client-view';
import * as Parser from './parser/parser';
import { DropCommand, LookCommand, ExitCommand, HelpCommand, InventoryCommand, MoveCommand, SayCommand, TakeCommand, WhisperCommand } from './parser/commands';
import { Player } from '../server/gamestate/components';
import { Server } from '../server/server';
import { EntityID } from '../server/gamestate/entity';
import { ChatChannel, ChatMessage } from "../server/gamestate/components/chat-channel"
import {
  HierarchyChild,
  HierarchyContainer,
  Name,
} from '../server/gamestate/components';
import { dir } from 'console';

export class Client extends Logger {
  public connection: ConnectionBase;
  public onReady = EventEmitter.channel<void>();
  public onMessage = EventEmitter.channel<{ msg: ChatMessage; verb: string }>();
  public player: EntityID;
  public server: Server;
  

  constructor( 
  ) {
    super();
    this.onReady(() =>{
      this.print("Please enter a username.");
      const stop = this.onInput((data)=>{
        if(!this.containsWhitespace(data) && data !== "")
        {
          this.join(data);
          stop();
          this.startListening();
          this.print("USERNAME: " + data);
        }
      }) 
    });
  }

  
  startListening(){
    this.onInput((data)=>{
      data = data.toLowerCase();
      this.read(data);
    });
  }
  
  containsWhitespace(input:string){
    return /\s/.test(input);
  }

  read(input: string) {
    var result = this.parse(input);
    
    if(result instanceof MoveCommand)
    {
      this.sendFrame(new FrameSendCommand('move', [{name: 'direction', value: result.text}]));
    }
    else if(result instanceof SayCommand)
    {
     this.sendFrame(new FrameSendCommand('say', [{name: 'message', value: result.text}]));
    }
    else if(result instanceof HelpCommand)
    {
      this.sendFrame(new FrameSendCommand('help', [{name: 'command', value: result.commandName}]));
    }
    else if(result instanceof LookCommand)
    {
      this.sendFrame( new FrameSendCommand('look', []));
    }
    else if(result instanceof ExitCommand)
    {
      this.sendFrame(new FrameSendCommand('exits', []));     
    }
    else if(result instanceof InventoryCommand)
    {
      this.sendFrame(new FrameSendCommand('inventory', []));    
    }
    else if(result instanceof TakeCommand)
    {
      this.sendFrame(new FrameSendCommand('take', [{name: 'item', value: result.text}]));    
    }
    else if(result instanceof DropCommand)
    {
      this.sendFrame(new FrameSendCommand('drop', [{name: 'item', value: result.text}]));   
    }
    else if(result instanceof WhisperCommand)
    {
      this.sendFrame(new FrameSendCommand('whisper', [{name: 'message', value: result.text}, {name: 'username', value: result.username}]));
    }
  }

   parse(input: string) {
    const { ast, errs } = Parser.parse(input);
    if (errs.length) {
      for (const error of errs) {
        console.error(error);
        console.error(error.toString());
      }
      this.error("Could not parse input: " + input)
      throw new Error(`error while parsing ${input}`);
    }
  
    if (!ast) throw new Error('missing ast');
    if (!ast.command) throw new Error('missing command');
  
    return ast.command;
  }


  public sendFrame(frame: Frame) {
    const data = frame.serialize();
    if (!this.connection || this.connection.status !== ConnectionStatus.OK)
      throw new Error('connection not available');
    this.connection.send(data);
  }

  
  public sendCommandFrame( text: string, args: any) {
    this.sendFrame(new FrameSendCommand(text, args));
  }

  connect(id: string) {
    this.info(`Joining server ${id}`);
    const peer = new Peer();
    peer.on('open', () => {
      const conn = peer.connect(id, Client.peerOptions);
      conn.on('open', () => this.useConnection(new Connection(conn)));
    });
  }

  useConnection(connection: ConnectionBase) {
    this.connection = connection;

    this.debug('connection opened');

    const close = this.connection.onData(data => {
      const frame = frames.parse(data);
      if (!frame) throw new Error('Unable to parse incoming data: ' + data);
      
      // handle incoming data
      // console.log(frame);

     
  
      if (frame instanceof FrameMessage) return this.message(frame);

      throw `Unexpected ${frame.type} frame`;
    });

    this.onReady.emit();
  }

  message(frame: FrameMessage) {
    this.printFormat(
      ...frame.parts.map(part => ClientView.format(part.text, ...part.format))
    );
  }

  join(username: string) {
    this.debug(`connecting as ${username}...`);
    const frameConnect = new frames.FrameConnect(username);
    this.connection.send(frameConnect.serialize());
  }


  static peerOptions = {
    reliable: true,
  };

  
}
