# Style & Naming

Linter (Prettier) enforces most of the styling.

Use the [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) for anything else.

## JSDoc

- [Getting Started with JSDoc](https://jsdoc.app/about-getting-started.html)
- Standard for documenting with comments
- There are two types of comments, JSDoc `(/** ... */)` and non-JSDoc ordinary comments `(// ... or /* ... */).`
- Use `/** JSDoc */` comments for documentation, i.e. comments a user of the code should read.
- Use `// line comments` for implementation comments, i.e. comments that only concern the implementation of the code itself.
- JSDoc comments are understood by tools (such as editors and documentation generators), while ordinary comments are only for other humans.

## Files

- `kebab-case`
- same name as class
- one class per file

## [Wrapper types](https://google.github.io/styleguide/tsguide.html#wrapper-types)

- `String`, `Boolean`, and `Number` have slightly different meaning from the corresponding primitive types `string`, `boolean`, and `number`. Always use the lowercase version.
- `Object` has similarities to both `{}` and `object`, but is slightly looser. Use `{}` for a type that include everything except `null` and `undefined`, or lowercase `object` to further exclude the other primitive types (the three mentioned above, plus `symbol` and `bigint`).

## [Variables](https://google.github.io/styleguide/tsguide.html#variables)

Good:

```typescript
const foo = otherValue; // Use if "foo" never changes.
let bar = someValue; // Use if "bar" is ever assigned into later on.
```

Bad:

```typescript
var foo = someValue; // Don't use - var scoping is complex and causes bugs.
```

## [Class Members](https://google.github.io/styleguide/tsguide.html#class-members)

### No `#private` fields

Good (TypeScript's visibility annotations:):

```typescript
class Clazz {
  private ident = 1;
}
```

Bad (private fields/identifiers):

```typescript
class Clazz {
  #ident = 1;
}
```

### Use `readonly`

Mark properties that are never reassigned outside of the constructor with the readonly modifier (these need not be deeply immutable).

## Modules / Imports / Exports

- No namespaces
- No `require()`
- Only named exports:
  - `export foo;`
  - not `export default foo;`
- Use named/module imports when possible:
  - `import {SomeThing} from '...';`
  - `import * as module from '...';`
- May need default import when working with libraries:
  - `import SomeThing from '...';`
- Renaming imports
  - Only if needed
  - `import {SomeThing as SomeOtherThing} from '...';`

## [Organize By Feature ](https://google.github.io/styleguide/tsguide.html#organize-by-feature)

- Organize packages by feature, not by type. For example, an online shop should have packages named `products`, `checkout`, `backend`, not `views`, `models`, `controllers`.

## Null vs Undefined

- Prefer `undefined`
- Otherwise see [Google Typescript: Null vs Undefined](https://google.github.io/styleguide/tsguide.html#null-vs-undefined)
- Additionally, prefer using optionals (`foo?: string`) over `|undefined` (`foo: string|undefined`) [Google Typescript: Optionals vs |undefined type](https://google.github.io/styleguide/tsguide.html#optionals-vs-undefined-type)

## [Structural Types vs Nominal Types](https://google.github.io/styleguide/tsguide.html#structural-types-vs-nominal-types)

Good:

```typescript
const foo: Foo = {
  a: 123,
  b: 'abc',
};
```

Bad:

```typescript
const badFoo = {
  a: 123,
  b: 'abc',
};
```

## [Interfaces vs Type Aliases](https://google.github.io/styleguide/tsguide.html#interfaces-vs-type-aliases)

Good:

```typescript
interface User {
  firstName: string;
  lastName: string;
}
```

Bad:

```typescript
type User = {
  firstName: string;
  lastName: string;
};
```

## [`Array<T>` Type](https://google.github.io/styleguide/tsguide.html#arrayt-type)

- For simple types (containing just alphanumeric characters and dot), use the syntax sugar for arrays, `T[]`.
- For anything more complex, use the longer form `Array<T>`.

Good:

```typescript
const a: string[];
const b: readonly string[];
const c: ns.MyObj[];
const d: Array<string | number>;
const e: ReadonlyArray<string | number>;
```

Bad:

```typescript
const f: Array<string>; // the syntax sugar is shorter
const g: ReadonlyArray<string>;
const h: { n: number; s: string }[]; // the braces/parens make it harder to read
const i: (string | number)[];
const j: readonly (string | number)[];
```

## [`any` Type](https://google.github.io/styleguide/tsguide.html#any)

Avoid using `any` when possible

## [Using `unknown` over `any`](https://google.github.io/styleguide/tsguide.html#any-unknown)

```typescript
// Can assign any value (including null or undefined) into this but cannot
// use it without narrowing the type or casting.
const val: unknown = value;
```

```typescript
const danger: any = value; /* result of an arbitrary expression */
danger.whoops(); // This access is completely unchecked!
```

## [Tuple Types](https://google.github.io/styleguide/tsguide.html#tuple-types)

If you are tempted to create a Pair type, instead use a tuple type

Good:

```typescript
function splitInHalf(input: string): [string, string] {
  ...
  return [x, y];
}

// Use it like:
const [leftHalf, rightHalf] = splitInHalf('my string');
```

Bad:

```typescript
interface Pair {
  first: string;
  second: string;
}
function splitInHalf(input: string): Pair {
  ...
  return {first: x, second: y};
}
```

However, often it's clearer to provide meaningful names for the properties.

```typescript
function splitHostPort(address: string): {host: string, port: number} {
  ...
}

// Use it like:
const address = splitHostPort(userAddress);
use(address.port);

// You can also get tuple-like behavior using destructuring:
const {host, port} = splitHostPort(userAddress);
```

## Other

- [Field initializers](https://google.github.io/styleguide/tsguide.html#field-initializers)
- [Type coercion](https://google.github.io/styleguide/tsguide.html#type-coercion)
- [Exceptions](https://google.github.io/styleguide/tsguide.html#exceptions)
- [Iterating objects](https://google.github.io/styleguide/tsguide.html#iterating-objects)
- [Iterating containers](https://google.github.io/styleguide/tsguide.html#iterating-containers)
- [Using the spread operator](https://google.github.io/styleguide/tsguide.html#using-the-spread-operator)
- [Control flow statements & blocks](https://google.github.io/styleguide/tsguide.html#control-flow-statements-blocks)
- [Equality Checks](https://google.github.io/styleguide/tsguide.html#equality-checks)
- [Use arrow functions in expressions](https://google.github.io/styleguide/tsguide.html#use-arrow-functions-in-expressions)
- [Rebinding `this`](https://google.github.io/styleguide/tsguide.html#rebinding-this)
- [@ts-ignore](https://google.github.io/styleguide/tsguide.html#ts-ignore)

## Naming

### UpperCamelCase

- class
- interface
- type
- enum
- decorator
- type parameters

### lowerCamelCase

- variable
- parameter
- function
- method
- property
- module alias

### CONSTANT_CASE

- global constant values, including enum values
