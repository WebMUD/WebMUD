import Peer from 'peerjs';
import { Connection } from '../common/connection/connection';
import { ConnectionBase } from '../common/connection/connection-base';
import { Logger } from '../common/logger';
import { FrameMessage, frames } from '../common/frames';
import { EventEmitter } from '../common/event-emitter';
import { ClientView } from './client-view';

export class Client extends Logger {
  public connection: ConnectionBase;
  public onReady = EventEmitter.channel<void>();

  constructor() {
    super();
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
      console.log(frame);

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
