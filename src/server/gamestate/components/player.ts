import { AttributeTag, SerializedAttributeTag } from './base/attribute-tag';
import { Component } from './base/component';

export type SerializedPlayer = SerializedAttributeTag & {
  type: 'component-player';
};

export class Player extends AttributeTag {
  static deserialize(data: unknown): Player | false {
    if (Player.validate(data)) return new Player();
    return false;
  }

  static validate(data: any): data is SerializedPlayer {
    return Component.validateType(Player.type, data);
  }

  serialize() {
    return super.serialize(Player.type);
  }

  static type = 'component-player';
}
