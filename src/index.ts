import {styleSelectedText} from './styleSelectedText'

declare global {
  interface Window {
    MarkdownToolbarElement: typeof MarkdownToolbarElement
    MarkdownHeaderButtonElement: typeof MarkdownHeaderButtonElement
    MarkdownBoldButtonElement: typeof MarkdownBoldButtonElement
    MarkdownItalicButtonElement: typeof MarkdownItalicButtonElement
    MarkdownQuoteButtonElement: typeof MarkdownQuoteButtonElement
    MarkdownCodeButtonElement: typeof MarkdownCodeButtonElement
    MarkdownLinkButtonElement: typeof MarkdownLinkButtonElement
    MarkdownImageButtonElement: typeof MarkdownImageButtonElement
    MarkdownUnorderedListButtonElement: typeof MarkdownUnorderedListButtonElement
    MarkdownOrderedListButtonElement: typeof MarkdownOrderedListButtonElement
    MarkdownTaskListButtonElement: typeof MarkdownTaskListButtonElement
    MarkdownMentionButtonElement: typeof MarkdownMentionButtonElement
    MarkdownRefButtonElement: typeof MarkdownRefButtonElement
  }
  interface HTMLElementTagNameMap {
    'markdown-toolbar': MarkdownToolbarElement
    'md-header': MarkdownHeaderButtonElement
    'md-bold': MarkdownBoldButtonElement
    'md-italic': MarkdownItalicButtonElement
    'md-quote': MarkdownQuoteButtonElement
    'md-code': MarkdownCodeButtonElement
    'md-link': MarkdownLinkButtonElement
    'md-image': MarkdownImageButtonElement
    'md-unordered-list': MarkdownUnorderedListButtonElement
    'md-ordered-list': MarkdownOrderedListButtonElement
    'md-task-list': MarkdownTaskListButtonElement
    'md-mention': MarkdownMentionButtonElement
    'md-ref': MarkdownRefButtonElement
  }
}

const buttonSelectors = [
  '[data-md-button]',
  'md-header',
  'md-bold',
  'md-italic',
  'md-quote',
  'md-code',
  'md-link',
  'md-image',
  'md-unordered-list',
  'md-ordered-list',
  'md-task-list',
  'md-mention',
  'md-ref'
]
function getButtons(toolbar: Element): HTMLElement[] {
  const els = []
  for (const button of toolbar.querySelectorAll<HTMLElement>(buttonSelectors.join(', '))) {
    // Skip buttons that are hidden, either via `hidden` attribute or CSS:
    if (button.hidden || (button.offsetWidth <= 0 && button.offsetHeight <= 0)) continue
    if (button.closest('markdown-toolbar') === toolbar) els.push(button)
  }
  return els
}

function keydown(fn: (event: KeyboardEvent) => void): (event: KeyboardEvent) => void {
  return function (event: KeyboardEvent) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      fn(event)
    }
  }
}

const styles = new WeakMap()

class MarkdownButtonElement extends HTMLElement {
  constructor() {
    super()
    const apply = () => {
      const style = styles.get(this)
      if (!style) return
      applyStyle(this, style)
    }
    this.addEventListener('keydown', keydown(apply))
    this.addEventListener('click', apply)
  }

  connectedCallback() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'button')
    }
  }

  click() {
    const style = styles.get(this)
    if (!style) return
    applyStyle(this, style)
  }
}

class MarkdownHeaderButtonElement extends MarkdownButtonElement {
  constructor() {
    super()

    const level = parseInt(this.getAttribute('level') || '3', 10)
    if (level < 1 || level > 6) {
      return
    }

    const prefix = `${'#'.repeat(level)} `
    styles.set(this, {
      prefix
    })
  }
}

if (!window.customElements.get('md-header')) {
  window.MarkdownHeaderButtonElement = MarkdownHeaderButtonElement
  window.customElements.define('md-header', MarkdownHeaderButtonElement)
}

class MarkdownBoldButtonElement extends MarkdownButtonElement {
  constructor() {
    super()
    styles.set(this, {prefix: '**', suffix: '**', trimFirst: true})
  }

  connectedCallback() {
    super.connectedCallback()
    this.setAttribute('hotkey', 'b')
  }
}

