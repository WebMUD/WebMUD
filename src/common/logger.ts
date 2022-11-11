import { EventEmitter } from "./event-emitter";
import { View } from "./view";

export class Logger {
    public onPrint = EventEmitter.channel<string[]>();
    public onDebug = EventEmitter.channel<string[]>();
    public onInfo = EventEmitter.channel<string[]>();
    public onWarning = EventEmitter.channel<string[]>();
    public onError = EventEmitter.channel<string[]>();

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

    useConsole() {
        this.onPrint(data=>console.log(...data));
        this.onDebug(data=>console.debug(...data));
        this.onInfo(data=>console.info(...data));
        this.onWarning(data=>console.warn(...data));
        this.onError(data=>console.error(...data));
    }

    useView(view: View) {
        this.onPrint(data=>view.print(...data));
        this.onDebug(data=>view.debug(...data));
        this.onInfo(data=>view.info(...data));
        this.onWarning(data=>view.warn(...data));
        this.onError(data=>view.error(...data));
    }
}