import * as _ from 'lodash';
import { View, ViewOptions } from '../common/view';
import { Client } from './client';

export type ClientViewOptions = ViewOptions & {
  client: Client,
}

export class ClientView extends View {
  constructor(options: ClientViewOptions) {
    super(options);

    this.print('new client');
  }
}