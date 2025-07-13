import { trimMap, parseMessageType } from "./utils";
import type { MessageTypes, CompileResult, Section } from "./types";
export class Compiler {
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
        const [type, parsedText ] = parseMessageType(text);
        const [name, message] = this.#parseMessageLabel(parsedText);
        const interpolatedMessage = this.#interpolateVariables(message, data);
        return [type, name, interpolatedMessage];
    }
    #parseVariable(text: string) {
        const [variableLabel, variableValue] = trimMap(text.slice(1).split('='));
        return [variableLabel, variableValue]
    }
    #compileSection(str: string, ownerLabel: string|null) {
        
        const Data = {};
        const compiledSections = str.split(/\n/gm).filter(Boolean).reduce((acc: Section, line: string, i) => {
            // Start
            if (i === 0) {
                // Users have the option to assign an owner name at the start label
                // = start:Belle:
                // This strips the name out and trims the start label
                acc.id = line.split(':')[0].trim();
            // Assigning a variable
            } else if (line[0] === '~') {
                const [variableName, variableValue] = this.#parseVariable(line);
                Data[variableName] = variableValue;
            // Creating an option
            } else if (line[0] === '-') {
                const [text, destination] = trimMap(line.slice(1).split('->'))
                acc.options.push({ text, destination });
            // Treat everything else that isn't a comment as a recevied message
            } else if (line[0] !== '#') {
                const [type, name, message] = this.#parseMessage(line, Data);
                
                acc.messages.push({ type, name: type === 'sent' ? ownerLabel : name, message })
            }
            return acc;
        }, {
            id: '',
            messages: [],
            options: []
        } as Section)

        return compiledSections
    }

    #getOwnerLabel(startSection: string): string|null {
        const [startLabel] = trimMap(startSection.split('\n'));
        if (startLabel.indexOf(':') > -1 && startLabel.lastIndexOf(':') === startLabel.length - 1) {
            return startLabel.slice(0, -1).split(':')[1]
        }
        return null
    }

    compile(str:string):CompileResult {
        if (typeof str !== 'string') throw new Error('Inkling Compiler can only compile from a string');
        if (str.search(/=\s?start/gm) !== 0) {
            throw new Error('Inkling scripts must start with `= start` as the first line');
        }

        const uncompiledSections = str.split(/^=/gm).filter(Boolean);
        const ownerLabel = this.#getOwnerLabel(uncompiledSections[0]);
        const compiledSections = trimMap(uncompiledSections, (str) => this.#compileSection(str, ownerLabel));
        console.log({ ownerLabel });
        return {
            ownerLabel,
            sections: compiledSections
        }
    }
}