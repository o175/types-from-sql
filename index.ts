#!/usr/bin/env node
import * as pg from 'pg'
import { SqlAnalyzer } from './SqlAnalyzer';
import { program } from 'commander';
import { sync } from "fast-glob";
import { readFileSync } from "fs";
import {basename, extname} from 'path';

program
    .option('-f, --files', 'specify file patterns containing sql')
    .option('-c, --cammelize', 'set interface properties to cammelCase')
    .option('-fn, --files-named', 'specify file patterns containing sql, set interface name from file name')
    .option('--out-dir <dir>', 'specify directory to write each interface in separate file')

program.parse(process.argv)

let sqls = [] as {sql: string, interfaceName?: string }[];
if(program.files || program.filesNamed) {
  const filenames = sync(program.args, { unique: true })
  for(const filename of filenames) {
    sqls.push({sql: readFileSync(filename, "utf8"), ...program.filesNamed? {interfaceName: basename(filename, extname(filename))}: {}});
  }
} else {
  sqls = program.args.map(arg=>({sql:arg}));
}

(async()=>{
  const client = new pg.Client();
  await client.connect();
  const analyzer = new SqlAnalyzer(client, !!program.cammelize);

  for (const e of sqls){
    const generated = await analyzer.getInterface(e.sql, e.interfaceName, program.outDir);
    console.log(generated);
  }
  process.exit();
})()





