import type { Registro } from './registros'

export type ReportFormat = 'pdf' | 'csv' | 'xlsx'

export interface ReportTotals {
  income: number
  expenses: number
  balance: number
}

export interface ReportExportData {
  periodLabel: string
  startDate: string | null
  endDate: string | null
  records: Registro[]
  totals: ReportTotals
}

const moeda = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const dataBrasileira = (data: string) => {
  const [ano, mes, dia] = data.split('-')
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : data
}

const valorSeguro = (valor: number | string) => {
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : 0
}

const nomeArquivo = (data: ReportExportData, formato: ReportFormat) => {
  const inicio = data.startDate ?? 'historico'
  const fim = data.endDate ?? 'completo'
  return `finance-control-relatorio-${inicio}-${fim}.${formato}`
}

const comecaComoFormula = (valor: string) => {
  let indice = 0

  while (indice < valor.length) {
    const caractere = valor[indice]
    const codigo = valor.charCodeAt(indice)
    const espacoOuControle = /\s/.test(caractere)
      || codigo <= 0x1f
      || (codigo >= 0x7f && codigo <= 0x9f)
      || codigo === 0xfeff

    if (!espacoOuControle) break
    indice += 1
  }

  return ['=', '+', '-', '@'].includes(valor.slice(indice, indice + 1))
}

const escaparCsv = (valor: string) => {
  const seguro = comecaComoFormula(valor) ? `'${valor}` : valor
  return `"${seguro.replaceAll('"', '""')}"`
}

export function criarCsv(data: ReportExportData): Blob {
  const linhas = [
    [escaparCsv('Finance Control - Relatório')],
    [escaparCsv('Período'), escaparCsv(data.periodLabel)],
    [escaparCsv('Total de entradas'), escaparCsv(moeda(data.totals.income))],
    [escaparCsv('Total de despesas'), escaparCsv(moeda(data.totals.expenses))],
    [escaparCsv('Saldo do período'), escaparCsv(moeda(data.totals.balance))],
    [],
    ['Data', 'Nome', 'Descrição', 'Tipo', 'Valor'].map(escaparCsv),
    ...data.records.map((registro) => [
      dataBrasileira(registro.data),
      registro.nome,
      registro.descricao ?? '',
      registro.tipoRegistro === 'GANHO' ? 'Entrada' : 'Despesa',
      valorSeguro(registro.valor).toFixed(2).replace('.', ','),
    ].map(escaparCsv)),
  ]

  return new Blob(
    [`\uFEFF${linhas.map((linha) => linha.join(';')).join('\r\n')}`],
    { type: 'text/csv;charset=utf-8' },
  )
}

export async function criarPdf(data: ReportExportData): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const largura = pdf.internal.pageSize.getWidth()
  const margem = 14
  let y = 18

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text('Finance Control - Relatório Financeiro', margem, y)
  y += 9

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.text(`Período: ${data.periodLabel}`, margem, y)
  y += 10

  pdf.setFont('helvetica', 'bold')
  pdf.text('Resumo financeiro', margem, y)
  y += 7

  pdf.setFont('helvetica', 'normal')
  pdf.text(`Entradas: ${moeda(data.totals.income)}`, margem, y)
  pdf.text(`Despesas: ${moeda(data.totals.expenses)}`, margem + 62, y)
  pdf.text(`Saldo: ${moeda(data.totals.balance)}`, margem + 124, y)
  y += 12

  const colunas = [
    { x: margem, width: 25, title: 'Data' },
    { x: margem + 25, width: 38, title: 'Nome' },
    { x: margem + 63, width: 63, title: 'Descrição' },
    { x: margem + 126, width: 25, title: 'Tipo' },
    { x: margem + 151, width: largura - margem * 2 - 151, title: 'Valor' },
  ]

  const desenharCabecalho = () => {
    pdf.setFillColor(235, 243, 240)
    pdf.rect(margem, y - 5, largura - margem * 2, 8, 'F')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    colunas.forEach((coluna) => pdf.text(coluna.title, coluna.x + 1, y))
    pdf.setFont('helvetica', 'normal')
    y += 7
  }

  desenharCabecalho()
  pdf.setFontSize(8)

  data.records.forEach((registro) => {
    const celulas = [
      dataBrasileira(registro.data),
      registro.nome || '',
      registro.descricao || '',
      registro.tipoRegistro === 'GANHO' ? 'Entrada' : 'Despesa',
      moeda(valorSeguro(registro.valor)),
    ]
    const linhas = celulas.map((texto, index) =>
      pdf.splitTextToSize(texto, colunas[index].width - 2),
    )
    const altura = Math.max(5, ...linhas.map((conteudo) => conteudo.length * 4)) + 2

    if (y + altura > pdf.internal.pageSize.getHeight() - margem) {
      pdf.addPage()
      y = 18
      desenharCabecalho()
    }

    linhas.forEach((conteudo, index) => {
      pdf.text(conteudo, colunas[index].x + 1, y)
    })
    y += altura
    pdf.setDrawColor(225, 232, 230)
    pdf.line(margem, y - 1, largura - margem, y - 1)
  })

  if (data.records.length === 0) {
    pdf.setFontSize(9)
    pdf.text('Nenhuma movimentação financeira neste período.', margem, y + 2)
  }

  return pdf.output('blob')
}

