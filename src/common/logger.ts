import { TextField } from './elements/text-output';
import { EventEmitter } from './event-emitter';
import { View } from './view';

export class Logger {
  // command
  public onClear = EventEmitter.channel<void>();

  // out
  public onPrint = EventEmitter.channel<string[]>();
  public onDebug = EventEmitter.channel<string[]>();
  public onInfo = EventEmitter.channel<string[]>();
  public onWarning = EventEmitter.channel<string[]>();
  public onError = EventEmitter.channel<string[]>();
  public onBold = EventEmitter.channel<string[]>();
  public onSmall = EventEmitter.channel<string[]>();
  public onFormated = EventEmitter.channel<TextField[]>();

  // in
  public onInput = EventEmitter.channel<string>();

  public clear() {
    this.onClear.emit();
  }

  public print(...data: string[]) {
    this.onPrint.emit(data);
  }

  public debug(...data: string[]) {
    this.onDebug.emit(data);
  }

  public info(...data: string[]) {
    this.onInfo.emit(data);
  }

  public warn(...data: string[]) {
    this.onWarning.emit(data);
  }

  public error(...data: string[]) {
    this.onError.emit(data);
  }

  public bold(...data: string[]) {
    this.onBold.emit(data);
  }

  public small(...data: string[]) {
    this.onSmall.emit(data);
  }

  public input(data: string) {
    this.onInput.emit(data);
  }

  public printFormat(...data: TextField[]) {
    this.onFormated.emit(data);
  }

  useConsole() {
    this.onClear(_ => console.log());

    this.onPrint(data => console.log(...data));
    this.onDebug(data => console.debug(...data));
    this.onInfo(data => console.info(...data));
    this.onWarning(data => console.warn(...data));
    this.onError(data => console.error(...data));

    this.onBold(data => console.log(...data));
    this.onSmall(data => console.log(...data));

    this.onFormated(data => console.log(...data));
  }

  useView(view: View) {
    this.onClear(_ => view.clear());

    this.onPrint(data => view.print(...data));
    this.onDebug(data => view.debug(...data));
    this.onInfo(data => view.info(...data));
    this.onWarning(data => view.warn(...data));
    this.onError(data => view.error(...data));

    this.onBold(data => view.print(view.formatBold(data.join(' '))));
    this.onSmall(data => view.print(view.formatSmall(data.join(' '))));

    this.onFormated(data => view.print(...data));

    view.onInput(data => this.input(data));
  }
}
