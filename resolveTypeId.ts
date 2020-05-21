import { wrapDebugger } from './debug'
import { FieldDef } from 'pg'

enum EType {
  boolean = 'boolean',
  string = 'string',
  number = 'number',
  Date = 'Date',
}

const map = {
  16: EType.boolean,
  20: EType.string,
  21: EType.number,
  23: EType.number,
  25: EType.string,
  26: EType.number,
  650: EType.string,
  700: EType.number,
  701: EType.number,
  829: EType.string,
  869: EType.string,
  1043: EType.string,
  1700: EType.string,
  3906: EType.string,
  2950: EType.string,
  2951: EType.string,
  1082: EType.Date,
  1114: EType.Date,
  1184: EType.Date,
} as { [K: number]: string }

const _resolveTypeId = (field: FieldDef) => map[field.dataTypeID] ?? 'unknown'
export const resolveTypeId = wrapDebugger(_resolveTypeId)
