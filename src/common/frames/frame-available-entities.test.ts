import { frames } from '.';
import { data } from './mock-data';

test('frames.FrameAvailableEntities.validate()', () => {
  // valid data
  expect(frames.FrameAvailableEntities.validate(data.frameAvailableEntities)).toBe(true);

  // bad data
  expect(
    frames.FrameAvailableEntities.validate({
      type: 'invalid',
      items: 'data',
    })
  ).toBe(false);

  expect(
    frames.FrameAvailableEntities.validate({
      type: 'available_entities',
    })
  ).toBe(false);
});