import { AttributeTag, SerializedAttributeTag } from './base/attribute-tag';
import { Component } from './base/component';

export type SerializedRoom = SerializedAttributeTag & {
  type: 'component-room';
};

export class Room extends AttributeTag {
  static deserialize(data: unknown): Room | false {
    if (Room.validate(data)) return new Room();
    return false;
  }

  static validate(data: any): data is SerializedRoom {
    return Component.validateType(Room.type, data);
  }

  serialize() {
    return super.serialize(Room.type);
  }

  static type = 'component-room';
}
