# tplx

A lightweight tool for inspecting and formatting templates.

## Packages

This monorepo contains the following packages under the `@tplx` organization:

### [`tplx`](./packages/tplx)

Command-line interface and JavaScript SDK for inspecting and formatting templates. This is the main package most users will interact with.

- `inspect` command to see required template inputs
- `format` command to render templates with values
- Full JavaScript SDK (re-exports all functionality from [`@tplx/core`](./packages/core))

```bash
npx tplx inspect template.md
npx tplx format template.md -- --name "World"
```

### [`@tplx/core`](./packages/core)

Core template parsing and formatting logic. This package provides the fundamental functionality for working with tplx templates programmatically.

- Parse templates with customizable delimiters
- Extract input placeholders from templates
- Format templates with provided values
- Read template files with front matter support

```bash
npm i @tplx/core
```

### [`@tplx/mcp`](./packages/mcp)

MCP server that automatically exposes `tplx` templates as MCP prompts.

- Automatic template discovery from glob patterns
- Dynamic prompt generation with extracted arguments
- Lazy loading for optimal memory usage
- CLI and JavaScript API

```bash
npx @tplx/mcp --template 'templates/**/*.md'
```

### [`@tplx/content-mapper`](./packages/content-mapper)

Experimental TypeScript 7.1 integration for imported `.tplx` templates. Each template exports a `format(values)` function whose input names come directly from its contents and frontmatter. A Node loading hook supplies the runtime import behavior.

```ts
import { format as formatCodeReview } from './code-review.tplx'

const formattedCodeReview = formatCodeReview({
  language: 'JavaScript',
  code: 'const greeting = "Hello"',
})
```

See the [setup, guarantees, and runtime requirements](./packages/content-mapper/README.md), or run `pnpm test:typed-example` after installing this workspace's dependencies. The current implementation targets TypeScript `7.1.0-beta` and Node.js 22.18 or newer.

## Quick Start

```bash
# Create a template file
echo "Hello, {name}!" > greeting.md

# Inspect the template
npx tplx inspect greeting.md

# Format the template
npx tplx format greeting.md -- --name "World"
```

## Features

- 📝 **Simple Syntax**: Use `{placeholder}` syntax by default
- 🔧 **Customizable Delimiters**: Support for custom delimiter patterns
- ✅ **Strict Mode**: Optionally error on missing values
- 📄 **Front Matter**: Configure templates with YAML front matter
- 🔌 **Programmatic API**: Use as a library in your Node.js projects
- 🤖 **MCP Integration**: Expose templates as MCP prompts

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

### `format(templateContent, values, options)`

Formats a template string with the given values.

### `getInputs(templateContent, delimiters)`

Extracts input keys from a template string.

### `read(templateFileName)`

Reads a template file, parses front matter, and returns an object containing the content, inputs, and options.

### `readSync(templateFileName)`

A synchronous version of `read`.

### `parseTemplate(templateFileContent, options)`

Parses template source with the same frontmatter, option overrides, and placeholder discovery as `read`, without reading a file.
