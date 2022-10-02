import { frames } from '.';
import { data } from './mock-data';

test('frames.from()', () => {
  // valid data
  expect(frames.from(data.frameConnect)).toStrictEqual(
    new frames.FrameConnect(data.username)
  );

  const jsonData = JSON.stringify(data.frameConnect);

  expect(frames.from(jsonData)).toStrictEqual(
    new frames.FrameConnect(data.username)
  );

  // bad data
  expect(
    frames.from({
      type: 'invalid',
      username: 'data',
    })
  ).toBe(false);
});
