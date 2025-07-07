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
    #parseMessageType(text: string): [MessageTypes, string] {
        switch(text[0]) {
            case '<':
                return ['sent', text.slice(1).trim()];
            case '>':
                return ['received', text.slice(1).trim()];
            default:
                return ['received', text.trim()];
        }
    }
    #parseMessageLabel(text:string): [string|null, string] {
        if (text.indexOf(':') === -1) return [null, text];
        return [text.slice(text.indexOf(':') + 1, text.lastIndexOf(':')).trim(), text.slice(text.lastIndexOf(':') + 1).trim()];
    }
    #interpolateVariables(text:string, data: Record<string, string>) {
        let output = text;
        Object.entries(data).forEach(([key, value]) => {
            output = output.replace(new RegExp(`{${key}}`, 'g'), value)
        })
        return output;
    }
    #parseMessage(text:string, data: Record<string, string>):[MessageTypes,string|null,string] {
        const [type, parsedText ] = this.#parseMessageType(text);
        const [name, message] = this.#parseMessageLabel(parsedText);
        const interpolatedMessage = this.#interpolateVariables(message, data);
        return [type, name, interpolatedMessage];
    }
    #parseVariable(text: string) {
        const [variableLabel, variableValue] = trimMap(text.slice(1).split('='));
        return [variableLabel, variableValue]
    }
    #compileSection(str: string, _i?: number, _arr?: string[]) {
        const Data = {};
        const compiledSections = str.split(/\n/gm).filter(Boolean).reduce((acc: Section, line: string, i) => {
            // Start
            if (i === 0) {
                acc.id = line.trim();
            // Assigning a variable
            } else if (line[0] === '~') {
                const [variableName, variableValue] = this.#parseVariable(line);
                Data[variableName] = variableValue;
            // Creating an option
            } else if (line[0] === '-') {
                const [text, destination] = trimMap(line.slice(1).split('->'))
                acc.options.push({ type: 'option', text, destination });
            // Treat everything else that isn't a comment as a recevied message
            } else if (line[0] !== '#') {
                const [type, name, message] = this.#parseMessage(line, Data)
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
            throw new Error('Inkling scripts must start with `= start` as the first line');
        }

        const uncompiledSections = str.split(/^=/gm).filter(Boolean);
        const compiledSections = trimMap(uncompiledSections, (str) => this.#compileSection(str));

        return compiledSections
    }
}