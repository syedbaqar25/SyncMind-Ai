export const formatDuration = (seconds = 0) => {
  const total = Number(seconds) || 0
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const remaining = Math.floor(total % 60)

  if (hours) return `${hours}h ${minutes}m`
  if (minutes) return `${minutes}m ${remaining}s`
  return `${remaining}s`
}

export const formatFileSize = (bytes = 0) => {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unit = 0

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit += 1
  }

  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`
}
