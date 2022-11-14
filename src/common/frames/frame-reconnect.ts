import Ajv from 'ajv';
import schemaFactory from './schema-factory';

const ajv = new Ajv();

export interface Type {
  type: 'reconnect';
  token: string;
}

const schema = schemaFactory('reconnect', {
  token: { type: 'string' },
});

export const validate = ajv.compile<Type>(schema);

export class FrameReconnect {
  public readonly type: 'reconnect' = 'reconnect';
  public readonly token: string;

  public constructor(token: string) {
    this.token = token;
  }

  public serialize(): string {
    return JSON.stringify(this);
  }

  public static from(obj: any) {
    if (validate(obj)) return new FrameReconnect(obj.token);
    return false;
  }

  public static readonly validate = validate;
}
