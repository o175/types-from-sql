#!/usr/bin/env node
import * as pg from 'pg'
import { SqlAnalyzer } from './SqlAnalyzer';
import { program } from 'commander';
import { sync } from "fast-glob";
import { readFileSync } from "fs";

program
  .option('-f, --files', 'specify file paggerns containing sql')

program.parse(process.argv)

let sqls = [] as string[];

if(program.files) {
  const filenames = sync(program.args, { unique: true })
  for(const filename of filenames) {
    sqls.push(readFileSync(filename, "utf8"));
  }
} else {
  sqls = program.args;
}

(async()=>{
  const client = new pg.Client();
  await client.connect();
  const analyzer = new SqlAnalyzer(client);

  for (const e of sqls){
     const generated = await analyzer.getInterface(e);
     console.log(generated);
  }
  process.exit();
})()





