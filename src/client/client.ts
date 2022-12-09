import Peer from 'peerjs';
import { Connection } from '../common/connection/connection';
import { ConnectionBase, ConnectionStatus } from '../common/connection/connection-base';
import { Logger } from '../common/logger';
import { Frame, FrameMessage, frames, FrameSendCommand } from '../common/frames';
import { EventEmitter } from '../common/event-emitter';
import { ClientView } from './client-view';
import * as Parser from './parser/parser';
import { DropCommand, ExamineCommand, ExitCommand, HelpCommand, InventoryCommand, MoveCommand, SayCommand, TakeCommand, WhisperCommand } from './parser/commands';
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
   
    this.onInput((data)=>{
      data = data.toLowerCase();
      this.read(data);
    });
  }
  
  read(...data: string[]) {
    var input = "";
    data.forEach(()=>{
      input += data;
    })
    var result = this.parse(input);
    console.log(result);
    
    if(result instanceof MoveCommand)
    {
     this.sendCommandFrame("move", result.direction);
     this.debug("Move command sent. Direction: " + result.direction);
    }
    else if(result instanceof SayCommand)
    {
     this.sendCommandFrame("say", input);
     this.debug("Say command sent.");
    }
    else if(result instanceof HelpCommand)
    {
      //if no command name is given, default command name is "HELP"
      this.sendCommandFrame("help", result.commandName);
      this.debug("Help command sent.")
    }
    else if(result instanceof ExamineCommand)
    {
      this.sendCommandFrame("examine", null); 
      this.debug("Examine command sent.");
    }
    else if(result instanceof ExitCommand)
    {
      this.sendCommandFrame("exit", null); 
      this.debug("Exit command sent.");
    }
    else if(result instanceof InventoryCommand)
    {
      this.sendCommandFrame("inventory", null); 
      this.debug("Inventory command sent.");
    }
    else if(result instanceof TakeCommand)
    {
      this.sendCommandFrame("take", input); 
      this.debug("Take command sent.");
    }
    else if(result instanceof DropCommand)
    {
      this.sendCommandFrame("drop", input); 
      this.debug("Drop command sent.");
    }
    else if(result instanceof WhisperCommand)
    {
      this.sendCommandFrame("whisper", input); 
      this.debug("Whisper command sent.");
    }
    else
    {
      this.print(result + input + ".");
    }
  }

   parse(input: string) {
    const { ast, errs } = Parser.parse(input);
    if (errs.length) {
      for (const error of errs) {
        console.error(error);
        console.error(error.toString());
      }
      return "Could not parse input: ";
      //throw new Error(`error while parsing ${input}`);
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
