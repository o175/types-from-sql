import { Client } from 'pg';
import { generateInterface } from './printInterface';
import { resolveTypeId } from './resolveTypeId'
import _ from 'lodash';
import DataLoader from 'dataloader';
import toCammel from 'camelcase-keys';

export interface IField {
  columnID: number,
  tableID: number,
}

export class SqlAnalyzer {
  constructor(public client: Client, private transformToCamelcase=false) {}
  async getInterface(query: string, forceInterfaceName?: string, outPath?:string) {
      const realQuery = `
       select * from (
         ${query}
       ) q where true = false;
`;

    await this.client.query({text: 'BEGIN', rowMode:'array'});
    const res = await this.client.query({text: realQuery, rowMode:'array'});
    await this.client.query({text: 'ROLLBACK', rowMode:'array'});
    const fields = await Promise.all(res.fields.map(
      async field => ({
      name: field.name,
      dataTypeName: resolveTypeId(field.dataTypeID),
      nullable: (await this.nullabilityDataLoader.load(field))
    }))) .then(fields=>
      fields.reduce((map, field)=>({...map, [field.name]: field } ), {}))
    return generateInterface(
      forceInterfaceName || this.getInterfaceName(query),
      this.transformToCamelcase? toCammel(fields): fields,
      outPath
    );
  }

  getInterfaceName(query: string) {
    return query.match(/@InterfaceName: (\w+)/)?.[1] ?? _.uniqueId('IGeneratedSql')
  }

  nullabilityDataLoader = new DataLoader(async (fields: readonly IField[])=> {
    const tableIds = fields.map(f=>f.tableID);
    const metadata = await this.client.query(`
        SELECT c.oid as table_id,a.*,pg_catalog.pg_get_expr(ad.adbin, ad.adrelid, true) as def_value
        FROM pg_catalog.pg_attribute a
        INNER JOIN pg_catalog.pg_class c ON (a.attrelid=c.oid)
        LEFT OUTER JOIN pg_catalog.pg_attrdef ad ON (a.attrelid=ad.adrelid AND a.attnum = ad.adnum)
        WHERE NOT a.attisdropped AND c.oid in(${tableIds})
      `)
    const indexedMetadata = _(metadata.rows)
      .groupBy('table_id')
      .mapValues(x=>
        _.mapValues(
          _.groupBy(x,'attnum'),
          v=>v[0]['attnotnull']
        ))
      .value()
    return fields.map(f=>!(indexedMetadata?.[f.tableID]?.[f.columnID]??false))
  })

}
