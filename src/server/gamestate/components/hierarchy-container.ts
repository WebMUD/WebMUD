import { EventEmitter } from '../../../common/event-emitter';
import { EntityID } from '../entity';
import { Gamestate } from '../gamestate';
import { Component, SerializedComponent } from './base/component';
import { HierarchyChild } from './hierarchy-child';

export type SerializedHierarchyContainer = SerializedComponent & {
  type: 'component-hierarchy-container';
  children: string[];
};

export class HierarchyContainer extends Component {
  public children = new Set<EntityID>();

  public onJoin = EventEmitter.channel<EntityID>();
  public onLeave = EventEmitter.channel<EntityID>();

  constructor() {
    super();
  }

  static deserialize(data: unknown): HierarchyContainer | false {
    if (HierarchyContainer.validate(data)) {
      const c = new HierarchyContainer();
      for (const child of data.children) c.children.add(child);
      return c;
    }
    return false;
  }

  static validate(data: any): data is SerializedHierarchyContainer {
    if (!Component.validateType(HierarchyContainer.type, data)) return false;
    if (!Array.isArray(data.children)) return false;
    for (const child of data.children)
      if (typeof child !== 'string') return false;
    return true;
  }

  serialize() {
    return {
      type: HierarchyContainer.type,
      children: Array.from(this.children.keys()),
    };
  }

  free(entity: EntityID, gs: Gamestate) {
    for (const child of this.children) {
      gs.entity(child).get(HierarchyChild).parent = undefined;
    }
  }

  static type = 'component-hierarchy-container';
}
