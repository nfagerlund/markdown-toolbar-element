import {StyleArgs, SelectionRange, expandSelectedText, newlinesToSurroundSelectedText} from './index'
import {isMultipleLines} from './isMultipleLines'
export function blockStyle(textarea: HTMLTextAreaElement, arg: StyleArgs): SelectionRange {
  let newlinesToAppend
  let newlinesToPrepend
  const {
    prefix,
    suffix,
    blockPrefix,
    blockSuffix,
    replaceNext,
    replacePrev,
    prefixSpace,
    scanFor,
    surroundWithNewlines
  } = arg
  const originalSelectionStart = textarea.selectionStart
  const originalSelectionEnd = textarea.selectionEnd
  let selectedText = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd)
  let prefixToUse = isMultipleLines(selectedText) && blockPrefix.length > 0 ? `${blockPrefix}\n` : prefix
  let suffixToUse = isMultipleLines(selectedText) && blockSuffix.length > 0 ? `\n${blockSuffix}` : suffix
  if (prefixSpace) {
    const beforeSelection = textarea.value[textarea.selectionStart - 1]
    if (textarea.selectionStart !== 0 && beforeSelection != null && !beforeSelection.match(/\s/)) {
      prefixToUse = ` ${prefixToUse}`
    }
  }
  selectedText = expandSelectedText(textarea, prefixToUse, suffixToUse, arg.multiline)
  let selectionStart = textarea.selectionStart
  let selectionEnd = textarea.selectionEnd
  const hasReplaceNext = replaceNext.length > 0 && suffixToUse.indexOf(replaceNext) > -1 && selectedText.length > 0
  const hasReplacePrev = replacePrev.length > 0 && prefixToUse.indexOf(replacePrev) > -1 && selectedText.length > 0
  if (surroundWithNewlines) {
    const ref = newlinesToSurroundSelectedText(textarea)
    newlinesToAppend = ref.newlinesToAppend
    newlinesToPrepend = ref.newlinesToPrepend
    prefixToUse = newlinesToAppend + prefix
    suffixToUse += newlinesToPrepend
  }
  if (selectedText.startsWith(prefixToUse) && selectedText.endsWith(suffixToUse)) {
    const replacementText = selectedText.slice(prefixToUse.length, selectedText.length - suffixToUse.length)
    if (originalSelectionStart === originalSelectionEnd) {
      let position = originalSelectionStart - prefixToUse.length
      position = Math.max(position, selectionStart)
      position = Math.min(position, selectionStart + replacementText.length)
      selectionStart = selectionEnd = position
    } else {
      selectionEnd = selectionStart + replacementText.length
    }
    return {text: replacementText, selectionStart, selectionEnd}
  } else if (!hasReplaceNext && !hasReplacePrev) {
    let replacementText = prefixToUse + selectedText + suffixToUse
    selectionStart = originalSelectionStart + prefixToUse.length
    selectionEnd = originalSelectionEnd + prefixToUse.length
    const whitespaceEdges = selectedText.match(/^\s*|\s*$/g)
    if (arg.trimFirst && whitespaceEdges) {
      const leadingWhitespace = whitespaceEdges[0] || ''
      const trailingWhitespace = whitespaceEdges[1] || ''
      replacementText = leadingWhitespace + prefixToUse + selectedText.trim() + suffixToUse + trailingWhitespace
      selectionStart += leadingWhitespace.length
      selectionEnd -= trailingWhitespace.length
    }
    return {text: replacementText, selectionStart, selectionEnd}
  } else if (scanFor.length > 0 && selectedText.match(scanFor)) {
    if (hasReplaceNext) {
      suffixToUse = suffixToUse.replace(replaceNext, selectedText)
    } else if (hasReplacePrev) {
      prefixToUse = prefixToUse.replace(replacePrev, selectedText)
    }
    const replacementText = prefixToUse + suffixToUse
    selectionStart = selectionEnd = selectionStart + prefixToUse.length
    return {text: replacementText, selectionStart, selectionEnd}
  } else {
    const replacementText = prefixToUse + selectedText + suffixToUse
    selectionStart = selectionStart + prefixToUse.length + selectedText.length + suffixToUse.indexOf(replaceNext)
    selectionEnd = selectionStart + replaceNext.length
    return {text: replacementText, selectionStart, selectionEnd}
  }
}
