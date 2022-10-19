import { EventEmitter } from '../../../../common/event-emitter';
import { Component } from './component';

export class EventChannelComponent extends Component {
  event = EventEmitter.channel<void>();

  constructor() {
    super();
  }
}
