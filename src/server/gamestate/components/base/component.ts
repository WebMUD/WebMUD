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
  public free() {
  }
}
