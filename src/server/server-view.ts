import * as _ from 'lodash';
import { View, ViewOptions } from '../common/view';
import { Server } from './server';

export type ServerViewOptions = ViewOptions & {
  server: Server;
};

/**
 * Connects {@link server/server.Server} to the DOM
 */
export class ServerView extends View {
  server: Server;

  constructor(options: ServerViewOptions) {
    super(options);
    this.server = options.server;

    this.server.onReady(() => {
      this.info(
        `Ready `,
        this.formatSmall('@' + new Date().toLocaleTimeString())
      );
    });

    this.onInput(data => {
      this.print(this.formatSmall('>>> ' + data));
    });

    this.server.useView(this);
  }
}
