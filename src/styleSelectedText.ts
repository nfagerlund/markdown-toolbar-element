import { StyleArgs } from "./index";
import { isMultipleLines } from "./isMultipleLines";
import { insertText } from "./insertText";
import { blockStyle } from "./blockStyle";
import { orderedList } from "./orderedList";
import { multilineStyle } from "./multilineStyle";
export function styleSelectedText(textarea: HTMLTextAreaElement, styleArgs: StyleArgs) {
  const text = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
  let result;
  if (styleArgs.orderedList) {
    result = orderedList(textarea);
  }
  else if (styleArgs.multiline && isMultipleLines(text)) {
    result = multilineStyle(textarea, styleArgs);
  }
  else {
    result = blockStyle(textarea, styleArgs);
  }
  insertText(textarea, result);
}
