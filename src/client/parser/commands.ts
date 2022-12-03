import { commandName } from './parser';

export enum Direction {
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  EAST = 'EAST',
  WEST = 'WEST',
}

export enum Item {
  ITEM_TEST = 'ITEM_TEST',
}

export enum CommandName {
  MOVE = 'MOVE',
  EXAMINE = 'EXAMINE',
  HELP = 'HELP',
  EXIT = 'EXIT',
  INVENTORY = 'INVENTORY',
  TAKE = 'TAKE',
  DROP = 'DROP',
  SAY = 'SAY',
  WHISPER = 'WHISPER',
}
export class MoveCommand {
  direction: Direction;

  constructor(direction: Direction) {
    this.direction = direction;
  }
}

export class HelpCommand {
  commandName: CommandName;

  constructor(commandName: CommandName) {
    this.commandName = commandName;
  }
}

export class ExitCommand {
  constructor() {}
}

export class InventoryCommand {
  constructor() {}
}

export class SayCommand {
  constructor() {}
}

export class WhisperCommand {
  constructor() {}
}
