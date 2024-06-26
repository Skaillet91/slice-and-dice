import { z } from 'zod';
import { DiceColorObj, type DiceColorType, type DiceSidesCount, type Die } from './dicer.svelte';
import assert from 'tiny-invariant';

export const generateDiceDensityMatrix = (imgData: ImageData, diceSidesCount: DiceSidesCount): number[][] => {
	const { width, height, data } = imgData;
	const matrix = [];
	for (let y = 0; y < height; y++) {
		const row = [];
		for (let x = 0; x < width; x++) {
			const index = (y * width + x) * 4; // Calculate the index for the red component (the image should be grey, so all color components should be the same)
			const redValue = data[index]; // Get the red component
			const diceSideValue = Math.round((redValue * (diceSidesCount - 1)) / 255) + 1; // Calculate the dice side value
			// const diceSideValue = Math.max(1, Math.min(diceSideValueRaw, 12)); // Ensure the value is within [1, 12]
			row.push(diceSideValue);
		}
		matrix.push(row);
	}

	return matrix;
};

const DensitySchema = z.number().int().min(1).max(12);

export const getDieValue = (density: number, diceColor: DiceColorType): Die => {
	const densityEffective = DensitySchema.parse(density);

	if (diceColor === DiceColorObj.White) {
		return { dieColor: diceColor, dieValue: 7 - densityEffective };
	}

	if (diceColor === DiceColorObj.Black) {
		return { dieColor: diceColor, dieValue: densityEffective };
	}

	if (diceColor === DiceColorObj.Both) {
		if (densityEffective >= 1 && densityEffective <= 6) {
			return { dieColor: DiceColorObj.Black, dieValue: densityEffective };
		} else {
			return { dieColor: DiceColorObj.White, dieValue: 13 - densityEffective };
		}
	}

	assert(false, 'This code should be unreachable');
};
