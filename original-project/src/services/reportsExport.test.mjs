import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('./reportsExport.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText
const { criarCsv } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
)

test('neutraliza prefixos de fórmula inclusive após espaços e controles', async () => {
  const values = [
    '=1+1',
    '+1+1',
    '-1+1',
    '@SUM(A1:A2)',
    '  =1+1',
    '\t+1+1',
    '\u0001-1+1',
    '\uFEFF@SUM(A1:A2)',
    'texto comum',
  ]
  const records = values.map((nome, index) => ({
    id: index + 1,
    nome,
    descricao: '',
    data: '2026-10-25',
    tipoRegistro: 'GANHO',
    valor: 1,
  }))
  const csv = await criarCsv({
    periodLabel: 'Teste',
    startDate: null,
    endDate: null,
    records,
    totals: { income: values.length, expenses: 0, balance: values.length },
  }).text()

  for (const value of values.slice(0, -1)) {
    assert.ok(csv.includes(`"'${value}"`), `Prefixo não neutralizado: ${JSON.stringify(value)}`)
  }
  assert.ok(csv.includes('"texto comum"'))
})
