import { EntityID } from '../../entity';
import { Gamestate } from '../../gamestate';
import { Manager } from '../../manager';

export interface SerializedComponent {
  type: string;
}

export interface SerializableComponent {
  serialize(): SerializedComponent;
}

export interface SerializableComponentClass {
  deserialize(data: unknown): Component | false;
  validate(data: unknown): data is SerializedComponent;
}

export abstract class Component {
  abstract serialize(type?: string): SerializedComponent;
  public free(entity: EntityID, gs: Manager | Gamestate) {}
  public start(entity: EntityID, gs: Manager | Gamestate) {}

  static validateType(type: string, data: any): boolean {
    if (typeof data !== 'object' || data === null) return false;
    if (typeof data.type !== 'string') return false;
    if (data.type === type) return true;
    return false;
  }
}
