import { FrameConnect } from './frame-connect';

const _frames = {
  FrameConnect,
};

/**
 * validate and parse incoming data
 * @param obj incoming data, as JSON string or object
 * @returns the frame object matching the data, or false
 */
function parse(obj: any) {
  if (typeof obj === 'string') obj = JSON.parse(obj);

  for (const frame of Object.values(_frames)) {
    const result = frame.from(obj);
    if (result) return result;
  }

  return false;
}

export const frames = {
  parse,
  ..._frames,
};
