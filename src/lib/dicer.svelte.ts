import getCroppedImg, { applyFilters, createImage, drawCircle, withOffscreenCanvas } from './canvas-utils';
import z from 'zod';
import { generateDiceDensityMatrix, getDieValue } from './dice-utils';
import assert from 'tiny-invariant';
export const DICER_LS_KEY = 'dicer';

// ToDo: Import from svelte-easy-crop somehow
export interface CropArea {
	x: number;
	y: number;
	width: number;
	height: number;
}

export const DieColorObj = {
	White: 'White',
	Black: 'Black',
} as const;

export const DiceColorObj = {
	...DieColorObj,
	Both: 'Both',
} as const;

export type ValueOf<T> = T[keyof T];
export type DieColorType = ValueOf<typeof DieColorObj>;
export type DiceColorType = ValueOf<typeof DiceColorObj>;

export enum DiceSidesCount {
	Six = 6,
	Twelve = 12,
}

export const CropAreaSchema = z.object({
	x: z.number(),
	y: z.number(),
	width: z.number(),
	height: z.number(),
});

export enum DesignTwo {
	Vertical = 'Vertical',
	Horizontal = 'Horizontal',
	Diagonal = 'Diagonal',
}

export const DiceColorSchema = z.enum([DiceColorObj.Black, DiceColorObj.White, DiceColorObj.Both]);

export interface Die {
	dieColor: DieColorType;
	dieValue: number;
}

export const DicerExportSchema = z.object({
	imgString_original: z.string().nullable(),
	cropArea: CropAreaSchema.nullable(),
	lockAspectRatioOriginal: z.boolean(),
	diceCountHorizontal: z.number().min(1),
	diceCountVertical: z.number().min(1),
	diceColor: DiceColorSchema,
	brightness: z.number().min(0),
	contrast: z.number().min(0),
	gamma: z.number().min(0),
	dieSize: z.number().min(1),
	glueSize: z.number().min(0),
	dicePricePerBatch: z.number().min(0.01),
	diceBatchSize: z.number().min(1),

	design_dotSize: z.number().min(1).max(33),
	design_dotSizeSingle: z.number().min(1).max(33),
	design_padding: z.number().min(0).max(33),
	design_paddingForSix: z.number().min(0).max(33),
	design_two: z.nativeEnum(DesignTwo),
});

type DicerExport = z.infer<typeof DicerExportSchema>;

const defaults: DicerExport = {
	imgString_original:
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAFzUkdCAK7OHOkAAAAEZ0FNQQAAsY8L/GEFAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M1cbXjNgAAAiNJREFUWEfFlytXw0AQhRMUuEoiKyNBIosr/4BKcOCwSCwOXCuLxFFHJRJkZWUqceBK7ibTTCazj4QWvnPSzWMedx+TTeN1TvSPqALiOC7PKrroDInTEACn6VVaXhWMHhembSOCkmuxeJyaAHLK7samBfPs3rRtRMjkg+TGtCC5vTQtxWkIQPLDft9cr5ZL00oRIcjkPCZEWAWsp6/lVYEUwZkvsvIsT5Qm5VmFTE7Eo9ONgD3z60FLHgL5USc0GgK4Mc67Jifgj4PiSjExnwJA6wD4kvumQIIp4fMPGgIARPDy4YtPlhVEyOQ2e1mCQB0BzQn3CSmC47OXIoIWIQ8WQhv7mgDZ+12A+FygdwSkIJ/AtvabNaD1/vzkwbSmdI7qb8H5bGbaaT6no9JvMByatsZHal5ET2/X5Y0CWgvOEVj1ZtF3uox6edxekprj4qwoTSRDcoCWkuM52eKAcMSxYRWAgCaAApKQkMlL8brl9zgkRB2dHOsUuAR8ZtV0wEZe23ieVAK9U+AKhGd0aNc2tFFQBdiGaxd4yxAcHBcfEW0J8QsS8PU+bi0C9vDz4RTQtecSVxyngCwvMTjjwHkbQn1ruyGVoqsEfwOVId8R1RHAa5bX9jawxasJgCqoA9sUgTi0d3i/B7YtwpUcqF9EnK5rgoQjOXWI4CkbixD/C7ADAgRJxAYTUg2aD3Vgf9Gv/S9oCNBgJlYbToi9KuDviaIfi8KAne9xAEUAAAAASUVORK5CYII=',
	cropArea: null,
	lockAspectRatioOriginal: false,
	diceCountHorizontal: 32,
	diceCountVertical: 32,
	diceColor: DiceColorObj.Both,
	brightness: 100,
	contrast: 104,
	gamma: 100,
	dieSize: 8,
	glueSize: 0.1,
	dicePricePerBatch: 1500,
	diceBatchSize: 1000,

	design_dotSize: 12,
	design_dotSizeSingle: 17,
	design_padding: 6,
	design_paddingForSix: 15,
	design_two: DesignTwo.Vertical,
};

