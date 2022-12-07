import { EventEmitter } from '../../../common/event-emitter';
import { EntityID } from '../entity';
import { Gamestate } from '../gamestate';
import { Component, SerializedComponent } from './base/component';
import { HierarchyContainer } from './hierarchy-container';

export type SerializedHierarchyChild = SerializedComponent & {
  type: 'component-hierarchy-child';
  parent?: string;
};

export class HierarchyChild extends Component {
  public parent?: EntityID;

  public onMove = EventEmitter.channel<void>();

  constructor(parent?: EntityID) {
    super();
    if (parent) this.parent = parent;
  }

  static deserialize(data: unknown): HierarchyChild | false {
    if (HierarchyChild.validate(data)) return new HierarchyChild(data.parent);
    return false;
  }

  static validate(data: any): data is SerializedHierarchyChild {
    if (!Component.validateType(HierarchyChild.type, data)) return false;
    if (!(data.parent === undefined || typeof data.parent === 'string'))
      return false;
    return true;
  }

  serialize() {
    return {
      type: HierarchyChild.type,
      parent: this.parent,
    };
  }

  free(entity: EntityID, gs: Gamestate) {
    if (this.parent) {
      gs.entity(this.parent).get(HierarchyContainer).children.delete(entity);
    }
  }

  static type = 'component-hierarchy-child';
}
