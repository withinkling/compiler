import type { MessageTypes } from "./types";

export function trimMap<T = string>(strArr: string[], cb?: (str: string, i:number, arr:string[]) => T) {
    return strArr.map<T>((str, i) => {
        str = str?.trim();
        return (cb ? cb(str, i, strArr) : str) as T;
    });
}

export function parseMessageType(text: string): [MessageTypes, string] {
    switch(text[0]) {
        case '<':
            return ['sent', text.slice(1).trim()];
        case '>':
            return ['received', text.slice(1).trim()];
        default:
            return ['received', text.trim()];
    }
}