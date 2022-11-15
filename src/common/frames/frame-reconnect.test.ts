import { frames } from '.';
import { data } from './mock-data';

test('frames.FrameReconnect.validate()', () => {
  // valid data
  expect(frames.FrameReconnect.validate(data.frameReconnect)).toBe(true);

  // bad data
  expect(
    frames.FrameReconnect.validate({
      type: 'invalid',
      token: 'data',
    })
  ).toBe(false);

  expect(
    frames.FrameReconnect.validate({
      type: 'reconnect',
    })
  ).toBe(false);
});
