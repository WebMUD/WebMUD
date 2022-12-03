import { Component, SerializedComponent } from './component';

export type SerializedAttributeTag = SerializedComponent & {};

export class AttributeTag extends Component {
  constructor() {
    super();
  }
  
  static validate(data: any): data is SerializedAttributeTag {
    if (typeof data !== 'object' || data === null) return false;
    if (typeof data.type !== 'string') return false;
    return true;
  }

  serialize(type: string) {
    return {
      type,
    }
  }
}
