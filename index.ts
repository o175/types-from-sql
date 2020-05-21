#!/usr/bin/env node
import * as pg from 'pg'
import _ from 'lodash'
import { SqlAnalyzer } from './SqlAnalyzer'
import { program } from 'commander'
import { sync } from 'fast-glob'
import { promises, createWriteStream } from 'fs'
import { basename, extname } from 'path'
import chokidar from 'chokidar'
import { join } from 'path'
import crypto from 'crypto'
import { logger } from './debug'

program
  .option('-c, --cammelize', 'set interface properties to cammelCase')
  .option(
    '-fn, --files-named',
    'specify file patterns containing sql, set interface name from file name'
  )
  .option(
    '--out-dir <dir>',
    'specify directory to write each interface in separate file'
  )
  .option(
    '--out-file <path>',
    'specify path and write all interfaces in a single file'
  )
  .option('--watch', 'watch file changes')

program.parse(process.argv)
class Runner {
  constructor(
    private analyzer: SqlAnalyzer,
    private filesNamed = false,
    private outFile?: string,
    private outDir?: string
  ) {}
  private cache = new Map<
    string,
    { interface: string; name: string; hash: string }
  >()
  async getInterfaceForFile(filename: string) {
    const content = await promises.readFile(filename, 'utf8')
    const hash = crypto.createHash('sha256').update(content).digest('hex')
    const cashed = this.cache.get(filename)
    if (cashed && cashed.hash === hash) {
      return cashed
    }
    const generated = await this.analyzer.getInterface(
      content,
      this.filesNamed ? basename(filename, extname(filename)) : undefined
    )
    this.cache.set(filename, { ...generated, hash })
    return generated
  }

  async run(files: string[]) {
    if (this.outFile) {
      logger.debug('output to single file')
      const stream = createWriteStream(this.outFile!)
      for (let filename of files) {
        const generated = await this.getInterfaceForFile(filename)
        await new Promise((resolve) => {
          stream.write(generated.interface, resolve)
        })
      }
      const done = new Promise((resolve, reject) => {
        stream.on('finish', resolve)
        stream.on('error', reject)
      })
      stream.end()
      await done
    }

    if (this.outDir) {
      logger.debug('output to multiple files')
      for (let filename of files) {
        const generated = await this.getInterfaceForFile(filename)
        const outPath = join(this.outDir, `${generated.name}.ts`)
        await promises.writeFile(outPath, generated.interface)
      }
    }
  }
}

;(async () => {
  const filenames = sync(program.args, { unique: true })
  const client = new pg.Client()
  await client.connect()
  const analyzer = new SqlAnalyzer(client, !!program.cammelize)
  const runner = new Runner(
    analyzer,
    program.filesNamed,
    program.outFile,
    program.outDir
  )
  await runner.run(filenames)

  if (program.watch) {
    chokidar.watch(filenames).on(
      'all',
      _.debounce(async () => {
        const newFilenames = sync(program.args, { unique: true })
        const newClient = new pg.Client()
        await newClient.connect()
        analyzer.client = newClient
        await runner.run(newFilenames)
      }, 1000)
    )
  } else {
    process.exit()
  }
})()
