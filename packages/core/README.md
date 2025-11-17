# @tplx/core

Core template parsing and formatting logic for tplx.

This package contains the foundational JavaScript API for:

- Parsing templates with customizable delimiters
- Extracting input placeholders from templates
- Formatting templates with provided values
- Reading template files with front matter support

## Installation

```bash
npm i @tplx/core
```

## Usage

### Basic Template Formatting

```javascript
import * as tplx from '@tplx/core'

const templateContent = 'Hello, {name}! Welcome to {location}.'
const result = tplx.format(templateContent, { name: 'World', location: 'tplx' })
console.log(result) // "Hello, World! Welcome to tplx."
```

### Extracting Template Inputs

```javascript
import * as tplx from '@tplx/core'

const templateContent = 'Hello, {name}! Welcome to {location}.'
const inputs = tplx.getInputs(templateContent)
console.log(inputs) // ['name', 'location']
```

### Reading Template Files

```javascript
import * as tplx from '@tplx/core'

// Asynchronous
const template = await tplx.read('greeting.md')
console.log(template.content) // Template content without front matter
console.log(template.inputs) // Array of required inputs
console.log(template.options) // Options from front matter

// Synchronous
import * as tplx from '@tplx/core'
const template = tplx.readSync('greeting.md')
```

### Custom Delimiters

```javascript
import * as tplx from '@tplx/core'

const delimiters = { open: '<<', close: '>>' }
const templateContent = 'Hello, <<name>>!'

const inputs = tplx.getInputs(templateContent, delimiters)
const result = tplx.format(templateContent, { name: 'World' }, { delimiters })
console.log(result) // "Hello, World!"
```

### Front Matter Support

Templates can include YAML front matter with tplx configuration:

```markdown
---
tplx:
  delimiters:
    open: '<<'
    close: '>>'
  strict: false
---

Hello, <<name>>!
```

When using `read()` or `readSync()`, the front matter is automatically parsed and options are extracted.

## API

### `format(templateContent, values, options)`

Formats a template string with the provided values.

**Parameters:**

- `templateContent` (string): The template string to format
- `values` (object): Object containing values for template placeholders
- `options` (object, optional):
  - `delimiters` (object): Custom delimiters with `open` and `close` properties (default: `{ open: '{', close: '}' }`)
  - `strict` (boolean): Whether to throw an error on missing values (default: `false`)

**Returns:** String with placeholders replaced by values

**Example:**

```javascript
tplx.format('Hello, {name}!', { name: 'World' })
// "Hello, World!"

tplx.format(
  'Hello, <<name>>!',
  { name: 'World' },
  {
    delimiters: { open: '<<', close: '>>' },
  },
)
// "Hello, World!"
```

### `getInputs(templateContent, delimiters)`

Extracts input placeholder names from a template string.

**Parameters:**

- `templateContent` (string): The template string to parse
- `delimiters` (object, optional): Custom delimiters with `open` and `close` properties (default: `{ open: '{', close: '}' }`)

**Returns:** Array of unique placeholder names

**Example:**

```javascript
tplx.getInputs('Hello, {name}! Welcome to {location}.')
// ['name', 'location']

tplx.getInputs('Hello, <<name>>!', { open: '<<', close: '>>' })
// ['name']
```

### `read(templateFileName, options)`

Asynchronously reads and parses a template file, extracting content, inputs, and front matter options.

**Parameters:**

- `templateFileName` (string): Path to the template file
- `options` (object, optional, overrides front matter):
  - `title` (string): Title for the template
  - `description` (string): Description for the template
  - `delimiters` (object): Custom delimiters
  - `strict` (boolean): Whether to error on missing values

**Returns:** Promise resolving to an object with:

- `content` (string): Template content without front matter
- `inputs` (array): Array of required input names
- `options` (object): Merged options from front matter and parameters

**Example:**

```javascript
const template = await tplx.read('greeting.md')
console.log(template.content) // "Hello, {name}!"
console.log(template.inputs) // ['name']
console.log(template.options) // { delimiters: { open: '{', close: '}' } }
```

### `readSync(templateFileName, options)`

Synchronously reads and parses a template file. Same as `read()` but synchronous.

**Parameters:** Same as `read()`

**Returns:** Object with same structure as `read()`

**Example:**

```javascript
const template = tplx.readSync('greeting.md')
```

## Related Packages

- [tplx](https://github.com/aaronccasanova/tplx/tree/main/packages/tplx) - CLI tool and JavaScript SDK (re-exports @tplx/core)
- [@tplx/mcp](https://github.com/aaronccasanova/tplx/tree/main/packages/mcp) - MCP server for exposing templates as MCP prompts