export async function criarExcel(data: ReportExportData): Promise<Blob> {
  const { strToU8, zipSync } = await import('fflate')
  const xml = (value: string) => [...value]
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0
      return codePoint === 9
        || codePoint === 10
        || codePoint === 13
        || (codePoint >= 32 && codePoint <= 0xd7ff)
        || (codePoint >= 0xe000 && codePoint <= 0xfffd)
        || (codePoint >= 0x10000 && codePoint <= 0x10ffff)
    })
    .join('')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

  const textCell = (reference: string, value: string, style = 0) =>
    `<c r="${reference}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${xml(value)}</t></is></c>`
  const numberCell = (reference: string, value: number, style = 0) =>
    `<c r="${reference}" s="${style}"><v>${Number.isFinite(value) ? value : 0}</v></c>`
  const row = (number: number, cells: string[]) => `<row r="${number}">${cells.join('')}</row>`

  const resumoRows = [
    row(1, [textCell('A1', 'Indicador', 3), textCell('B1', 'Valor', 3)]),
    row(2, [textCell('A2', 'Relatório'), textCell('B2', 'Finance Control - Relatório Financeiro')]),
    row(3, [textCell('A3', 'Período'), textCell('B3', data.periodLabel)]),
    row(4, [textCell('A4', 'Total de entradas'), numberCell('B4', data.totals.income, 2)]),
    row(5, [textCell('A5', 'Total de despesas'), numberCell('B5', data.totals.expenses, 2)]),
    row(6, [textCell('A6', 'Saldo do período'), numberCell('B6', data.totals.balance, 2)]),
  ]

  const movimentosRows = [
    row(1, [
      textCell('A1', 'Data', 3),
      textCell('B1', 'Nome', 3),
      textCell('C1', 'Descrição', 3),
      textCell('D1', 'Tipo', 3),
      textCell('E1', 'Valor', 3),
    ]),
    ...data.records.map((registro, index) => {
      const [ano, mes, dia] = registro.data.split('-').map(Number)
      const serialData = Date.UTC(ano, mes - 1, dia) / 86_400_000 + 25_569
      const linha = index + 2
      return row(linha, [
        numberCell(`A${linha}`, serialData, 1),
        textCell(`B${linha}`, registro.nome ?? ''),
        textCell(`C${linha}`, registro.descricao ?? ''),
        textCell(`D${linha}`, registro.tipoRegistro === 'GANHO' ? 'Entrada' : 'Despesa'),
        numberCell(`E${linha}`, valorSeguro(registro.valor), 2),
      ])
    }),
  ]

  const worksheet = (
    rows: string[],
    columns: Array<{ min: number; max: number; width: number }>,
    options: { freezeHeader?: boolean; filter?: string } = {},
  ) => {
    const columnXml = columns.map((column) =>
      `<col min="${column.min}" max="${column.max}" width="${column.width}" customWidth="1"/>`,
    ).join('')
    const viewXml = options.freezeHeader
      ? '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
      : '<sheetViews><sheetView workbookViewId="0"/></sheetViews>'
    const filterXml = options.filter ? `<autoFilter ref="${options.filter}"/>` : ''

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${viewXml}<cols>${columnXml}</cols><sheetData>${rows.join('')}</sheetData>${filterXml}</worksheet>`
  }

  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'),
    '_rels/.rels': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'),
    'xl/workbook.xml': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Resumo" sheetId="1" r:id="rId1"/><sheet name="Movimentações" sheetId="2" r:id="rId2"/></sheets></workbook>'),
    'xl/_rels/workbook.xml.rels': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'),
    'xl/styles.xml': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;R$&quot; #,##0.00"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF123C35"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="14" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'),
    'xl/worksheets/sheet1.xml': strToU8(worksheet(resumoRows, [
      { min: 1, max: 1, width: 28 },
      { min: 2, max: 2, width: 38 },
    ])),
    'xl/worksheets/sheet2.xml': strToU8(worksheet(movimentosRows, [
      { min: 1, max: 1, width: 16 },
      { min: 2, max: 2, width: 30 },
      { min: 3, max: 3, width: 42 },
      { min: 4, max: 4, width: 16 },
      { min: 5, max: 5, width: 18 },
    ], { freezeHeader: true, filter: `A1:E${Math.max(1, data.records.length + 1)}` })),
  }
  const bytes = zipSync(files, { level: 6 })

  return new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export async function exportarRelatorio(
  formato: ReportFormat,
  data: ReportExportData,
): Promise<void> {
  const blob = formato === 'csv'
    ? criarCsv(data)
    : formato === 'pdf'
      ? await criarPdf(data)
      : await criarExcel(data)

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo(data, formato)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
