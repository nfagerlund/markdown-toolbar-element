import {StyleArgs, SelectionRange, expandSelectedText, newlinesToSurroundSelectedText, wordSelectionEnd, numberedLines} from './index'

let canInsertText: boolean | null = null

function insertText(textarea: HTMLTextAreaElement, {text, selectionStart, selectionEnd}: SelectionRange) {
  const originalSelectionStart = textarea.selectionStart
  const before = textarea.value.slice(0, originalSelectionStart)
  const after = textarea.value.slice(textarea.selectionEnd)
  if (canInsertText === null || canInsertText === true) {
    textarea.contentEditable = 'true'
    try {
      canInsertText = document.execCommand('insertText', false, text)
    } catch (error) {
      canInsertText = false
    }
    textarea.contentEditable = 'false'
  }
  if (canInsertText && !textarea.value.slice(0, textarea.selectionStart).endsWith(text)) {
    canInsertText = false
  }
  if (!canInsertText) {
    try {
      document.execCommand('ms-beginUndoUnit')
    } catch (e) {
      // Do nothing.
    }
    textarea.value = before + text + after
    try {
      document.execCommand('ms-endUndoUnit')
    } catch (e) {
      // Do nothing.
    }
    textarea.dispatchEvent(new CustomEvent('input', {bubbles: true, cancelable: true}))
  }
  if (selectionStart != null && selectionEnd != null) {
    textarea.setSelectionRange(selectionStart, selectionEnd)
  } else {
    textarea.setSelectionRange(originalSelectionStart, textarea.selectionEnd)
  }
}

function isMultipleLines(string: string): boolean {
    return string.trim().split('\n').length > 1
}

function orderedList(textarea: HTMLTextAreaElement): SelectionRange {
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

function multilineStyle(textarea: HTMLTextAreaElement, arg: StyleArgs) {
    const {prefix, suffix, surroundWithNewlines} = arg
    let text = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd)
    let selectionStart = textarea.selectionStart
    let selectionEnd = textarea.selectionEnd
    const lines = text.split('\n')
    const undoStyle = lines.every(line => line.startsWith(prefix) && line.endsWith(suffix))
    if (undoStyle) {
      text = lines.map(line => line.slice(prefix.length, line.length - suffix.length)).join('\n')
      selectionEnd = selectionStart + text.length
    } else {
      text = lines.map(line => prefix + line + suffix).join('\n')
      if (surroundWithNewlines) {
        const {newlinesToAppend, newlinesToPrepend} = newlinesToSurroundSelectedText(textarea)
        selectionStart += newlinesToAppend.length
        selectionEnd = selectionStart + text.length
        text = newlinesToAppend + text + newlinesToPrepend
      }
    }
    return {text, selectionStart, selectionEnd}
  }

function blockStyle(textarea: HTMLTextAreaElement, arg: StyleArgs): SelectionRange {
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

export function styleSelectedText(textarea: HTMLTextAreaElement, styleArgs: StyleArgs) {
  const text = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd)
  let result
  if (styleArgs.orderedList) {
    result = orderedList(textarea)
  } else if (styleArgs.multiline && isMultipleLines(text)) {
    result = multilineStyle(textarea, styleArgs)
  } else {
    result = blockStyle(textarea, styleArgs)
  }
  insertText(textarea, result)
}
