import * as _ from 'lodash';
import { createElement } from '../common/util';
import { View, ViewOptions } from '../common/view';
import { Server } from './server';
const PACKAGE = require('../../package.json');

export type ServerViewOptions = ViewOptions & {
  joinLink?: HTMLElement;
  joinURL?: HTMLElement;
  clientList?: HTMLElement;

  server: Server;
  devMode: boolean;
};

/**
 * Connects {@link server/server.Server} to the DOM
 */
export class ServerView extends View {
  server: Server;

  constructor(options: ServerViewOptions) {
    super(options);
    this.server = options.server;

    this.onInput(data => {
      this.print(this.formatSmall('>>> ' + data));
    });

    this.server.useView(this);
    this.print('WebMUD Server v', PACKAGE.version);

    if (options.devMode) {
      this.print('DevMode Enabled');
      this.server.flag(Server.FLAGS.VERBOSE, true);
      this.server.flag(Server.FLAGS.DEV_MODE, true);
    }

    this.server.onReady(() => {
      this.info(
        'Ready',
        ' ',
        this.formatSmall('@' + new Date().toLocaleTimeString())
      );

      this.info('Enter "help" for a list of commands.');

      const link = this.server.joinLink();

      if (options.joinURL) options.joinURL.textContent = link;
      if (options.joinLink) options.joinLink.setAttribute('href', link);
      if ('clientList' in options && options.clientList) {
        const clientList = options.clientList;
        this.server.onClientJoin(client => {
          this.updateClientList(clientList);
        });
      }
    });
  }
  updateClientList(clientList: HTMLElement) {
    clientList.replaceChildren();
    for (const client of this.server.getClients()) {
      const el = createElement('div', {
        text: client.name,
      });
      clientList.appendChild(el);
    }
  }
}
