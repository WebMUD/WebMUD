import { commandName } from "./parser";
import {Client} from "../../server/client"
import { CodeKeywordDefinition } from "ajv";
import { Server } from "../../server/server";
import { Connection } from "../../common/connection/connection";
import { Player } from "../../server/gamestate/components";

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

  getDirection()
  {
    return this.direction;
  }
}

export class HelpCommand {
    commandName : CommandName;
    
    constructor(commandName : CommandName)
    {
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

export class ExamineCommand {
  constructor() {}
}

export class TakeCommand {
  constructor() {}
}


export class DropCommand {
  constructor() {}
}


