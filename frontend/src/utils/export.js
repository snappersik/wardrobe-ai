const safeText = (value) => {
  if (value === null || value === undefined) return ''
  return String(value)
}

const formatTimestamp = (value) => {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return safeText(value)
  return date.toLocaleString('ru-RU')
}

const normalizeLogRow = (log = {}) => ({
  id: log._id || log.id || '',
  user_id: log.user_id ?? '',
  username: log.username ?? '',
  action: log.action || log.type || log.level || '',
  details: log.details || log.message || '',
  timestamp: formatTimestamp(log.timestamp),
})

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export const exportLogsToJson = (logs = [], filename = 'logs_export.json') => {
  const data = logs.map(normalizeLogRow)
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, filename)
}

export const exportLogsToCsv = (logs = [], filename = 'logs_export.csv') => {
  const rows = logs.map(normalizeLogRow)
  const headers = ['id', 'user_id', 'username', 'action', 'details', 'timestamp']
  const escapeCsv = (value) => {
    const text = safeText(value).replace(/\"/g, '\"\"')
    return `"${text}"`
  }

  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((key) => escapeCsv(row[key])).join(',')),
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename)
}

export const exportLogsToExcel = async (logs = [], filename = 'logs_export.xlsx') => {
  const XLSXModule = await import('xlsx')
  const XLSX = XLSXModule.default || XLSXModule
  const rows = logs.map(normalizeLogRow)
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs')
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  downloadBlob(blob, filename)
}

export const exportLogsToPdf = async (logs = [], filename = 'logs_export.pdf') => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const rows = logs.map(normalizeLogRow)
  const doc = new jsPDF({ orientation: 'landscape' })
  const headers = ['ID', 'User ID', 'Username', 'Action', 'Details', 'Timestamp']
  const body = rows.map((row) => [
    row.id,
    row.user_id,
    row.username,
    row.action,
    row.details,
    row.timestamp,
  ])

  autoTable(doc, {
    head: [headers],
    body,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [255, 145, 175] },
    columnStyles: {
      4: { cellWidth: 80 },
      5: { cellWidth: 32 },
    },
  })

  doc.save(filename)
}
