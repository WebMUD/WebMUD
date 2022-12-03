import { EntityID } from '../entity';
import { EventChannelComponent } from './base/event-channel';

export interface ChatMessage {
  senderID: EntityID;
  senderName: string;
  content: string;
}

export class ChatChannel extends EventChannelComponent<ChatMessage> {
  serialize() {
    return super.serialize(ChatChannel.type);
  }

  static type = 'component-chat-channel';
}