import { frames } from '.';
import { data } from './mock-data';

test('frames.FrameAvailableEntities.validate()', () => {
  // valid data
  expect(frames.FrameAvailableEntities.validate(data.frameAvailableEntities)).toBe(true);

    // bad data
    expect(
        frames.FrameSendCommand.validate({
            type: 'connect',
        })
    ).toBe(false);
});