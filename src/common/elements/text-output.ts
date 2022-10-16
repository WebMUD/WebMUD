import { createElement } from "../util";

export type TextField = HTMLElement | Text | string;

export class TextOutput {
  readonly el: HTMLElement;

  public constructor(el: HTMLElement) {
    this.el = el;
  }

  /**
   * Print on the current line
   * @param fields text to print
   */
  public printInline(...fields: TextField[]) {
    TextOutput.print(this.el, fields);
  }

  /**
   * Print on a new line
   * @param fields text to print
   * @return callback to remove the line
   */
  public print(...fields: TextField[]): () => void {
    return this.printVia(createElement('div'), ...fields);
  }

  /**
   * Print on a new line
   * @param el container for the line
   * @param fields text to print
   * @return callback to remove the line
   */
  public printVia(el: HTMLElement, ...fields: TextField[]): () => void {
    TextOutput.print(el, fields);
    this.printInline(el);
    const remove = () => el.remove();
    return remove;
  }

  /**
   * Format text for a TextOutput
   * @param text the text to format
   * @param classList CSS class names
   * @returns formatted text element
   */
  public static format(text: TextField, ...classList: string[]): HTMLElement {
    return createElement('span', {
      children: [text],
      classList,
    });
  }

  protected static print(el: HTMLElement, fields: TextField[]) {
    for (const field of fields) el.append(TextOutput.textField(field));
  }

  protected static text(text: Text | string): Text {
    if (typeof text === 'string') text = document.createTextNode(text);
    return text;
  }

  protected static textField(text: TextField): HTMLElement {
    if (typeof text === 'string') return createElement('span', {text});
    if (text instanceof Text) return createElement('span', {children: [text]});
    return text;
  }
}
