
import { Direction, MoveCommand, Item, HelpCommand, CommandName, ExitCommand, InventoryCommand, SayCommand, WhisperCommand } from './commands';
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


//TESTING MOVE COMMAND

test('Parser', ()=>{
    const result = parse('move north');
    expect(result).toBeInstanceOf(MoveCommand);
    if(result !== undefined &&  result instanceof MoveCommand)
    {  
    expect(result?.direction).toBe(Direction.NORTH);
    }
    
})
test('Parser', ()=>{
    const result = parse('move south');
    expect(result).toBeInstanceOf(MoveCommand);
    if(result !== undefined &&  result instanceof MoveCommand)
    {  
    expect(result?.direction).toBe(Direction.SOUTH);
    }
})
test('Parser', ()=>{
    const result = parse('move east');
    expect(result).toBeInstanceOf(MoveCommand);
    if(result !== undefined &&  result instanceof MoveCommand)
    {  
    expect(result?.direction).toBe(Direction.EAST);
    }
})
test('Parser', ()=>{
    const result = parse('move west');
    expect(result).toBeInstanceOf(MoveCommand);
    if(result !== undefined &&  result instanceof MoveCommand)
    {  
    expect(result?.direction).toBe(Direction.WEST);
    }
})


//TESTING HELP COMMAND

test('Parser', ()=>{
    const result = parse('help move');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.MOVE);
    }
})

test('Parser', ()=>{
    const result = parse('Help M');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.MOVE);
    }
})
test('Parser', ()=>{
    const result = parse('Help exit');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.EXIT);
    }
})
test('Parser', ()=>{
    const result = parse('Help exits');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.EXIT);
    }
})
test('Parser', ()=>{
    const result = parse('Help e');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.EXIT);
    }
})
test('Parser', ()=>{
    const result = parse('Help e');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.EXIT);
    }
})
test('Parser', ()=>{
    const result = parse('HELP take');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.TAKE);
    }
})
test('Parser', ()=>{
    const result = parse('HELP Take');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.TAKE);
    }
})
test('Parser', ()=>{
    const result = parse('HELP T');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.TAKE);
    }
})
test('Parser', ()=>{
    const result = parse('help Drop');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.DROP);
    }
})
test('Parser', ()=>{
    const result = parse('help D');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.DROP);
    }
})
test('Parser', ()=>{
    const result = parse('help say');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.SAY);
    }
})
test('Parser', ()=>{
    const result = parse('help s');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.SAY);
    }
})
test('Parser', ()=>{
    const result = parse('help i');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.INVENTORY);
    }
})
test('Parser', ()=>{
    const result = parse('help w');
    expect(result).toBeInstanceOf(HelpCommand);
    if(result !== undefined &&  result instanceof HelpCommand)
    {  
    expect(result?.commandName).toBe(CommandName.WHISPER);
    }
})

//test exit command
test('Parser', ()=>{
    const result = parse('exit');
    expect(result).toBeInstanceOf(ExitCommand);
})
test('Parser', ()=>{
    const result = parse('exits');
    expect(result).toBeInstanceOf(ExitCommand);
})
test('Parser', ()=>{
    const result = parse('e');
    expect(result).toBeInstanceOf(ExitCommand);
})


test('Parser', ()=>{
    const result = parse('inventory');
    expect(result).toBeInstanceOf(InventoryCommand);
})

test('Parser', ()=>{
    const result = parse('say');
    expect(result).toBeInstanceOf(SayCommand);
})

test('Parser', ()=>{
    const result = parse('w');
    expect(result).toBeInstanceOf(WhisperCommand);
})
