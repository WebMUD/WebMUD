import { AttributeTag, SerializedAttributeTag } from './base/attribute-tag';
import { Component } from './base/component';

export type SerializedProp = SerializedAttributeTag & {
  type: 'component-prop';
};

export class Prop extends AttributeTag {
  static deserialize(data: unknown): Prop | false {
    if (Prop.validate(data)) return new Prop();
    return false;
  }

  static validate(data: any): data is SerializedProp {
    return Component.validateType(Prop.type, data);
  }

  serialize() {
    return super.serialize(Prop.type);
  }

  static type = 'component-prop';
}
