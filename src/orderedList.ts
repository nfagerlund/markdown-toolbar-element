import {SelectionRange, wordSelectionEnd, numberedLines, newlinesToSurroundSelectedText} from './index'
export function orderedList(textarea: HTMLTextAreaElement): SelectionRange {
  const orderedListRegex = /^\d+\.\s+/
  const noInitialSelection = textarea.selectionStart === textarea.selectionEnd
  let selectionEnd
  let selectionStart
  let text = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd)
  let textToUnstyle = text
  let lines = text.split('\n')
  let startOfLine, endOfLine
  if (noInitialSelection) {
    const linesBefore = textarea.value.slice(0, textarea.selectionStart).split(/\n/)
    startOfLine = textarea.selectionStart - linesBefore[linesBefore.length - 1].length
    endOfLine = wordSelectionEnd(textarea.value, textarea.selectionStart, true)
    textToUnstyle = textarea.value.slice(startOfLine, endOfLine)
  }
  const linesToUnstyle = textToUnstyle.split('\n')
  const undoStyling = linesToUnstyle.every(line => orderedListRegex.test(line))
  if (undoStyling) {
    lines = linesToUnstyle.map(line => line.replace(orderedListRegex, ''))
    text = lines.join('\n')
    if (noInitialSelection && startOfLine && endOfLine) {
      const lengthDiff = linesToUnstyle[0].length - lines[0].length
      selectionStart = selectionEnd = textarea.selectionStart - lengthDiff
      textarea.selectionStart = startOfLine
      textarea.selectionEnd = endOfLine
    }
  } else {
    lines = numberedLines(lines)
    text = lines.join('\n')
    const {newlinesToAppend, newlinesToPrepend} = newlinesToSurroundSelectedText(textarea)
    selectionStart = textarea.selectionStart + newlinesToAppend.length
    selectionEnd = selectionStart + text.length
    if (noInitialSelection) selectionStart = selectionEnd
    text = newlinesToAppend + text + newlinesToPrepend
  }
  return {text, selectionStart, selectionEnd}
}