export default class DicerService {
	//
	/**************/
	/* Properties */
	/**************/

	defaults: DicerExport = { ...defaults };

	//
	/*********************/
	/* User input params */
	/*********************/

	imgString_original: string | null = $state(this.defaults.imgString_original); // ToDo: make readonly. Can only modify through importImage() method
	cropArea: CropArea | null = $state(this.defaults.cropArea);
	lockAspectRatioOriginal: boolean = $state(this.defaults.lockAspectRatioOriginal);
	diceCountHorizontal: number = $state(this.defaults.diceCountHorizontal);
	diceCountVertical: number = $state(this.defaults.diceCountVertical);
	diceColor: DiceColorType = $state(this.defaults.diceColor);
	brightness: number = $state(this.defaults.brightness);
	contrast: number = $state(this.defaults.contrast);
	gamma: number = $state(this.defaults.gamma);
	dieSize: number = $state(this.defaults.dieSize);
	glueSize: number = $state(this.defaults.glueSize);
	dicePricePerBatch: number = $state(this.defaults.dicePricePerBatch);
	diceBatchSize: number = $state(this.defaults.diceBatchSize);
	design_dotSize: number = $state(this.defaults.design_dotSize);
	design_dotSizeSingle: number = $state(this.defaults.design_dotSizeSingle);
	design_padding: number = $state(this.defaults.design_padding);
	design_paddingForSix: number = $state(this.defaults.design_paddingForSix);
	design_two: DesignTwo = $state(this.defaults.design_two);

	design_borderWidth = 1;
	design_dotColor_WhiteDie = 'black';
	design_dotColor_BlackDie = 'white';
	design_dotColorSingle_whiteDie = 'black';
	design_dotColorSingle_blackDie = 'white';
	design_bgColor_whiteDie = 'white';
	design_bgColor_blackDie = 'black';
	design_borderColor_whiteDie = 'black';
	design_borderColor_blackDie = 'white';

	//
	/*****************/
	/* Derived state */
	/*****************/
	// Unfortunately, some manipulations require an HTMLImageElement while others need image string.
	// Must be manually synced from imgElement_string
	imgElement_original: HTMLImageElement | null = $state(null);

	//
	/***************/
	/* Constructor */
	/***************/

	constructor(data?: DicerExport) {
		if (data) {
			this.import(data);
		} else if (this.imgString_original) {
			this.importImageStr();
		}
	}

	//
	/*****************/
	/* Derived state */
	/*****************/

	aspectRatioOriginal: number | null = $derived.by(() => {
		return this.imgElement_original
			? this.imgElement_original.width / this.imgElement_original.height //
			: null;
	});

	diceCountVerticalEffective: number | null = $derived.by(() => {
		if (!this.lockAspectRatioOriginal) {
			return this.diceCountVertical ?? null;
		}

		if (this.aspectRatioOriginal === null) {
			return null;
		}

		return Math.round(this.diceCountHorizontal / this.aspectRatioOriginal);
	});

