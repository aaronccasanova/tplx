# tplx

A lightweight tool for inspecting and formatting templates.

## Features

- Inspect templates to see required inputs.
- Format templates with provided values.
- Support for custom delimiters.
- Strict mode to error on missing values.
- Front matter support for template-specific configuration.

## Usage

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

## Front Matter

You can define template-specific options using front matter. The `tplx` field in the front matter can be used to specify options like `delimiters` and `strict`.

**Example:**

Given a template `custom-delimiters.md`:

```markdown
---
tplx:
  delimiters:
    open: '<<'
    close: '>>'
---

Hello, <<name>>!
```

You can format it without passing delimiter options through the CLI:

```bash
npx tplx format custom-delimiters.md -- --name "Front Matter"
```

This will output:

```
Hello, Front Matter!
```

## API

`tplx` can also be used as a module.

### `format(tpl, values, options)`

Formats a template string with the given values.

### `getInputs(tpl, delimiters)`

Extracts input keys from a template string.

### `read(templateFileName)`

Reads a template file, parses front matter, and returns an object containing the content, inputs, and options.

### `readSync(templateFileName)`

A synchronous version of `read`.
