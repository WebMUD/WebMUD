import { Direction, MoveCommand } from './commands';
import * as Parser from './parser';

function parse(input: string) {
  const { ast, errs } = Parser.parse(input);
  if (errs.length) {
    for (const error of errs) {
      console.log(error);
      throw 'error';
    }
  }

  return ast?.command;
}

test('Parser', () => {
  const result = parse('move north');
  expect(result).toBeInstanceOf(MoveCommand);
  expect(result?.direction).toBe(Direction.NORTH);
});
