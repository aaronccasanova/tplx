#!/usr/bin/env node
import * as path from 'node:path'
import * as util from 'node:util'

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { createTplxMCPServer } from '../src/index.js'

const args = util.parseArgs({
  options: {
    template: {
      type: 'string',
      short: 't',
      multiple: true,
    },
    cwd: {
      type: 'string',
      short: 'c',
    },
    help: {
      type: 'boolean',
      short: 'h',
    },
  },
})

const templates = args.values.template || []

const cwd = args.values.cwd ? path.resolve(args.values.cwd) : process.cwd()

if (!templates.length) {
  console.error('Error: No templates specified')
  console.error('Use -t/--template to specify template files or glob patterns')
  console.error('Run with --help for usage information')
  process.exit(1)
}

if (args.values.help) {
  console.log(`
Tplx MCP Server

Usage:
  npx @tplx/mcp [options]

Options:
  -t, --template <pattern>  Template file or glob pattern (can be used multiple times)
  -c, --cwd <path>          Working directory for resolving templates (default: current directory)
  -h, --help                Show this help message

Examples:
  npx @tplx/mcp -t templates/foo.md -t 'templates/bar/*.md'
  npx @tplx/mcp -t '**/*.md' -c /path/to/project

JavaScript API:
  import { createTplxMCPServer } from '@tplx/mcp'

  await createTplxMCPServer({
    cwd: import.meta.dirname,
    templates: ['templates/*.md'],
  })
`)

  process.exit(0)
}

try {
  const mcpServer = await createTplxMCPServer({
    templates,
    cwd,
  })

  await mcpServer.connect(new StdioServerTransport())
} catch (error) {
  console.error('Error starting Tplx MCP server:', error)

  process.exit(1)
}
