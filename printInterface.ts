import { writeFileSync } from 'fs'
import { join } from 'path'

export function generateInterface(
  iName: string,
  fields: { [K: string]: { dataTypeName: string; nullable: boolean } },
  outPath?: string
) {
  const interfaceString = `
export interface ${iName} {
${Object.entries(fields)
  .map(
    ([key, typename]) =>
      `  ${key}${typename.nullable ? '?' : ''}: ${typename.dataTypeName}`
  )
  .join(';\n')};
}
`

  if (outPath) {
    writeFileSync(join(outPath, `${iName}.ts`), interfaceString)
  }

  return interfaceString
}
