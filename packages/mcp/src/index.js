import * as path from 'node:path'
import * as os from 'node:os'

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { globby } from 'globby'
import { z } from 'zod'
import pLimit from 'p-limit'

import * as tplx from '@tplx/core'

/**
 * Create and configure an MCP server for tplx templates
 *
 * The returned server is not connected to any transport. Call
 * `server.connect(transport)` with the transport of your choice.
 *
 * @param {import('./index.d.ts').CreateTplxMCPServerOptions} options
 * @returns {Promise<import('@modelcontextprotocol/sdk/server/mcp.js').McpServer>}
 */
export async function createTplxMCPServer(options) {
  const {
    name = 'tplx-mcp-server',
    version = '0.0.0',
    cwd = process.cwd(),
    templates,
    concurrency = os.cpus().length,
  } = options

  const mcpServer = new McpServer({
    name,
    version,
  })

  const templateFilePaths = await globby(templates, {
    cwd,
    absolute: true,
    gitignore: true,
  })

  const promptNamesToTemplateFilePaths = new Map()

  const limit = pLimit(concurrency)

  await limit.map(templateFilePaths, (templateFilePath) =>
    registerPromptFromTemplateFilePath(
      mcpServer,
      templateFilePath,
      promptNamesToTemplateFilePaths,
      cwd,
    ).catch((error) => {
      console.error(
        `Error registering prompt from '${templateFilePath}':`,
        error,
      )
    }),
  )

  return mcpServer
}

/**
 * Register an MCP prompt from a tplx template file
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} mcpServer
 * @param {string} templateFilePath
 * @param {Map<string, string>} promptNamesToTemplateFilePaths
 * @param {string} cwd
 */
async function registerPromptFromTemplateFilePath(
  mcpServer,
  templateFilePath,
  promptNamesToTemplateFilePaths,
  cwd,
) {
  const template = await tplx.read(templateFilePath)

  const templateFileName = path.relative(cwd, templateFilePath)

  const parsedTemplateFile = path.parse(templateFileName)

  const promptName = path
    .join(parsedTemplateFile.dir, parsedTemplateFile.name)
    .replace(/[/\\]/g, '-')
    .toLowerCase()

  if (promptNamesToTemplateFilePaths.has(promptName)) {
    throw new Error(
      `Duplicate prompt name "${promptName}" for template "${templateFilePath}". Skipping registration.`,
    )
  }

  promptNamesToTemplateFilePaths.set(promptName, templateFilePath)

  const title = template.options.title ?? promptName

  const description =
    template.options.description ?? `Template: ${templateFileName}`

  const argsSchema = Object.fromEntries(
    template.inputs.map((input) => [input, z.string()]),
  )

  mcpServer.registerPrompt(
    promptName,
    {
      title,
      description,
      argsSchema,
    },
    async (args) => {
      try {
        const templateFilePath = promptNamesToTemplateFilePaths.get(promptName)

        if (!templateFilePath) {
          throw new Error(`Template not found for ${promptName}`)
        }

        const template = await tplx.read(templateFilePath)

        const formattedTemplateContent = tplx.format(
          template.content,
          args,
          template.options,
        )

        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: formattedTemplateContent,
              },
            },
          ],
        }
      } catch (error) {
        return {
          isError: true,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: error instanceof Error ? error.message : String(error),
              },
            },
          ],
        }
      }
    },
  )
}
