import { AttributeTag, SerializedAttributeTag } from './base/attribute-tag';

export type SerializedWorld = SerializedAttributeTag & {
  type: 'component-world';
};

export class World extends AttributeTag {
  static deserialize(data: unknown): World | false {
    if (World.validate(data)) return new World();
    return false;
  }

  static validate(data: any): data is SerializedWorld {
    if (AttributeTag.validate(data)) {
      if (data.type === World.type) return true;
    }
    return false;
  }

  serialize() {
    return super.serialize(World.type);
  }

  static type = 'component-world';
}
