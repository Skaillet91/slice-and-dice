import { z } from 'zod';
import { DiceColor, type DiceSidesCount } from './dicer.svelte';
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

export const getDieValue = (density: number, diceColor: DiceColor): { dieColor: DiceColor; dieValue: number } => {
	const densityEffective = DensitySchema.parse(density);

	if (diceColor === DiceColor.White) {
		return { dieColor: diceColor, dieValue: 7 - densityEffective };
	}

	if (diceColor === DiceColor.Black) {
		return { dieColor: diceColor, dieValue: densityEffective };
	}

	if (diceColor === DiceColor.Both) {
		if (densityEffective >= 1 && densityEffective <= 6) {
			return { dieColor: DiceColor.Black, dieValue: densityEffective };
		} else {
			return { dieColor: DiceColor.White, dieValue: 13 - densityEffective };
		}
	}

	assert(false, 'This code should be unreachable');
};
