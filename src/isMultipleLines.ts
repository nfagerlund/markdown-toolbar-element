export function isMultipleLines(string: string): boolean {
  return string.trim().split('\n').length > 1
}
