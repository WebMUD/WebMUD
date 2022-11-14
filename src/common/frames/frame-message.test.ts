import { frames } from '.';
import { data } from './mock-data';

test('frames.FrameMessage.validate()', () => {
  // valid data
  expect(frames.FrameMessage.validate(data.frameMessage)).toBe(true);

  // bad data
  expect(
    frames.FrameMessage.validate({
      type: 'invalid',
      parts: 'data',
    })
  ).toBe(false);

  expect(
    frames.FrameMessage.validate({
      type: 'message',
    })
  ).toBe(false);
});
