import { SerializedComponent } from './base/component';
import { DataAttributeString } from './base/data-attribute-string';

export type SerializedName = SerializedComponent & {
  type: 'component-name';
  data: string;
};

export class Name extends DataAttributeString {
  static deserialize(data: unknown): Name | false {
    if (Name.validate(data)) return new Name(data.data);
    return false;
  }

  static validate(data: any): data is SerializedName {
    return DataAttributeString.validateDataAttributeType(Name.type, data);
  }

  serialize() {
    return super.serialize(Name.type);
  }

  static type = 'component-name';
}
