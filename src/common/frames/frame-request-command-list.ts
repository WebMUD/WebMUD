import Ajv from 'ajv';
import schemaFactory from './schema-factory';

const ajv = new Ajv();

export interface Type {
  type: 'request_command_list';
}

const schema = {
    type: 'object',
    properties: {
        type: { type: 'string' },
    },
    required: ['type'],
    additionalProperties: false
}


export const validate = ajv.compile<Type>(schema);

/**
 * Inital connection frame, sends player name
 */
export class FrameRequestCommandList {
    public readonly type: 'request_command_list' = 'request_command_list';

    public constructor() {
  }

  public serialize(): string {
    return JSON.stringify(this);
  }

  public static from(obj: any) {
      if (validate(obj)) return new FrameRequestCommandList();
    return false;
  }

  public static readonly validate = validate;
}
