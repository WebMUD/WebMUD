import {
  Direction,
  MoveCommand,
  Item,
  HelpCommand,
  CommandName,
  ExitCommand,
  InventoryCommand,
  SayCommand,
  WhisperCommand,
} from './commands';
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


//TESTING HELP COMMAND

test('Parser', () => {
  const result = parse('help move');
  expect(result).toBeInstanceOf(HelpCommand);
  if (result !== undefined && result instanceof HelpCommand) {
    expect(result?.commandName).toBe(CommandName.MOVE);
  }
});

test('Parser', ()=>{
    const result = parse('help m');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.MOVE);
    }
})
test('Parser', ()=>{
    const result = parse('help exit');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.EXIT);
    }
})
test('Parser', ()=>{
    const result = parse('help exits');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.EXIT);
    }
})
test('Parser', ()=>{
    const result = parse('help e');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.EXIT);
    }
})
test('Parser', ()=>{
    const result = parse('help take');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.TAKE);
    }
})
test('Parser', ()=>{
    const result = parse('help t');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.TAKE);
    }
})
test('Parser', ()=>{
    const result = parse('help drop');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.DROP);
    }
})
test('Parser', ()=>{
    const result = parse('help d');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.DROP);
  }
});
test('Parser', () => {
  const result = parse('help say');
  expect(result).toBeInstanceOf(HelpCommand);
  if (result !== undefined && result instanceof HelpCommand) {
    expect(result?.commandName).toBe(CommandName.SAY);
  }
});
test('Parser', () => {
  const result = parse('help s');
  expect(result).toBeInstanceOf(HelpCommand);
  if (result !== undefined && result instanceof HelpCommand) {
    expect(result?.commandName).toBe(CommandName.SAY);
  }
});
test('Parser', () => {
  const result = parse('help i');
  expect(result).toBeInstanceOf(HelpCommand);
  if (result !== undefined && result instanceof HelpCommand) {
    expect(result?.commandName).toBe(CommandName.INVENTORY);
  }
});
test('Parser', () => {
  const result = parse('help w');
  expect(result).toBeInstanceOf(HelpCommand);
  if (result !== undefined && result instanceof HelpCommand) {
    expect(result?.commandName).toBe(CommandName.WHISPER);
  }
});

//test exit command
test('Parser', () => {
  const result = parse('exit');
  expect(result).toBeInstanceOf(ExitCommand);
});
test('Parser', () => {
  const result = parse('exits');
  expect(result).toBeInstanceOf(ExitCommand);
});
test('Parser', () => {
  const result = parse('e');
  expect(result).toBeInstanceOf(ExitCommand);
});

test('Parser', () => {
  const result = parse('inventory');
  expect(result).toBeInstanceOf(InventoryCommand);
});

test('Parser', () => {
  const result = parse('say');
  expect(result).toBeInstanceOf(SayCommand);
});

test('Parser', () => {
  const result = parse('w');
  expect(result).toBeInstanceOf(WhisperCommand);
});
