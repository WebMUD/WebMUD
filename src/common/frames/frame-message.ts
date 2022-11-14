import Ajv from 'ajv';
import schemaFactory from './schema-factory';

const ajv = new Ajv();

export interface Type {
  type: 'message';
  parts: Array<{
    text: string;
    format: Array<string>;
  }>;
}

const schema = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    parts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          format: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  required: ['type', 'parts'],
  additionalProperties: false,
};

export const validate = ajv.compile<Type>(schema);

/**
 * Inital connection frame, sends player name
 */
export class FrameMessage {
  public readonly type: 'message' = 'message';
  public readonly parts: Array<{ text: string; format: Array<string> }>;

  public constructor(parts: Array<{ text: string; format: Array<string> }>) {
    this.parts = parts;
  }

  public serialize(): string {
    return JSON.stringify(this);
  }

  public static from(obj: any) {
    if (validate(obj)) return new FrameMessage(obj.parts);
    return false;
  }

  public static readonly validate = validate;

  public static field(content: string, ...format: string[]) {
    return {
      text: content,
      format,
    };
  }
}
