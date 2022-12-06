import { AttributeTag, SerializedAttributeTag } from './base/attribute-tag';
import { Component } from './base/component';

export type SerializedItem = SerializedAttributeTag & {
  type: 'component-item';
};

export class Item extends AttributeTag {
  static deserialize(data: unknown): Item | false {
    if (Item.validate(data)) return new Item();
    return false;
  }

  static validate(data: any): data is SerializedItem {
    return Component.validateType(Item.type, data);
  }

  serialize() {
    return super.serialize(Item.type);
  }

  static type = 'component-item';
}
