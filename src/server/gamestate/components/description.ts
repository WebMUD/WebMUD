import { Component, SerializedComponent } from './base/component';
import { DataAttributeString } from './base/data-attribute-string';

export type SerializedDesciption = SerializedComponent & {
  type: 'component-description';
  data: string;
};

export class Description extends DataAttributeString {
  static deserialize(data: unknown): Description | false {
    if (Description.validate(data)) return new Description(data.data);
    return false;
  }

  static validate(data: any): data is SerializedDesciption {
    return DataAttributeString.validateDataAttributeType(
      Description.type,
      data
    );
  }

  serialize() {
    return super.serialize(Description.type);
  }

  static type = 'component-description';
}
