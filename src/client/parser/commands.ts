import { commandName } from './parser';
import { Client } from '../../server/client';
import { CodeKeywordDefinition } from 'ajv';
import { Server } from '../../server/server';
import { Connection } from '../../common/connection/connection';
import { Player } from '../../server/gamestate/components';

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
  LOOK = 'LOOK',
  HELP = '',
  EXIT = 'EXIT',
  INVENTORY = 'INVENTORY',
  TAKE = 'TAKE',
  DROP = 'DROP',
  SAY = 'SAY',
  WHISPER = 'WHISPER',
}
export class MoveCommand {
  text: string;

  constructor(text: string)
  {
    if(text == "n")
    {
      this.text = "north";
    }
    else if(text == "s")
    {
      this.text = "south";
    }
    else if(text == "w")
    {
      this.text = "west";
    }
    else if(text == "e")
    {
      this.text = "east";
    }
    else if (text == "u")
    {
      this.text = "up";
    }
    else if(text == "d")
    {
      this.text = "down";
    }
    else
    {
      this.text = text;
    }
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
  text: string;
  constructor(text: string) {
    this.text = text;
  }
}

export class WhisperCommand {
  text: string;
  username: string;
  constructor(text: string, username: string) {
    this.text = text;
    this.username = username;
  }
}

export class LookCommand {
  text: string;
  constructor(text: string) {
    this.text = text;
  }
}

export class TakeCommand {
  text: string;
  constructor(text: string) {
    this.text = text;
  }
}

export class DropCommand {
  text: string;
  constructor(text: string) {
    this.text = text;
  }
}
