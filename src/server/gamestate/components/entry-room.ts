import { AttributeTag, SerializedAttributeTag } from './base/attribute-tag';
import { Component } from './base/component';

export type SerializedEntryRoom = SerializedAttributeTag & {
  type: 'component-entry-room';
};

export class EntryRoom extends AttributeTag {
  static deserialize(data: unknown): EntryRoom | false {
    if (EntryRoom.validate(data)) return new EntryRoom();
    return false;
  }

  static validate(data: any): data is SerializedEntryRoom {
    return Component.validateType(EntryRoom.type, data);
  }

  serialize() {
    return super.serialize(EntryRoom.type);
  }

  static type = 'component-entry-room';
}
