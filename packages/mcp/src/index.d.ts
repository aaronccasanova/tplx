import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

export interface RegisterTplxMCPPromptsOptions {
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

export interface CreateTplxMCPServerOptions extends RegisterTplxMCPPromptsOptions {
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
 * The returned MCP server is not connected to any transport. Call
 * `mcpServer.connect(transport)` with the transport of your choice
 * (e.g. StdioServerTransport, StreamableHTTPServerTransport).
 *
 * @param options - Configuration options for the MCP server
 * @returns Promise resolving to the configured (but unconnected) MCP server
 *
 * @example
 * ```js
 * import { createTplxMCPServer } from '@tplx/mcp'
 * import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
 *
 * const mcpServer = await createTplxMCPServer({
 *   templates: ['templates/*.md'],
 *   cwd: import.meta.dirname,
 * })
 *
 * await mcpServer.connect(new StdioServerTransport())
 * ```
 */
export declare function createTplxMCPServer(
  options: CreateTplxMCPServerOptions,
): Promise<McpServer>

/**
 * Register tplx templates as MCP prompts on an existing MCP server
 *
 * Use this when you already have an `McpServer` instance and want to
 * add tplx template prompts to it alongside other tools or prompts.
 *
 * @param mcpServer - An existing MCP server instance
 * @param options - Configuration options for template discovery
 *
 * @example
 * ```js
 * import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
 * import { registerTplxMCPPrompts } from '@tplx/mcp'
 *
 * const mcpServer = new McpServer({ name: 'my-server', version: '1.0.0' })
 *
 * await registerTplxMCPPrompts(mcpServer, {
 *   cwd: import.meta.dirname,
 *   templates: ['templates/*.md'],
 * })
 *
 * // Register additional tools, prompts, etc.
 * // Then connect a transport of your choice.
 * ```
 */
export declare function registerTplxMCPPrompts(
  mcpServer: McpServer,
  options: RegisterTplxMCPPromptsOptions,
): Promise<void>