	aspectRatioDice: number | undefined = $derived.by(() => {
		return this.diceCountVerticalEffective === null
			? undefined //
			: this.diceCountHorizontal / this.diceCountVerticalEffective;
	});

	diceCountTotal: number | null = $derived.by(() => {
		return this.diceCountVerticalEffective === null
			? null //
			: this.diceCountHorizontal * this.diceCountVerticalEffective;
	});

	availableDiceSidesCount: DiceSidesCount = $derived.by(() => {
		return this.diceColor === DiceColorObj.Both
			? DiceSidesCount.Twelve //
			: DiceSidesCount.Six;
	});

	imgData_cropped: ImageData | null = $derived.by(() => {
		return this.imgElement_original && this.cropArea
			? getCroppedImg(this.imgElement_original, this.cropArea) //
			: null;
	});

	imgData_cropped_resized: ImageData | null = $derived.by(() => {
		if (!this.imgData_cropped || !this.diceCountVerticalEffective) {
			return null;
		}

		const width = this.diceCountHorizontal;
		const height = this.diceCountVerticalEffective;

		// We need two canvases: put the source image into one canvas,
		// then draw in on the second canvas with adjusted dimensions.
		const canvas1 = withOffscreenCanvas(this.imgData_cropped, (_ctx1, canvas1) => canvas1);

		return withOffscreenCanvas({ width, height }, (ctx2) => {
			ctx2.drawImage(canvas1, 0, 0, width, height);
			return ctx2.getImageData(0, 0, width, height);
		});
	});

	imgData_cropped_resized_filtered: ImageData | null = $derived.by(() => {
		if (!this.imgData_cropped_resized) {
			return null;
		}

		return applyFilters(this.imgData_cropped_resized, {
			brightness: this.brightness,
			contrast: this.contrast,
			gamma: this.gamma,
			diceSidesCount: this.availableDiceSidesCount,
		});
	});

	totalWidth: number = $derived.by(() => {
		const width = this.diceCountHorizontal * (this.dieSize + this.glueSize) - this.glueSize;

		return Math.round(width * 10) / 10;
	});

	totalHeight: number | null = $derived.by(() => {
		if (!this.diceCountVerticalEffective) {
			return null;
		}

		const height = this.diceCountVerticalEffective * (this.dieSize + this.glueSize) - this.glueSize;

		return Math.round(height * 10) / 10;
	});

	export: DicerExport = $derived.by(() => {
		return {
			imgString_original: this.imgString_original,
			cropArea: this.cropArea,
			lockAspectRatioOriginal: this.lockAspectRatioOriginal,
			diceCountHorizontal: this.diceCountHorizontal,
			diceCountVertical: this.diceCountVertical,
			diceColor: this.diceColor,
			brightness: this.brightness,
			contrast: this.contrast,
			gamma: this.gamma,
			dieSize: this.dieSize,
			glueSize: this.glueSize,
			dicePricePerBatch: this.dicePricePerBatch,
			diceBatchSize: this.diceBatchSize,

			design_dotSize: this.design_dotSize,
			design_dotSizeSingle: this.design_dotSizeSingle,
			design_padding: this.design_padding,
			design_paddingForSix: this.design_paddingForSix,
			design_two: this.design_two,
		};
	});

	diceDensityMatrix: number[][] | null = $derived.by(() => {
		if (!this.imgData_cropped_resized_filtered) {
			return null;
		}

		return generateDiceDensityMatrix(this.imgData_cropped_resized_filtered, this.availableDiceSidesCount);
	});

	diceMatrix: Die[][] | null = $derived.by(() => {
		if (!this.diceDensityMatrix) {
			return null;
		}

		return this.diceDensityMatrix.map((row: number[]) => {
			return row.map((density: number) => {
				return getDieValue(density, this.diceColor);
			});
		});
	});

