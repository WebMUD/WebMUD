import Ajv from 'ajv';
import schemaFactory from './schema-factory';

const ajv = new Ajv();

export interface Type {
  type: 'assign_token';
  token: string;
}

const schema = schemaFactory('assign_token', {
  token: { type: 'string' },
});

export const validate = ajv.compile<Type>(schema);

/**
 * Inital connection frame, sends player name
 */
export class FrameAssignToken {
  public readonly type: 'assign_token' = 'assign_token';
  public readonly token: string;

  public constructor(token: string) {
    this.token = token;
  }

  public serialize(): string {
    return JSON.stringify(this);
  }

  public static from(obj: any) {
      if (validate(obj)) return new FrameAssignToken(obj.token);
    return false;
  }

  public static readonly validate = validate;
}
