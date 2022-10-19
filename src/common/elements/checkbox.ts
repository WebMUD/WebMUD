import { EventEmitter } from '../event-emitter';

export class CheckboxInput {
  readonly el: HTMLInputElement;
  private listener?: () => void;

  enable: EventEmitter<void> = new EventEmitter();
  disable: EventEmitter<void> = new EventEmitter();
  update: EventEmitter<boolean> = new EventEmitter();

  public constructor(el: HTMLInputElement) {
    this.el = el;

    const self = this;
    this.el.addEventListener('change', () => {
      self.handle();
    });
  }

  protected handle() {
    this.update.emit(this.el.checked);

    if (this.el.checked) this.enable.emit();
    else this.disable.emit();
  }
}
