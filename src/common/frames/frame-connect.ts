import Ajv from 'ajv';
import schemaFactory from './schema-factory';

const ajv = new Ajv();

export interface Type {
  type: 'connect';
  username: string;
}

const schema = schemaFactory('connect', {
  username: { type: 'string' },
});

export const validate = ajv.compile<Type>(schema);

/**
 * Inital connection frame, sends player name
 */
export class FrameConnect {
  public readonly type: 'connect' = 'connect';
  public readonly username: string;

  public constructor(username: string) {
    this.username = username;
  }

  public serialize(): string {
    return JSON.stringify(this);
  }

  public static from(obj: any) {
    if (validate(obj)) return new FrameConnect(obj.username);
    return false;
  }

  public static readonly validate = validate;
}
