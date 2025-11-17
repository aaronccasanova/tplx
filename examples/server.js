/**
 * Example script showing how to use the JavaScript API
 *
 * This approach is useful when you want to configure the MCP server
 * from a script that's relative to your project, ensuring templates
 * can be resolved correctly regardless of where the MCP server is started.
 *
 * You can point your MCP config to this script file instead of using
 * the CLI directly.
 */
import { createTplxMCPServer } from '../packages/mcp/src/index.js'

// Start the server with templates relative to this file
await createTplxMCPServer({
  name: 'example-tplx-mcp-server',
  version: '0.0.0',
  cwd: import.meta.dirname,
  templates: ['*.md'],
})
