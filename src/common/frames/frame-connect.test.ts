import { frames } from '.';
import { data } from './mock-data';

test('frames.FrameConnect.validate()', () => {
  // valid data
  expect(frames.FrameConnect.validate(data.frameConnect)).toBe(true);

  // bad data
  expect(
    frames.FrameConnect.validate({
      type: 'invalid',
      username: 'data',
    })
  ).toBe(false);

  expect(
    frames.FrameConnect.validate({
      type: 'connect',
    })
  ).toBe(false);
});

test('frames.FrameConnect.from()', () => {
  // valid data
  expect(frames.FrameConnect.from(data.frameConnect)).toStrictEqual(
    new frames.FrameConnect(data.username)
  );

  // bad data
  expect(
    frames.FrameConnect.from({
      type: 'invalid',
      username: 'data',
    })
  ).toBe(false);
});

test('frames.FrameConnect.serialize()', () => {
  // valid data
  expect(new frames.FrameConnect(data.username).serialize()).toStrictEqual(
    JSON.stringify(data.frameConnect)
  );
});
