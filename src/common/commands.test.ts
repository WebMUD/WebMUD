import { parse } from "./commands";

test('Parse', () => {
    expect(parse('a "b c d" e')).toEqual([
        'a',
        'b c d',
        'e',
    ]);
});
