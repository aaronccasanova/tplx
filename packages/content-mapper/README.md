# @tplx/content-mapper

Import a TPLX template and get input-name checking from its contents. The imported module exports `format(values)`, with required properties inferred from the same placeholder extraction used by TPLX at runtime. There is no separate interface to maintain.

This integration is experimental and tested with TypeScript `7.1.0-beta` and Node.js 22.23.2. It requires Node.js 22.18 or newer. TypeScript 6 and 7.0 do not support content mappers.

## Try it in this repository

From the repository root:

```sh
pnpm install
pnpm test:typed-example
```

The [example](../../examples/typed-templates) contains a template, its TypeScript caller, and a `tsconfig.json`. Remove a required argument or misspell its name to see a compiler error.

## Setup

Install `@tplx/content-mapper` as a dependency and TypeScript `7.1.0-beta` as a development dependency. Keep the mapper installed wherever the Node loading hook is used, including production execution.

Register `.tplx` files in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "strict": true,
    "noEmit": true
  },
  "contentMappers": [
    {
      "package": "@tplx/content-mapper",
      "extensions": [".tplx"]
    }
  ],
  "include": ["src"]
}
```

Create `src/greeting.tplx`:

```markdown
---
tplx:
  delimiters:
    open: '<<'
    close: '>>'
---
Hello, <<name>>! Summarize <<topic>>.
```

Import it in an ESM project (`"type": "module"` in `package.json`):

```ts
import { format as formatGreeting } from './greeting.tplx'

const formattedGreeting = formatGreeting({
  name: 'Aaron',
  topic: 'content mappers',
})

console.log(formattedGreeting)
```

Check and run:

```sh
npx tsc --runExternalCode
node --import @tplx/content-mapper/register src/index.ts
```

The Node command uses native TypeScript stripping. For projects requiring TypeScript transformations, compile the caller first and run its JavaScript with the same `--import` hook. Copy `.tplx` assets alongside the emitted caller at the same relative paths. TypeScript emits declarations for mapped templates but does not emit their JavaScript or copy their source files.

## What is checked

- All discovered inputs are required by default. Duplicate occurrences become one property.
- Misspelled and unexpected properties in object literals are rejected. Normal TypeScript structural typing still permits extra properties through variables.
- Existing custom delimiters and `tplx.strict: false` frontmatter are respected. Non-strict templates have optional known inputs. The values object itself is still required.
- Names such as `user.name` remain literal flat keys. They do not become nested objects or expressions.
- Input values are typed as `unknown`. This accepts existing values without inventing a schema or narrowing the renderer to strings. Runtime conversion and validation remain TPLX's responsibility.

The current renderer considers falsy values such as `''`, `0`, and `false` missing. Strict templates throw for them, and non-strict templates replace them with an empty string. This integration preserves that existing behavior. Input-name checking does not guarantee that a particular value renders successfully.

The imported formatter binds the template's content and options. It does not accept delimiter or strictness overrides that could change its inferred inputs. The existing `format`, `read`, and `readSync` APIs remain available for dynamic templates and options. A string passed to `read(path)` is not a statically imported module and does not acquire inferred names from this mapper.

## Editor support and boundaries

Use TypeScript 7 editor tooling with the project's `7.1.0-beta` compiler. Content mappers require workspace trust and permission to run the mapper. Node must be available to the editor process. The integration tests exercise TypeScript's actual language server, including argument completion and changes to unsaved template content. They do not automate the VS Code permission UI.

The mapper returns synthesized declarations. It supplies caller-side types and completion, but does not map rename or navigation locations into individual placeholders inside the template. For Markdown highlighting, you can associate `*.tplx` with Markdown in your editor.

The provided Node hook handles `.tplx` file imports only. It leaves other files alone and uses normal Node module caching. It is not a bundler plugin, browser loader, or hot-reload system. Merely registering another extension with TypeScript does not teach the Node hook to load it.

The mapper and runtime both call core's `parseTemplate`, which uses the existing frontmatter and placeholder logic. The mapper consumes text supplied by TypeScript, including unsaved editor text. Runtime imports read saved files.

See [TypeScript's content-mapper announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/) and [the implementation protocol](https://github.com/microsoft/typescript-go/pull/4712). The protocol is new and may change before a stable TypeScript release.
