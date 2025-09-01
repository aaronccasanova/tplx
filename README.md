# tplx

A lightweight tool for inspecting and rendering templates.

## Features

- Inspect templates to see required inputs.
- Render templates with provided values.
- Support for custom delimiters.
- Strict mode to error on missing values.

## Usage

`tplx` offers two primary commands: `inspect` and `render`.

### `inspect`

Use the `inspect` command to identify the required input values for a template file.

```bash
npx tplx inspect <template-file> [options]
```

This will output the necessary inputs and provide an example `render` command.

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

npx tplx render GREETING.md [options...] -- \
  --name <name> \
  --location <location>
```

### `render`

Use the `render` command to render a template with the specified input values.

```bash
npx tplx render <template-file> [options...] -- --<input> <value>
```

**Example:**

To render the `greeting.md` template:

```bash
npx tplx render greeting.md -- --name "World" --location "tplx"
```

This will output:

```
Hello, World! Welcome to tplx.
```

## Options

Options can be provided to both `inspect` and `render` commands:

- `--strict`: A boolean that when `true` will cause the command to exit with an error if any input values are missing. Defaults to `true`.
- `--open-delimiter <string>`: Customize the open delimiter. Defaults to `{`.
- `--close-delimiter <string>`: Customize the close delimiter. Defaults to `}`.

**Example with custom delimiters:**

Given a template `custom.md`:

```
%%% name @@@
```

You can use the delimiter options to render it:

```bash
npx tplx render custom.md --open-delimiter '%%%' --close-delimiter '@@@' -- --name "Custom"
```

This will output:

```
Custom
```
