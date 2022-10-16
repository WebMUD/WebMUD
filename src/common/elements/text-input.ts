import { EventEmitter } from '../event-emitter';

/**
 * Handles data from an HTMLInputElement like a command prompt
 */
export class TextInput {
  readonly el: HTMLInputElement;

  data: EventEmitter<string> = new EventEmitter();
  change: EventEmitter<string> = new EventEmitter();

  public constructor(el: HTMLInputElement) {
    this.el = el;
    const self = this;

    const handler = (ev: KeyboardEvent) => {
      const str = el.value;

      self.change.emit(str);

      if (ev.key === 'Enter') {
        self.data.emit(str);
        el.value = '';
      }
    };

    el.addEventListener('keyup', handler);
  }
}
