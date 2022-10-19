import Ajv from 'ajv';
const ajv = new Ajv();

/**
 * Ajv schema properties {@link https://ajv.js.org/guide/getting-started.html}
 */
export type SchemaProperties = {
  [key: string]: {
    type: string;
  };
};

/**
 * creates Ajv schema for frames
 * @param pattern regular expression to match against 'type' field
 * @param properties other properties
 * @returns an Ajv schema
 */
export default function schemaFactory(
  pattern: string,
  properties: SchemaProperties
) {
  return {
    type: 'object',
    properties: {
      type: { type: 'string', pattern },
      ...properties,
    },
    required: ['type', ...Object.keys(properties)],
    additionalProperties: false,
  };
}