	diceCountWhite: number | null = $derived.by(() => {
		if (this.diceColor === DiceColorObj.White) {
			return this.diceCountTotal;
		}

		if (this.diceColor === DiceColorObj.Black) {
			return 0;
		}

		if (!this.diceDensityMatrix) {
			return null;
		}

		return this.diceDensityMatrix.reduce((result: number, row: number[]) => {
			return (
				result +
				row.reduce((result: number, density: number) => {
					return result + (density >= 7 ? 1 : 0);
				}, 0)
			);
		}, 0);
	});

	diceCountBlack: number | null = $derived.by(() => {
		if (this.diceColor === DiceColorObj.White) {
			return 0;
		}

		if (this.diceColor === DiceColorObj.Black) {
			return this.diceCountTotal;
		}

		if (!this.diceDensityMatrix) {
			return null;
		}

		return this.diceDensityMatrix.reduce((result: number, row: number[]) => {
			return (
				result +
				row.reduce((result: number, density: number) => {
					return result + (density <= 6 ? 1 : 0);
				}, 0)
			);
		}, 0);
	});

	diceCountWhiteRoundedUpToBatch: number | null = $derived.by(() => {
		if (this.diceCountWhite === null || this.diceBatchSize === 0) {
			return null;
		}
		return Math.ceil(this.diceCountWhite / this.diceBatchSize) * this.diceBatchSize;
	});

	diceCountBlackRoundedUpToBatch: number | null = $derived.by(() => {
		if (this.diceCountBlack === null || this.diceBatchSize === 0) {
			return null;
		}
		return Math.ceil(this.diceCountBlack / this.diceBatchSize) * this.diceBatchSize;
	});

	diceCountTotalRoundedUpToBatch: number | null = $derived.by(() => {
		if (this.diceCountWhiteRoundedUpToBatch === null || this.diceCountBlackRoundedUpToBatch === null) {
			return null;
		}

		return this.diceCountWhiteRoundedUpToBatch + this.diceCountBlackRoundedUpToBatch;
	});

	totalPriceRoundedUpToBatch: number | null = $derived.by(() => {
		if (this.diceCountTotalRoundedUpToBatch === null || this.dicePricePerBatch === 0) {
			return null;
		}
		return (this.diceCountTotalRoundedUpToBatch / this.diceBatchSize) * this.dicePricePerBatch;
	});

	imgDataDieOneWhite: ImageData = $derived.by(() => {
		return this.drawDieOne(DiceColorObj.White);
	});

	imgDataDieOneBlack: ImageData = $derived.by(() => {
		return this.drawDieOne(DiceColorObj.Black);
	});

	imgDataDieTwoWhite: ImageData = $derived.by(() => {
		return this.drawDieTwo(DiceColorObj.White);
	});

	imgDataDieTwoBlack: ImageData = $derived.by(() => {
		return this.drawDieTwo(DiceColorObj.Black);
	});

	imgDataDieThreeWhite: ImageData = $derived.by(() => {
		return this.drawDieThree(DiceColorObj.White);
	});

	imgDataDieThreeBlack: ImageData = $derived.by(() => {
		return this.drawDieThree(DiceColorObj.Black);
	});

	imgDataDieFourWhite: ImageData = $derived.by(() => {
		return this.drawDieFour(DiceColorObj.White);
	});

	imgDataDieFourBlack: ImageData = $derived.by(() => {
		return this.drawDieFour(DiceColorObj.Black);
	});

	imgDataDieFiveWhite: ImageData = $derived.by(() => {
		return this.drawDieFive(DiceColorObj.White);
	});

	imgDataDieFiveBlack: ImageData = $derived.by(() => {
		return this.drawDieFive(DiceColorObj.Black);
	});

	imgDataDieSixWhite: ImageData = $derived.by(() => {
		return this.drawDieSix(DiceColorObj.White);
	});

	imgDataDieSixBlack: ImageData = $derived.by(() => {
		return this.drawDieSix(DiceColorObj.Black);
	});

	//
	/******************/
	/* Public methods */
	/******************/

	async persistUploadedImage(imgString: string): Promise<void> {
		this.imgElement_original = await createImage(imgString);
		this.cropArea = {
			x: 0,
			y: 0,
			width: this.imgElement_original.width,
			height: this.imgElement_original.height,
		};
		this.imgString_original = imgString; // should populate after image is loaded inside `createImage`, in order to avoid a race condition
	}

