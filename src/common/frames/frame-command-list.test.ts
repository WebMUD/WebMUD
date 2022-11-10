import { frames } from '.';
import { data } from './mock-data';

test('frames.FrameCommandList.validate()', () => {
  // valid data
    expect(frames.FrameCommandList.validate(data.frameCommandList)).toBe(true);

  // bad data
  expect(
      frames.FrameCommandList.validate({
      type: 'invalid',
      items: 'data',
    })
  ).toBe(false);

  expect(
      frames.FrameCommandList.validate({
      type: 'command_list',
    })
  ).toBe(false);
});