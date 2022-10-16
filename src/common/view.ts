import { CheckboxInput } from "./elements/checkbox";
import { TextInput } from "./elements/text-input";
import { TextField, TextOutput } from "./elements/text-output";
import { createElement } from "./util";

export interface ViewOptions {
    output?: HTMLElement;
    input?: HTMLElement;
    debug?: HTMLElement;
}

export class View {
    private output?: TextOutput;
    private input?: TextInput;

    constructor(options: ViewOptions) {
        if (options.output && options.output instanceof HTMLElement) this.output = new TextOutput(options.output);
        if (options.input && options.input instanceof HTMLInputElement) this.input = new TextInput(options.input);
        if (options.debug && options.debug instanceof HTMLInputElement) {
            const debugCheckbox = new CheckboxInput(options.debug);
            debugCheckbox.enable.add(() => {
                if (this.output) this.output.el.classList.add('debug-enable');
            });
            debugCheckbox.disable.add(() => {
                if (this.output) this.output.el.classList.remove('debug-enable');
            });
        };
    }

    private updateScroll() {
        if (this.output)
            this.output.el.scrollTop = this.output.el.scrollHeight;
    }

    private write(via: HTMLElement|false, ...data: TextField[]): ()=>void {
        if (!this.output) throw new Error('no output channel');
        
        const el = this.output.el;
        const isScrolledToBottom =
          el.scrollHeight - el.clientHeight <= el.scrollTop + 1;

        
        let remove: ()=> void;

        if (via)
            remove = this.output.printVia(via, ...data)
        else
            remove = this.output.print(...data)

        if (isScrolledToBottom) el.scrollTop = el.scrollHeight;
        
        return remove;
    }

    private _header(type: string, weight: string, color: string) {
        return [
            TextOutput.format('[', weight),
            TextOutput.format(type, weight, color),
            TextOutput.format(']', weight),
            ': ',
        ];
    }

    public print(...data: TextField[]) {
        return this.write(
            false,
            ...data
        );
    }

    public debug(...data: TextField[]) {
        return this.write(
            createElement('div', {classList: ['debug']}),
            ...this._header('Debug', 'small', 'sublte'),
            ...data,
        );
    }

    public info(...data: TextField[]) {
        return this.write(
            false,
            ...this._header('Info', 'bold', 'info'),
            ...data
        );
    }

    public warn(...data: TextField[]) {
        return this.write(
            false,
            ...this._header('Warning', 'bold', 'warning'),
            ...data
        );
    }

    public error(...data: TextField[]) {
        return this.write(
            false,
            ...this._header('Error', 'bold', 'danger'),
            ...data
        );
    }

    public onInput(cb: (data: string)=>void) {
        if (!this.input) throw new Error('no input channel');
        this.input.data.add(cb);
    }
}