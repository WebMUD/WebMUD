import { AttributeTag, SerializedAttributeTag } from './base/attribute-tag';
import { Component } from './base/component';

export type SerializedWorld = SerializedAttributeTag & {
  type: 'component-world';
};

export class World extends AttributeTag {
  static deserialize(data: unknown): World | false {
    if (World.validate(data)) return new World();
    return false;
  }

  static validate(data: any): data is SerializedWorld {
    return Component.validateType(World.type, data);
  }

  serialize() {
    return super.serialize(World.type);
  }

  static type = 'component-world';
}
