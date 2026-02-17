# @tplx/mcp

MCP server that automatically exposes `tplx` templates as MCP prompts. Point it at template files using glob patterns, and it will make them available to any MCP-compatible AI application.

## Features

- **Template Discovery**: Scan for template files using glob patterns
- **Automatic Configuration**: Extract template placeholders and front matter metadata to auto-configure MCP prompts
- **Lazy Loading**: Templates are read once to register metadata, then loaded on-demand when executed

## Usage

### MCP Configuration

Add the `tplx` server to your MCP client configuration. There are two approaches:

#### Using the CLI (Quick Start)

The simplest way to get started - add this to your MCP config:

```json
{
  "mcpServers": {
    "tplx": {
      "command": "npx",
      "args": ["@tplx/mcp", "-t", "templates/**/*.md"]
    }
  }
}
```

> See [CLI Reference](#cli-reference) below for more configuration examples and options.

#### Using a Custom Script

For guaranteed relative path resolution, create a local script:

**my-tplx-mcp-server.js:**

```javascript
import { createTplxMCPServer } from '@tplx/mcp'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

const mcpServer = await createTplxMCPServer({
  cwd: import.meta.dirname,
  templates: ['templates/**/*.md'],
})

await mcpServer.connect(new StdioServerTransport())
```

**MCP Config:**

```json
{
  "mcpServers": {
    "tplx": {
      "command": "node",
      "args": ["/absolute/path/to/my-tplx-mcp-server.js"]
    }
  }
}
```

**Why use a script?** When MCP servers are started, there's no guarantee what the current working directory will be. By using a local script, you can use absolute paths or paths relative to your script file, ensuring templates are always found correctly.

**Transport flexibility:** `createTplxMCPServer` returns an unconnected `McpServer`. You can connect any MCP transport — `StdioServerTransport` for CLI-based servers, `StreamableHTTPServerTransport` for HTTP servers, etc.

> See [JavaScript API](#javascript-api) below for more configuration examples and options.

### JavaScript API

```typescript
interface CreateTplxMCPServerOptions {
  /** Name of the MCP server (default: 'tplx-server') */
  name?: string

  /** Version of the MCP server (default: '0.0.0') */
  version?: string

  /** Current working directory for resolving glob patterns (default: process.cwd()) */
  cwd?: string

  /** Array of template file paths or glob patterns */
  templates: string[]
}
```

### CLI Reference

You can also run the MCP server directly from the command line (useful for testing):

```bash
# Single template
npx @tplx/mcp -t templates/code-review.md

# Multiple templates
npx @tplx/mcp -t templates/foo.md -t templates/bar.md

# Using glob patterns
npx @tplx/mcp -t 'templates/**/*.md'

# Multiple patterns
npx @tplx/mcp -t 'templates/*.md' -t 'prompts/**/*.md'

# With custom working directory
npx @tplx/mcp -t '**/*.md' -c /path/to/project
```

**CLI Options:**

- `-t, --template <pattern>` - Template file or glob pattern (can be used multiple times)
- `-c, --cwd <path>` - Working directory for resolving templates (default: current directory)
- `-h, --help` - Show help message

## Template Format

Templates use the standard `tplx` format with optional front matter:

```markdown
---
title: 'Code Review'
description: 'Review code for best practices'
---

Please review this code:

{code}

Focus on {language} best practices.
```

Or with custom delimiters:

```markdown
---
title: 'Code Review'
description: 'Review code for best practices'
tplx:
  title: 'Overrides top-level title'
  description: 'Overrides top-level description'
  delimiters:
    open: '<<'
    close: '>>'
---

Please review this code:

<<code>>

Focus on <<language>> best practices.
```

### Front Matter Options

- `title` - Display name for the prompt (default: derived from filename)
- `description` - Description of what the prompt does (default: "Template: {path}")
- `delimiters` - Custom delimiters (default: `{` and `}`)
- `strict` - Whether to error on missing values (note: MCP server always uses `strict: false`)

### Prompt Arguments

The MCP server automatically extracts template placeholders and registers them as prompt arguments. For example, a template with `{name}` and `{department}` will create a prompt accepting `name` and `department` arguments.

## How It Works

1. **Registration Phase**: When the server starts, it:
   - Globs all template files matching the provided patterns
   - Reads each template using `tplx.read()` to extract inputs and metadata
   - Registers each template as an MCP prompt with appropriate arguments
   - Stores metadata but discards the content (letting GC clean up)

2. **Execution Phase**: When a prompt is invoked:
   - The server lazily loads the template using `tplx.read()`
   - Formats the template with the provided arguments using `tplx.format()`
   - Returns the formatted content as a message

This design ensures templates are always fresh and memory usage is minimal.

## Examples

See the [examples directory](https://github.com/aaronccasanova/tplx/tree/main/examples) in the `tplx` repository for:

- Sample templates with front matter
- Custom server script using the JavaScript API

## Related Packages

- [@tplx/core](https://github.com/aaronccasanova/tplx/tree/main/packages/core) - Core template parsing and formatting logic
- [tplx](https://github.com/aaronccasanova/tplx/tree/main/packages/tplx) - CLI tool and JavaScript SDK
