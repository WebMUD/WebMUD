import Ajv from 'ajv';
import schemaFactory from './schema-factory';

const ajv = new Ajv();

export interface Type {
  type: 'username_taken';
  username: string;
}

const schema = schemaFactory('username_taken', {
  username: { type: 'string' },
});

export const validate = ajv.compile<Type>(schema);

/**
 * Inital connection frame, sends player name
 */
export class FrameUsernameTaken {
  public readonly type: 'username_taken' = 'username_taken';
  public readonly username: string;

  public constructor(username: string) {
    this.username = username;
  }

  public serialize(): string {
    return JSON.stringify(this);
  }

  public static from(obj: any) {
      if (validate(obj)) return new FrameUsernameTaken(obj.username);
    return false;
  }

  public static readonly validate = validate;
}