if (!window.customElements.get('md-bold')) {
  window.MarkdownBoldButtonElement = MarkdownBoldButtonElement
  window.customElements.define('md-bold', MarkdownBoldButtonElement)
}

class MarkdownItalicButtonElement extends MarkdownButtonElement {
  constructor() {
    super()
    styles.set(this, {prefix: '_', suffix: '_', trimFirst: true})
  }

  connectedCallback() {
    super.connectedCallback()
    this.setAttribute('hotkey', 'i')
  }
}

if (!window.customElements.get('md-italic')) {
  window.MarkdownItalicButtonElement = MarkdownItalicButtonElement
  window.customElements.define('md-italic', MarkdownItalicButtonElement)
}

class MarkdownQuoteButtonElement extends MarkdownButtonElement {
  constructor() {
    super()
    styles.set(this, {prefix: '> ', multiline: true, surroundWithNewlines: true})
  }
}

if (!window.customElements.get('md-quote')) {
  window.MarkdownQuoteButtonElement = MarkdownQuoteButtonElement
  window.customElements.define('md-quote', MarkdownQuoteButtonElement)
}

class MarkdownCodeButtonElement extends MarkdownButtonElement {
  constructor() {
    super()
    styles.set(this, {prefix: '`', suffix: '`', blockPrefix: '```', blockSuffix: '```'})
  }
}

if (!window.customElements.get('md-code')) {
  window.MarkdownCodeButtonElement = MarkdownCodeButtonElement
  window.customElements.define('md-code', MarkdownCodeButtonElement)
}

class MarkdownLinkButtonElement extends MarkdownButtonElement {
  constructor() {
    super()
    styles.set(this, {prefix: '[', suffix: '](url)', replaceNext: 'url', scanFor: 'https?://'})
  }

  connectedCallback() {
    super.connectedCallback()
    this.setAttribute('hotkey', 'k')
  }
}

if (!window.customElements.get('md-link')) {
  window.MarkdownLinkButtonElement = MarkdownLinkButtonElement
  window.customElements.define('md-link', MarkdownLinkButtonElement)
}

class MarkdownImageButtonElement extends MarkdownButtonElement {
  constructor() {
    super()
    styles.set(this, {prefix: '![', suffix: '](url)', replaceNext: 'url', scanFor: 'https?://'})
  }
}

if (!window.customElements.get('md-image')) {
  window.MarkdownImageButtonElement = MarkdownImageButtonElement
  window.customElements.define('md-image', MarkdownImageButtonElement)
}

class MarkdownUnorderedListButtonElement extends MarkdownButtonElement {
  constructor() {
    super()
    styles.set(this, {prefix: '- ', multiline: true, surroundWithNewlines: true})
  }
}

if (!window.customElements.get('md-unordered-list')) {
  window.MarkdownUnorderedListButtonElement = MarkdownUnorderedListButtonElement
  window.customElements.define('md-unordered-list', MarkdownUnorderedListButtonElement)
}

class MarkdownOrderedListButtonElement extends MarkdownButtonElement {
  constructor() {
    super()
    styles.set(this, {prefix: '1. ', multiline: true, orderedList: true})
  }
}

if (!window.customElements.get('md-ordered-list')) {
  window.MarkdownOrderedListButtonElement = MarkdownOrderedListButtonElement
  window.customElements.define('md-ordered-list', MarkdownOrderedListButtonElement)
}

class MarkdownTaskListButtonElement extends MarkdownButtonElement {
  constructor() {
    super()
    styles.set(this, {prefix: '- [ ] ', multiline: true, surroundWithNewlines: true})
  }

  connectedCallback() {
    super.connectedCallback()
    this.setAttribute('hotkey', 'L')
  }
}

if (!window.customElements.get('md-task-list')) {
  window.MarkdownTaskListButtonElement = MarkdownTaskListButtonElement
  window.customElements.define('md-task-list', MarkdownTaskListButtonElement)
}

class MarkdownMentionButtonElement extends MarkdownButtonElement {
  constructor() {
    super()
    styles.set(this, {prefix: '@', prefixSpace: true})
  }
}

if (!window.customElements.get('md-mention')) {
  window.MarkdownMentionButtonElement = MarkdownMentionButtonElement
  window.customElements.define('md-mention', MarkdownMentionButtonElement)
}

