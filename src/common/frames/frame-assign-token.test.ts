import { frames } from '.';
import { data } from './mock-data';

test('frames.FrameAssignToken.validate()', () => {
  // valid data
  expect(frames.FrameAssignToken.validate(data.frameAssignToken)).toBe(true);

  // bad data
  expect(
    frames.FrameAssignToken.validate({
      type: 'invalid',
      token: 'data',
    })
  ).toBe(false);

  expect(
    frames.FrameAssignToken.validate({
      type: 'assign_token',
    })
  ).toBe(false);
});
