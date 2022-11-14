import Ajv from 'ajv';
import schemaFactory from './schema-factory';

const ajv = new Ajv();

type Arguement = {
  name: string;
  type: string;
  optional: boolean;
};

type Command = {
  command: string;
  arguements: Arguement[];
};

export interface Type {
  type: 'command_list';
  commands: Command[];
}

const schema = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    commands: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          base: { type: 'string' },
          arguements: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: { type: 'string' },
                optional: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  },
  required: ['type', 'commands'],
  additionalProperties: false,
};

export const validate = ajv.compile<Type>(schema);

/**
 * Inital connection frame, sends player name
 */
export class FrameCommandList {
  public readonly type: 'command_list' = 'command_list';
  public readonly commands: Command[];

  public constructor(commands: Command[]) {
    this.commands = commands;
  }

  public serialize(): string {
    return JSON.stringify(this);
  }

  public static from(obj: any) {
    if (validate(obj)) return new FrameCommandList(obj.commands);
    return false;
  }

  public static readonly validate = validate;
}
