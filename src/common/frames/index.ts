import { FrameConnect } from './frame-connect';
import { FrameReconnect } from './frame-reconnect';
import { FrameMessage } from './frame-message';
import { FrameAvailableEntities } from './frame-available-entities';
import { FrameCommandList } from './frame-command-list';
import { FrameAssignToken } from './frame-assign-token';
import { FrameSendCommand } from './frame-send-command';
import { FrameRequestCommandList } from './frame-request-command-list';
import { FrameUsernameTaken } from './frame-username-taken';

const _frames = {
    FrameConnect,
    FrameReconnect,
    FrameMessage,
    FrameAvailableEntities,
    FrameCommandList,
    FrameAssignToken,
    FrameSendCommand,
    FrameRequestCommandList,
    FrameUsernameTaken,
} as const;

export type Frame = InstanceType<typeof _frames[keyof typeof _frames]>;

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
