import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'

export const contentMapperDirPath = path.resolve(import.meta.dirname, '..')

export const compilerFilePath = path.resolve(
  contentMapperDirPath,
  '../../node_modules/typescript/bin/tsc',
)

export async function createProject(testContext, files) {
  const projectDirPath = await fs.mkdtemp(path.join(os.tmpdir(), 'tplx-mapper-'))

  testContext.after(() => fs.rm(projectDirPath, { recursive: true, force: true }))

  await fs.mkdir(path.join(projectDirPath, 'node_modules/@tplx'), { recursive: true })

  await fs.symlink(
    contentMapperDirPath,
    path.join(projectDirPath, 'node_modules/@tplx/content-mapper'),
    'junction',
  )

  await fs.writeFile(path.join(projectDirPath, 'package.json'), '{"type":"module"}')

  await fs.writeFile(path.join(projectDirPath, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      strict: true,
      noEmit: true,
      types: [],
    },
    contentMappers: [{ package: '@tplx/content-mapper', extensions: ['.tplx'] }],
    include: ['*.ts', '*.tplx'],
  }))

  await Promise.all(Object.entries(files).map(([fileName, fileContent]) =>
    fs.writeFile(path.join(projectDirPath, fileName), fileContent),
  ))

  return projectDirPath
}
