import * as _ from 'lodash';
import { TextOutput } from '../common/elements/text-output';
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

    this.server.useView(this);

    this.server.onReady(() => {
      this.info('Ready');
    });

    this.onInput(data => {
      this.print('Input:', TextOutput.format(data, 'info'));
    });
  }
}