	async import(data: DicerExport): Promise<void> {
		this.cropArea = data.cropArea;
		this.lockAspectRatioOriginal = data.lockAspectRatioOriginal;
		this.diceCountHorizontal = data.diceCountHorizontal;
		this.diceCountVertical = data.diceCountVertical;
		this.diceColor = data.diceColor;
		this.brightness = data.brightness;
		this.contrast = data.contrast;
		this.gamma = data.gamma;
		this.dieSize = data.dieSize;
		this.glueSize = data.glueSize;
		this.dicePricePerBatch = data.dicePricePerBatch;
		this.diceBatchSize = data.diceBatchSize;
		this.design_dotSize = data.design_dotSize;
		this.design_dotSizeSingle = data.design_dotSizeSingle;
		this.design_padding = data.design_padding;
		this.design_paddingForSix = data.design_paddingForSix;
		this.design_two = data.design_two;

		// Goes last in order to trigger the chain only once
		await this.importImageStr(data.imgString_original);
	}

	reset() {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { imgString_original, ...params } = this.defaults;

		Object.assign(this, params);
	}

	async importImageStr(imageStr: string | null = this.defaults.imgString_original): Promise<void> {
		this.imgString_original = imageStr;

		if (imageStr != null) {
			this.imgElement_original = await createImage(imageStr);
		}
	}

	async importFromLocalStorageMaybe(): Promise<boolean> {
		const maybeDataStr = localStorage.getItem(DICER_LS_KEY);

		if (!maybeDataStr) {
			return false;
		}

		const maybeData = (() => {
			try {
				return JSON.parse(maybeDataStr);
			} catch (e) {
				console.error(e);
				localStorage.removeItem(DICER_LS_KEY);
				return false;
			}
		})();

		const result = DicerExportSchema.safeParse(maybeData);

		if (!result.success) {
			console.error('Failed to parse data from localStorage', result.error);
			localStorage.removeItem(DICER_LS_KEY);
			return false;
		}

		await this.import(result.data);

		return true;
	}

	setUpEffectToWriteToLocalStorage(): void {
		$effect(() => {
			localStorage.setItem(DICER_LS_KEY, JSON.stringify(this.export));
		});
	}

