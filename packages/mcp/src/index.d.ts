import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

export interface CreateTplxMCPServerOptions {
  /**
   * Name of the MCP server
   * @default 'tplx-mcp-server'
   */
  name?: string

  /**
   * Version of the MCP server
   * @default '0.0.0'
   */
  version?: string

  /**
   * Current working directory for resolving glob patterns
   * @default process.cwd()
   */
  cwd?: string

  /**
   * Array of template file paths or glob patterns
   * @example ['templates/foo.md', 'templates/bar/*.md']
   */
  templates: string[]

  /**
   * Concurrency limit for loading templates
   * @default os.cpus().length
   */
  concurrency?: number
}

/**
 * Create and configure an MCP server for tplx templates
 *
 * This function will:
 * 1. Glob all template files matching the provided patterns
 * 2. Read each template to extract inputs and metadata
 * 3. Register each template as an MCP prompt
 * 4. Lazily load and format templates when prompts are executed
 *
 * @param options - Configuration options for the MCP server
 * @returns Promise resolving to the configured MCP server
 *
 * @example
 * ```js
 * import { createTplxMCPServer } from '@tplx/mcp'
 *
 * await createTplxMCPServer({
 *   templates: ['templates/*.md'],
 *   cwd: import.meta.dirname,
 * })
 * ```
 */
export declare function createTplxMCPServer(
  options: CreateTplxMCPServerOptions,
): Promise<McpServer>
