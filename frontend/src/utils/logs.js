const normalizeText = (value) => (value || '').toString().toLowerCase()

export const getLogLevel = (log = {}) => {
    const explicit = normalizeText(log.level || log.severity || log.type)
    if (explicit.includes('error') || explicit.includes('fatal') || explicit.includes('critical')) return 'error'
    if (explicit.includes('warn')) return 'warning'

    const text = normalizeText([
        log.action,
        log.details,
        log.message
    ].filter(Boolean).join(' '))

    if (text.match(/error|fail|failed|exception|traceback|critical|panic/)) return 'error'
    if (text.match(/warn|warning|deprecated|slow|timeout|rate limit/)) return 'warning'
    return 'info'
}

export const getLogBadgeLabel = (log = {}) => {
    const raw = log.action || log.type || log.level || log.severity || 'info'
    return raw.toString().replace(/_/g, ' ').toUpperCase()
}
