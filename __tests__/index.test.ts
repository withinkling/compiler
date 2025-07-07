import { expect, it, describe } from 'vitest';
import { Compiler } from '../src/compiler'

const testScriptBadStart = `This is a message
> this is another message

- Is it? -> a
- So true -> b

= a
>:nameB Yes!
>:nameB This shouldn't have a label

= b
>:nameB Right??

- I don't like this -> c
- I don't love this -> aSectionNameWithoutAnySpaces

= c
>:name: Too bad

= aSectionNameWithoutAnySpaces
>:name: That's hard to hear
>:name: This shouldn't have a label`
const testScript = `= start
This is a message
> this is another message

- Is it? -> a
- So true -> b

= a
>:nameB: Yes!
>:nameB: This shouldn't have a label

= b
>:nameB: Right??

- I don't like this -> c
- I don't love this -> aSectionNameWithoutAnySpaces

= c
>:name: Too bad

= aSectionNameWithoutAnySpaces
>:name: That's hard to hear
>:name: This shouldn't have a label`

describe('Compiler', () => {
    const C = new Compiler();
    it('should accept a string', () => {
        // @ts-expect-error
        expect(() => C.compile({})).toThrowError();
    })

    it('should stop if there is no start section', () => {
        expect(() => C.compile(testScriptBadStart)).toThrowError();
    })

    it('should handle simple scripts', () => {
        expect(C.compile(`= start
Testing`)).toStrictEqual([{id:'start',messages:[{type:'received',name:null,message:'Testing'}], options:[]}])
    })

    it('should handle creating options', () => {
        expect(C.compile(`=start
Hello!
- option -> A
= A
Testing`)).toStrictEqual([{ id:'start', messages:[{type:'received',name:null,message:'Hello!'}],options:[{type:'option',destination:'A',text:'option'}]},{id:'A',messages:[{type:'received',message:'Testing',name:null}],options:[]}])
    });

    it('should pass with all features used', () => {
        expect(C.compile(testScript)).toStrictEqual([{
            id: 'start',
            messages: [
                {
                    message: 'This is a message',
                    name: null,
                    type: 'received',
                },
                {
                    message: 'this is another message',
                    name: null,
                    type: 'received'
                }
            ],
            options: [
                {
                    destination: 'a',
                    text: 'Is it?',
                    type: 'option',
                },
                {
                    destination: 'b',
                    text: 'So true',
                    type: 'option'
                }
            ]
        },{
            id: 'a',
            messages: [
                {
                    message:'Yes!',
                    name: 'nameB',
                    type: 'received',
                },
                {
                    message: "This shouldn't have a label",
                    name: 'nameB',
                    type: 'received'
                }
            ],
            options: []
        }, {
            id: 'b',
            messages: [
                {
                    message:"Right??",
                    name: 'nameB',
                    type: 'received'
                }
            ],
            options: [
                {
                    destination: 'c',
                    text: "I don't like this",
                    type: 'option'
                },
                {
                    destination: "aSectionNameWithoutAnySpaces",
                    text: "I don't love this",
                    type: "option"
                }
            ]
        }, {
            id: 'c',
            messages: [
                {
                    message: 'Too bad',
                    name: 'name',
                    type: 'received'
                }
            ],
            options: []
        }, {
            id: 'aSectionNameWithoutAnySpaces',
            messages: [
                {
                    message: "That's hard to hear",
                    name: 'name',
                    type: 'received'
                },
                {
                    message: "This shouldn't have a label",
                    name: 'name',
                    type: 'received'
                }
            ],
            options: []
        }])
    })


    
    it('should ignore comments', () => {
        expect(C.compile(`= start
>:test: This is a message
# This is a comment`)).toStrictEqual([{ id: 'start', messages: [{ type: 'received', message: 'This is a message', name: 'test'}], options: []}])
    })

    it('should interpolate variables into messages', () => {
        expect(C.compile(`=start
~ a = 100
~ name = Jeremiah Blovidious Scrumptious The Third
> I'm {a} years old and my name is {name}`)).toStrictEqual([
    {
        id: 'start',
        messages: [
            {
                message:"I'm 100 years old and my name is Jeremiah Blovidious Scrumptious The Third",
                name: null,
                type: "received"
            }
        ],
        options: []
    }
])
    })
})