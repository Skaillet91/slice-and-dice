import { assert, describe, expect, it } from 'vitest';
import { getDieValue } from './dice-utils';
import { DiceColorObj, type DiceColorType } from './dicer.svelte';
import { ZodError } from 'zod';

describe('getDieValue', () => {
	describe('happy path', () => {
		interface TestCase {
			diceColor: DiceColorType;
			density: number;
			expected: { dieColor: DiceColorType; dieValue: number };
		}

		const testCases: TestCase[] = [
			{ diceColor: DiceColorObj.White, density: 1, expected: { dieColor: DiceColorObj.White, dieValue: 6 } },
			{ diceColor: DiceColorObj.White, density: 2, expected: { dieColor: DiceColorObj.White, dieValue: 5 } },
			{ diceColor: DiceColorObj.White, density: 3, expected: { dieColor: DiceColorObj.White, dieValue: 4 } },
			{ diceColor: DiceColorObj.White, density: 4, expected: { dieColor: DiceColorObj.White, dieValue: 3 } },
			{ diceColor: DiceColorObj.White, density: 5, expected: { dieColor: DiceColorObj.White, dieValue: 2 } },
			{ diceColor: DiceColorObj.White, density: 6, expected: { dieColor: DiceColorObj.White, dieValue: 1 } },

			{ diceColor: DiceColorObj.Black, density: 1, expected: { dieColor: DiceColorObj.Black, dieValue: 1 } },
			{ diceColor: DiceColorObj.Black, density: 2, expected: { dieColor: DiceColorObj.Black, dieValue: 2 } },
			{ diceColor: DiceColorObj.Black, density: 3, expected: { dieColor: DiceColorObj.Black, dieValue: 3 } },
			{ diceColor: DiceColorObj.Black, density: 4, expected: { dieColor: DiceColorObj.Black, dieValue: 4 } },
			{ diceColor: DiceColorObj.Black, density: 5, expected: { dieColor: DiceColorObj.Black, dieValue: 5 } },
			{ diceColor: DiceColorObj.Black, density: 6, expected: { dieColor: DiceColorObj.Black, dieValue: 6 } },

			{ diceColor: DiceColorObj.Both, density: 1, expected: { dieColor: DiceColorObj.Black, dieValue: 1 } },
			{ diceColor: DiceColorObj.Both, density: 2, expected: { dieColor: DiceColorObj.Black, dieValue: 2 } },
			{ diceColor: DiceColorObj.Both, density: 3, expected: { dieColor: DiceColorObj.Black, dieValue: 3 } },
			{ diceColor: DiceColorObj.Both, density: 4, expected: { dieColor: DiceColorObj.Black, dieValue: 4 } },
			{ diceColor: DiceColorObj.Both, density: 5, expected: { dieColor: DiceColorObj.Black, dieValue: 5 } },
			{ diceColor: DiceColorObj.Both, density: 6, expected: { dieColor: DiceColorObj.Black, dieValue: 6 } },
			{ diceColor: DiceColorObj.Both, density: 7, expected: { dieColor: DiceColorObj.White, dieValue: 6 } },
			{ diceColor: DiceColorObj.Both, density: 8, expected: { dieColor: DiceColorObj.White, dieValue: 5 } },
			{ diceColor: DiceColorObj.Both, density: 9, expected: { dieColor: DiceColorObj.White, dieValue: 4 } },
			{ diceColor: DiceColorObj.Both, density: 10, expected: { dieColor: DiceColorObj.White, dieValue: 3 } },
			{ diceColor: DiceColorObj.Both, density: 11, expected: { dieColor: DiceColorObj.White, dieValue: 2 } },
			{ diceColor: DiceColorObj.Both, density: 12, expected: { dieColor: DiceColorObj.White, dieValue: 1 } },
		];

		testCases.forEach(({ diceColor, density, expected }) => {
			it(`should return ${JSON.stringify(expected)} for diceColor: ${diceColor}, density: ${density}`, () => {
				const result = getDieValue(density, diceColor);
				expect(result).toEqual(expected);
			});
		});
	});

	describe('unhappy paths', () => {
		const errorTestCases: { density: number; expectedErrorMessage: string }[] = [
			{ density: 0, expectedErrorMessage: 'Number must be greater than or equal to 1' },
			{ density: -1, expectedErrorMessage: 'Number must be greater than or equal to 1' },
			{ density: 13, expectedErrorMessage: 'Number must be less than or equal to 12' },
			{ density: 100, expectedErrorMessage: 'Number must be less than or equal to 12' },
			{ density: -100, expectedErrorMessage: 'Number must be greater than or equal to 1' },
			{ density: NaN, expectedErrorMessage: 'Expected number, received nan' },
			{ density: 1.5, expectedErrorMessage: 'Expected integer, received float' },
		];

		errorTestCases.forEach(({ density, expectedErrorMessage }) => {
			it(`should throw an error with message "${expectedErrorMessage}" when density is ${density}`, () => {
				try {
					getDieValue(density, DiceColorObj.White);
					assert.fail('Expected an error to be thrown');
				} catch (e) {
					if (e instanceof Error && e.message === 'Expected an error to be thrown') {
						throw e;
					}

					expect(e).toBeInstanceOf(ZodError);

					if (e instanceof ZodError) {
						expect(e.issues[0].message).toBe(expectedErrorMessage);
					}
				}
			});
		});
	});
});
