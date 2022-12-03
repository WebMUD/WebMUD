import { EventEmitter } from '../../../common/event-emitter';
import { EntityID } from '../entity';
import { Component } from './base/component';

export class HierarchyContainer extends Component {
  public children = new Set<EntityID>();

  public onJoin = EventEmitter.channel<EntityID>();
  public onLeave = EventEmitter.channel<EntityID>();

  constructor() {
    super();
  }

  serialize() {
    return {
      type: HierarchyContainer.type,
      children: this.children.keys(),
    }
  }

  static type = 'component-hierarchy-container';
}
