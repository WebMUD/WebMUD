import { AttributeTag, SerializedAttributeTag } from './base/attribute-tag';

export type SerializedRoom = SerializedAttributeTag & {
  type: 'component-room';
};

export class Room extends AttributeTag {
  static deserialize(data: unknown): Room | false {
    if (Room.validate(data)) return new Room();
    return false;
  }

  static validate(data: any): data is SerializedRoom {
    if (AttributeTag.validate(data)) {
      if (data.type === Room.type) return true;
    }
    return false;
  }

  serialize() {
    return super.serialize(Room.type);
  }
  
  static type = 'component-room';
}
