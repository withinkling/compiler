
export interface Option {
    destination: string;
    text: string;
}

export type MessageTypes = 'sent'|'received';

export interface Message {
    message: string;
    type: MessageTypes
    name: string|null;
}

export interface Section {
    id: string;
    messages: Message[];
    options: Option[];
}

export interface CompileResult {
    ownerLabel: string|null;
    sections: Section[]
}