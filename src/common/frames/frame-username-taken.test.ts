import { frames } from '.';
import { data } from './mock-data';

test('frames.FrameUsernameTaken.validate()', () => {
    // valid data
    expect(frames.FrameUsernameTaken.validate(data.frameUsernameTaken)).toBe(true);

    // bad data
    expect(
        frames.FrameUsernameTaken.validate({
            type: 'invalid',
            username: 'data',
        })
    ).toBe(false);

    expect(
        frames.FrameUsernameTaken.validate({
            type: 'assign_token',
        })
    ).toBe(false);
});