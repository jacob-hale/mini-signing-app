/** Split "Base - suffix" titles used for drafts. */
export function splitTitle(title: string): { base: string; suffix: string } {
  const sep = ' - '
  const idx = title.indexOf(sep)
  if (idx === -1) {
    return { base: title.trim() || 'Untitled', suffix: '' }
  }
  return {
    base: title.slice(0, idx).trim() || 'Untitled',
    suffix: title.slice(idx + sep.length),
  }
}

export function joinTitle(base: string, suffix: string): string {
  return `${base.trim()} - ${suffix}`
}

export function hasTitleSuffix(title: string): boolean {
  return splitTitle(title).suffix.trim().length > 0
}

export function withRecipientSuffix(title: string, recipientName: string): string {
  const { base, suffix } = splitTitle(title)
  if (suffix.trim()) return joinTitle(base, suffix)
  return joinTitle(base, recipientName)
}