class MarkdownRefButtonElement extends MarkdownButtonElement {
  constructor() {
    super()
    styles.set(this, {prefix: '#', prefixSpace: true})
  }
}

if (!window.customElements.get('md-ref')) {
  window.MarkdownRefButtonElement = MarkdownRefButtonElement
  window.customElements.define('md-ref', MarkdownRefButtonElement)
}

const modifierKey = navigator.userAgent.match(/Macintosh/) ? 'Meta' : 'Control'

class MarkdownToolbarElement extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'toolbar')
    }
    this.addEventListener('keydown', focusKeydown)
    const fn = shortcut.bind(null, this)
    if (this.field) {
      this.field.addEventListener('keydown', fn)
      shortcutListeners.set(this, fn)
    }
    this.setAttribute('tabindex', '0')
    this.addEventListener('focus', onToolbarFocus, {once: true})
  }

  disconnectedCallback() {
    const fn = shortcutListeners.get(this)
    if (fn && this.field) {
      this.field.removeEventListener('keydown', fn)
      shortcutListeners.delete(this)
    }
    this.removeEventListener('keydown', focusKeydown)
  }

  get field(): HTMLTextAreaElement | null {
    const id = this.getAttribute('for')
    if (!id) return null
    const field = document.getElementById(id)
    return field instanceof HTMLTextAreaElement ? field : null
  }
}

function onToolbarFocus({target}: FocusEvent) {
  if (!(target instanceof Element)) return
  target.removeAttribute('tabindex')
  let tabindex = '0'
  for (const button of getButtons(target)) {
    button.setAttribute('tabindex', tabindex)
    if (tabindex === '0') {
      button.focus()
      tabindex = '-1'
    }
  }
}

function focusKeydown(event: KeyboardEvent) {
  const key = event.key
  if (key !== 'ArrowRight' && key !== 'ArrowLeft' && key !== 'Home' && key !== 'End') return
  const toolbar = event.currentTarget
  if (!(toolbar instanceof HTMLElement)) return
  const buttons = getButtons(toolbar)
  const index = buttons.indexOf(event.target as HTMLElement)
  const length = buttons.length
  if (index === -1) return

  let n = 0
  if (key === 'ArrowLeft') n = index - 1
  if (key === 'ArrowRight') n = index + 1
  if (key === 'End') n = length - 1
  if (n < 0) n = length - 1
  if (n > length - 1) n = 0

  for (let i = 0; i < length; i += 1) {
    buttons[i].setAttribute('tabindex', i === n ? '0' : '-1')
  }

  // Need to stop home/end scrolling:
  event.preventDefault()

  buttons[n].focus()
}

const shortcutListeners = new WeakMap()

function shortcut(toolbar: Element, event: KeyboardEvent) {
  if ((event.metaKey && modifierKey === 'Meta') || (event.ctrlKey && modifierKey === 'Control')) {
    const button = toolbar.querySelector<HTMLElement>(`[hotkey="${event.key}"]`)
    if (button) {
      button.click()
      event.preventDefault()
    }
  }
}

if (!window.customElements.get('markdown-toolbar')) {
  window.MarkdownToolbarElement = MarkdownToolbarElement
  window.customElements.define('markdown-toolbar', MarkdownToolbarElement)
}

export function repeat(string: string, n: number): string {
  return Array(n + 1).join(string)
}

function applyStyle(button: Element, stylesToApply: {}) {
  const toolbar = button.closest('markdown-toolbar')
  if (!(toolbar instanceof MarkdownToolbarElement)) return

  const defaults = {
    prefix: '',
    suffix: '',
    blockPrefix: '',
    blockSuffix: '',
    multiline: false,
    replaceNext: '',
    replacePrev: '',
    prefixSpace: false,
    scanFor: '',
    surroundWithNewlines: false,
    orderedList: false,
    trimFirst: false
  }

  const style = {...defaults, ...stylesToApply}

  const field = toolbar.field
  if (field) {
    field.focus()
    styleSelectedText(field, style)
  }
}

export default MarkdownToolbarElement

export {styleSelectedText, keydown, onToolbarFocus, focusKeydown, shortcut, applyStyle}
