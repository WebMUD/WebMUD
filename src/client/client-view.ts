import * as _ from 'lodash';
import { View, ViewOptions } from '../common/view';
import { Client } from './client';

export type ClientViewOptions = ViewOptions & {
  client: Client;
};

export class ClientView extends View {
  public client: Client;

  constructor(options: ClientViewOptions) {
    super(options);
    this.client = options.client;

    this.onInput(data => {
      this.print(this.formatSmall('>>> ' + data));
    });

    options.client.useView(this);
  }
}
