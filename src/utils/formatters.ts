/**
 * Format a date to a human-readable string
 */
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  const dateObject = date instanceof Date ? date : new Date(date)

  // Default options
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }

  // Merge provided options with defaults
  const mergedOptions = { ...defaultOptions, ...options }

  return new Intl.DateTimeFormat('en-US', mergedOptions).format(dateObject)
}

/**
 * Format bytes to a human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format a project type string to be more readable
 * E.g: "object_detection" -> "Object Detection"
 */
export function formatProjectType(type: string | undefined): string {
  if (!type) return 'N/A'

  return type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Truncate a string if it exceeds the maximum length
 */
export function truncateString(str: string, maxLength: number = 50): string {
  if (str.length <= maxLength) return str

  return str.substring(0, maxLength) + '...'
}

/**
 * Pluralize a word based on count
 */
export function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`
}

/**
 * Generate a random color in hex format
 */
export function generateRandomColor(): string {
  return (
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  )
}
