import { EventEmitter } from '../../../../common/event-emitter';
import { Component } from './component';

export class EventChannelComponent<T> extends Component {
  event = EventEmitter.channel<T>();

  constructor() {
    super();
  }
}
