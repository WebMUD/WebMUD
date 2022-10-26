
import * as Parser from './parser';


function evaluate(input : string):any 
{
    input = input.toLowerCase();
    const p= require('./parser').parse(input);
    console.log(p)
}

evaluate("MOVE SOUTH");
evaluate("move north");
