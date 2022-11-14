import Ajv from 'ajv';
import schemaFactory from './schema-factory';

const ajv = new Ajv();

type Arguement = {
  name: string;
  value: string;
};

export interface Type {
  type: 'send_command';
  command: string;
  arguements: Arguement[];
}

const schema = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    command: { type: 'string' },
    arguements: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          value: { type: 'string' },
        },
      },
    },
  },
  required: ['type', 'command', 'arguements'],
  additionalProperties: false,
};

export const validate = ajv.compile<Type>(schema);

/**
 * Inital connection frame, sends player name
 */
export class FrameSendCommand {
  public readonly type: 'send_command' = 'send_command';
  public readonly command: string;
  public readonly arguements: Arguement[];

  public constructor(command: string, arguements: Arguement[]) {
    this.command = command;
    this.arguements = arguements;
  }

  public serialize(): string {
    return JSON.stringify(this);
  }

  public static from(obj: any) {
    if (validate(obj)) return new FrameSendCommand(obj.command, obj.arguements);
    return false;
  }

  public static readonly validate = validate;
}
