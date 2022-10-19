import { frames } from '.';
import { data } from './mock-data';

test('frames.from()', () => {
  // valid data
  expect(frames.parse(data.frameConnect)).toStrictEqual(
    new frames.FrameConnect(data.username)
  );

  const jsonData = JSON.stringify(data.frameConnect);

  expect(frames.parse(jsonData)).toStrictEqual(
    new frames.FrameConnect(data.username)
  );

  // bad data
  expect(
    frames.parse({
      type: 'invalid',
      username: 'data',
    })
  ).toBe(false);
});
