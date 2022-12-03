import { EventEmitter } from '../../../common/event-emitter';
import { EntityID } from '../entity';
import { Component } from './base/component';

export class HierarchyChild extends Component {
  public parent?: EntityID;

  public onMove = EventEmitter.channel<void>();

  constructor(parent?: EntityID) {
    super();
    if (parent) this.parent = parent;
  }

  serialize() {
    return {
      type: HierarchyChild.type,
      parent: this.parent,
    }
  }

  static type = 'component-hierarchy-child';
}
