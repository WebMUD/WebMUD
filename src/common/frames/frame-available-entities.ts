import Ajv from 'ajv';
import schemaFactory from './schema-factory';

const ajv = new Ajv();

type Item = {
  id: string;
  name: string;
};

export interface Type {
  type: 'available_entities';
  items: Item[];
}

const schema = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      },
    },
  },
  required: ['type', 'items'],
  additionalProperties: false,
};

export const validate = ajv.compile<Type>(schema);

/**
 * Inital connection frame, sends player name
 */
export class FrameAvailableEntities {
  public readonly type: 'available_entities' = 'available_entities';
  public readonly items: Item[];

  public constructor(items: Item[]) {
    this.items = items;
  }

  public serialize(): string {
    return JSON.stringify(this);
  }

  public static from(obj: any) {
    if (validate(obj)) return new FrameAvailableEntities(obj.items);
    return false;
  }

  public static readonly validate = validate;
}
