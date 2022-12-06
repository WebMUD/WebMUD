import { EntityID } from '../entity';
import { Component, SerializedComponent } from './base/component';

export type SerializedAdjacent = SerializedComponent & {
  type: 'component-adjacent';
  north?: string;
  south?: string;
  east?: string;
  west?: string;
  up?: string;
  down?: string;
};

export class Adjacent extends Component {
  public north?: EntityID;
  public south?: EntityID;
  public east?: EntityID;
  public west?: EntityID;
  public up?: EntityID;
  public down?: EntityID;

  constructor() {
    super();
  }

  static deserialize(data: unknown): Adjacent | false {
    if (Adjacent.validate(data)) {
      const c = new Adjacent();
      for (const direction of Adjacent.directions) {
        const v = (data as any)[direction];
        if (typeof v === 'string') (c as any)[direction] = v;
      }
      return c;
    }
    return false;
  }

  static validate(data: any): data is SerializedAdjacent {
    if (!Component.validateType(Adjacent.type, data)) return false;
    for (const direction of Adjacent.directions) {
      if (
        !(data[direction] === undefined || typeof data[direction] === 'string')
      )
        return false;
    }
    return true;
  }

  serialize() {
    const r = {
      type: Adjacent.type,
    };

    for (const direction of Adjacent.directions) {
      const v = (this as any)[direction];
      if (typeof v === 'string') (r as any)[direction] = v;
    }

    return r;
  }

  static directions = ['north', 'south', 'east', 'west', 'up', 'down'];

  static type = 'component-adjacent';
}
