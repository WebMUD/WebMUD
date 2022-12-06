import { EntityID } from '../entity';
import { Component, SerializedComponent } from './base/component';
import { EventChannelComponent } from './base/event-channel';

export type SerializedChatChannel = SerializedComponent & {
  type: 'component-ChatMessage';
};

export interface ChatMessage {
  senderID: EntityID;
  senderName: string;
  content: string;
}

export class ChatChannel extends EventChannelComponent<ChatMessage> {
  static deserialize(data: unknown): ChatChannel | false {
    if (ChatChannel.validate(data)) return new ChatChannel();
    return false;
  }

  static validate(data: any): data is SerializedChatChannel {
    if (!Component.validateType(ChatChannel.type, data)) return false;
    return true;
  }

  serialize() {
    return super.serialize(ChatChannel.type);
  }

  static type = 'component-chat-channel';
}
