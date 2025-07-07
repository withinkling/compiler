import { trimMap } from "./utils";

interface Option {
    type: 'option';
    destination: string;
    text: string;
}

type MessageTypes = 'sent'|'received';

interface Message {
    message: string;
    type: MessageTypes
    name: string|null;
}

interface Section {
    id: string;
    messages: Message[];
    options: Option[];
}

export class Compiler {
    getMessageType(text: string): [MessageTypes, string] {
        switch(text[0]) {
            case '<':
                return ['sent', text.slice(1).trim()];
            case '>':
                return ['received', text.slice(1).trim()];
            default:
                return ['received', text.trim()];
        }
    }
    getMessageLabel(text:string): [string|null, string] {
        if (text.indexOf(':') === -1) return [null, text];
        return [text.slice(text.indexOf(':') + 1, text.lastIndexOf(':')).trim(), text.slice(text.lastIndexOf(':') + 1).trim()];
    }
    parseMessage(text:string):[MessageTypes,string|null,string] {
        const [type, parsedText ] = this.getMessageType(text);
        const [name, message] = this.getMessageLabel(parsedText);

        return [type, name, message];
    }
    compileSection(str: string, _i?: number, _arr?: string[]) {
        console.log(this);
        const compiledSections = str.split(/\n/gm).filter(Boolean).reduce((acc: Section, line: string, i) => {
            if (i === 0) {
                acc.id = line.trim();
            } else if (line[0] === '-') {
                const [text, destination] = trimMap(line.slice(1).split('->'))
                acc.options.push({ type: 'option', text, destination });
            } else {
                const [type, name, message] = this.parseMessage(line)
                acc.messages.push({ type, name, message })
            }
            return acc;
        }, {
            id: '',
            messages: [],
            options: []
        } as Section)

        return compiledSections;
    }

    compile(str:string) {
        if (typeof str !== 'string') throw new Error('Inkling Compiler can only compile from a string');
        if (str.search(/=\s?start/gm) !== 0) {
            console.log(str.search(/=\s?start/gm));
            throw new Error('Inkling scripts must start with `= start` as the first line');
        }

        const uncompiledSections = str.split(/^=/gm).filter(Boolean);
        const compiledSections = trimMap(uncompiledSections, (str) => this.compileSection(str));

        return compiledSections
    }
}