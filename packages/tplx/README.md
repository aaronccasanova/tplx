# tplx

A lightweight tool for inspecting and formatting templates.

`tplx` is both a command-line tool and a JavaScript library. It provides:

- **CLI Commands**: `inspect` and `format` commands for working with templates from the terminal
- **JavaScript SDK**: Full programmatic API (re-exports all functionality from [@tplx/core](https://github.com/aaronccasanova/tplx/tree/main/packages/core))

## Installation

```bash
npm i tplx
```

## Features

- Inspect templates to see required inputs
- Format templates with provided values
- Support for custom delimiters
- Strict mode to error on missing values
- Front matter support for template-specific configuration
- Full programmatic API for Node.js projects

## CLI Usage

`tplx` offers two primary commands: `inspect` and `format`.

### `inspect`

Use the `inspect` command to identify the required input values for a template file.

```bash
npx tplx inspect <template-file> [options]
```

This will output the necessary inputs and provide an example `format` command.

**Example:**

Given a template file `greeting.md`:

```markdown
Hello, {name}! Welcome to {location}.
```

Running `tplx inspect greeting.md` will produce:

```
Options:

  --strict            Error on missing input values (default: true)
  --open-delimiter    Customize open delimiter (default: '{')
  --close-delimiter   Customize close delimiter (default: '}')

Inputs:

  --name <name>
  --location <location>

Example:

npx tplx format greeting.md [options...] -- \
  --name <name> \
  --location <location>
```

### `format`

Use the `format` command to format a template with the specified input values.

```bash
npx tplx format <template-file> [options...] -- --<input> <value>
```

**Example:**

To format the `greeting.md` template:

```bash
npx tplx format greeting.md -- --name "World" --location "tplx"
```

This will output:

```
Hello, World! Welcome to tplx.
```

## Options

Options can be provided to both `inspect` and `format` commands:

- `--strict`: A boolean that when `true` will cause the command to exit with an error if any input values are missing. Defaults to `true`.
- `--open-delimiter <string>`: Customize the open delimiter. Defaults to `{`.
- `--close-delimiter <string>`: Customize the close delimiter. Defaults to `}`.

**Example with custom delimiters:**

Given a template `custom.md`:

```
%%% name @@@
```

You can use the delimiter options to format it:

```bash
npx tplx format custom.md --open-delimiter '%%%' --close-delimiter '@@@' -- --name "Custom"
```

This will output:

```
Custom
```

## Front Matter Support

Templates can include YAML front matter to configure default options:

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

These options can be overridden by command-line arguments.

## Programmatic Usage

`tplx` re-exports all functionality from `@tplx/core`, providing a complete JavaScript SDK:

```javascript
import * as tplx from 'tplx'

// Format a template string
const result = tplx.format('Hello, {name}!', { name: 'World' })
console.log(result) // "Hello, World!"

// Get inputs from a template
const inputs = tplx.getInputs('Hello, {name}! Welcome to {location}.')
console.log(inputs) // ['name', 'location']

// Read a template file
const template = await tplx.read('template.md')
console.log(template.content)
console.log(template.inputs)
console.log(template.options)
```

## API Reference

This package re-exports all functionality from [@tplx/core](https://github.com/aaronccasanova/tplx/tree/main/packages/core). For detailed API documentation, see the [@tplx/core documentation](https://www.npmjs.com/package/@tplx/core).

### Available Functions

- `format(templateContent, values, options)` - Format a template string with provided values
- `getInputs(templateContent, delimiters)` - Extract input placeholder names from a template
- `read(templateFileName, options)` - Asynchronously read and parse a template file
- `readSync(templateFileName, options)` - Synchronously read and parse a template file

## Related Packages

- [@tplx/core](https://github.com/aaronccasanova/tplx/tree/main/packages/core) - Core template parsing and formatting logic
- [@tplx/mcp](https://github.com/aaronccasanova/tplx/tree/main/packages/mcp) - MCP server for exposing templates as AI prompts
