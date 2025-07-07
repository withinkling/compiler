import { expect, describe, it } from 'vitest';
import * as utils from '../src/utils';

describe('Utils', () => {
    describe('trimMap', () => {
        it('should map and trim all strings in an array', () => {
            expect(utils.trimMap([' a '])).toStrictEqual(['a'])
        })
        it('should accept a mapping function', () => {
            expect(utils.trimMap([' a '], (str, i) => [str, i] )).toStrictEqual([['a', 0]])
        })
    })
})