	drawDie(
		dieColor: DiceColorType,
		callback: (
			ctx: OffscreenCanvasRenderingContext2D,
			d: { dotColor: string; dotColorSingle: string; bgColor: string; borderColor: string }
		) => void
	): ImageData {
		assert(dieColor !== DiceColorObj.Both, 'Expected DiceColorObj.White or DiceColorObj.Black');

		const isDieWhite = dieColor === DiceColorObj.White;

		// prettier-ignore
		const d = {
			dotColor:       isDieWhite ? this.design_dotColor_WhiteDie       : this.design_dotColor_BlackDie,
			dotColorSingle: isDieWhite ? this.design_dotColorSingle_whiteDie : this.design_dotColorSingle_blackDie,
			bgColor:        isDieWhite ? this.design_bgColor_whiteDie        : this.design_bgColor_blackDie,
			borderColor:    isDieWhite ? this.design_borderColor_whiteDie    : this.design_borderColor_blackDie,
			borderWidth: this.design_borderWidth,
		};

		return withOffscreenCanvas({ width: 100, height: 100 }, (ctx) => {
			ctx.fillStyle = d.bgColor;
			ctx.fillRect(0, 0, 99, 99);

			ctx.lineWidth = d.borderWidth;
			ctx.strokeStyle = d.borderColor;

			ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, 99 - ctx.lineWidth, 99 - ctx.lineWidth);
			callback(ctx, d);

			return ctx.getImageData(0, 0, 99, 99);
		});
	}

	drawDieOne(dieColor: DiceColorType): ImageData {
		return this.drawDie(dieColor, (ctx, d) => {
			drawCircle(ctx, 49.5, 49.5, this.design_dotSizeSingle, d.dotColorSingle);
		});
	}

	drawDieTwo(dieColor: DiceColorType): ImageData {
		return this.drawDie(dieColor, (ctx, d) => {
			const pad = this.design_padding;
			const rad = this.design_dotSize;

			// prettier-ignore
			const firstLeft =
					this.design_two === DesignTwo.Diagonal   ? 99 - (pad + rad) :
					this.design_two === DesignTwo.Horizontal ? pad + rad  :
					49.5
			// prettier-ignore
			const firstTop =
					this.design_two === DesignTwo.Diagonal   ? pad + rad :
					this.design_two === DesignTwo.Horizontal ? 49.5        :
																										pad + rad
			// prettier-ignore
			const secondLeft =
					this.design_two === DesignTwo.Diagonal   ? pad + rad         :
					this.design_two === DesignTwo.Horizontal ? 99 - (pad + rad) :
					49.5
			// prettier-ignore
			const secondTop =
					this.design_two === DesignTwo.Diagonal   ? 99 - (pad + rad) :
					this.design_two === DesignTwo.Horizontal ? 49.5                :
																										99 - (pad + rad)

			drawCircle(ctx, firstLeft, firstTop, rad, d.dotColor);
			drawCircle(ctx, secondLeft, secondTop, rad, d.dotColor);
		});
	}

	drawDieThree(dieColor: DiceColorType): ImageData {
		return this.drawDie(dieColor, (ctx, d) => {
			const pad = this.design_padding;
			const rad = this.design_dotSize;

			drawCircle(ctx, 99 - (pad + rad), pad + rad, rad, d.dotColor);
			drawCircle(ctx, 49.5, 49.5, rad, d.dotColor);
			drawCircle(ctx, pad + rad, 99 - (pad + rad), rad, d.dotColor);
		});
	}

	drawDieFour(dieColor: DiceColorType): ImageData {
		return this.drawDie(dieColor, (ctx, d) => {
			const pad = this.design_padding;
			const rad = this.design_dotSize;

			drawCircle(ctx, pad + rad, pad + rad, rad, d.dotColor);
			drawCircle(ctx, pad + rad, 99 - (pad + rad), rad, d.dotColor);
			drawCircle(ctx, 99 - (pad + rad), pad + rad, rad, d.dotColor);
			drawCircle(ctx, 99 - (pad + rad), 99 - (pad + rad), rad, d.dotColor);
		});
	}

	drawDieFive(dieColor: DiceColorType): ImageData {
		return this.drawDie(dieColor, (ctx, d) => {
			const pad = this.design_padding;
			const rad = this.design_dotSize;

			drawCircle(ctx, pad + rad, pad + rad, rad, d.dotColor);
			drawCircle(ctx, pad + rad, 99 - (pad + rad), rad, d.dotColor);
			drawCircle(ctx, 49.5, 49.5, rad, d.dotColor);
			drawCircle(ctx, 99 - (pad + rad), pad + rad, rad, d.dotColor);
			drawCircle(ctx, 99 - (pad + rad), 99 - (pad + rad), rad, d.dotColor);
		});
	}

	drawDieSix(dieColor: DiceColorType): ImageData {
		return this.drawDie(dieColor, (ctx, d) => {
			const padV = this.design_padding;
			const padH = this.design_paddingForSix;
			const rad = this.design_dotSize;

			drawCircle(ctx, padH + rad, padV + rad, rad, d.dotColor);
			drawCircle(ctx, padH + rad, 99 - (padV + rad), rad, d.dotColor);
			drawCircle(ctx, 99 - (padH + rad), 49.5, rad, d.dotColor);
			drawCircle(ctx, padH + rad, 49.5, rad, d.dotColor);
			drawCircle(ctx, 99 - (padH + rad), padV + rad, rad, d.dotColor);
			drawCircle(ctx, 99 - (padH + rad), 99 - (padV + rad), rad, d.dotColor);
		});
	}
}
