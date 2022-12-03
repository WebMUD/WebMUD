import { AttributeTag, SerializedAttributeTag } from './base/attribute-tag';

export type SerializedProp = SerializedAttributeTag & {
  type: 'component-prop';
};

export class Prop extends AttributeTag {
  static deserialize(data: unknown): Prop | false {
    if (Prop.validate(data)) return new Prop();
    return false;
  }

  static validate(data: any): data is SerializedProp {
    if (AttributeTag.validate(data)) {
      if (data.type === Prop.type) return true;
    }
    return false;
  }

  serialize() {
    return super.serialize(Prop.type);
  }
  
  static type = 'component-prop';
}
