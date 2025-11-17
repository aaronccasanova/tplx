# Tplx Examples

This directory contains example templates demonstrating the capabilities of both the `tplx` CLI and the `@tplx/mcp` server.

## Files

- `code-review.md` - Code review prompt with standard delimiters
- `meeting-summary.md` - Meeting summary template with front matter configuration
- `bug-report.md` - Bug report template with custom delimiters (`{{` and `}}`)
- `server.js` - Example server script using the JavaScript API

## Using the `tplx` CLI

### Inspecting Templates

Inspect a template to see required inputs:

```bash
# From the examples directory
npx tplx inspect code-review.md

# From the project root
npx tplx inspect examples/meeting-summary.md
```

### Formatting Templates

Format a template with provided values:

```bash
# Format the code review template
npx tplx format examples/code-review.md -- \
  --code "function hello() { console.log('world') }" \
  --language "JavaScript"

# Format the meeting summary template
npx tplx format examples/meeting-summary.md -- \
  --notes "Discussed Q4 roadmap. Decided to prioritize feature X. John will create tickets by Friday."

# Format the bug report template (uses custom delimiters)
npx tplx format examples/bug-report.md -- \
  --title "App crashes on startup" \
  --os "macOS 14.0" \
  --version "1.2.3" \
  --description "Application fails to launch" \
  --steps "1. Open app\n2. Observe crash" \
  --expected "App should start normally" \
  --actual "App crashes immediately" \
  --context "Only happens after recent update"
```

## Using the `@tplx/mcp` Server

### Configuration Files

The `@tplx/mcp` server is configured via JSON configuration files. Here are examples from this repository:

#### `.mcp.json`

```json
{
  "mcpServers": {
    "prompts": {
      "command": "node",
      "args": [
        "packages/mcp/bin/index.js",
        "--cwd",
        "examples",
        "--template",
        "*.md"
      ]
    }
  }
}
```

### Using the JavaScript API

You can also configure the MCP server programmatically using the JavaScript API:

```json
{
  "mcpServers": {
    "tplx-examples": {
      "command": "node",
      "args": ["examples/server.js"]
    }
  }
}
```

## Template Naming Convention

When exposed via the MCP server, templates are converted to prompt names by:

1. Taking the relative path from the `cwd`
2. Removing the `.md` extension
3. Replacing path separators with hyphens
4. Converting to lowercase

Examples:

- `code-review.md` → `code-review`
- `meeting-summary.md` → `meeting-summary`
- `templates/git/commit-message.md` → `templates-git-commit-message`
