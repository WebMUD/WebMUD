export enum Direction {
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  EAST = 'EAST',
  WEST = 'WEST',
}

export class MoveCommand {
  direction: Direction;

  constructor(direction: Direction) {
    this.direction = direction;
  }
}
