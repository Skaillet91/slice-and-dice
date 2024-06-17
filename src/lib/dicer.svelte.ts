import getCroppedImg, {
	applyFilters,
	createImage,
	withOffscreenCanvas,
} from './canvas-utils';
import assert from 'tiny-invariant';
import z from 'zod';
import { generateDiceDensityMatrix } from './dice-utils';

export const DICER_LS_KEY = 'dicer';

// ToDo: Import from svelte-easy-crop somehow
export interface CropArea {
	x: number;
	y: number;
	width: number;
	height: number;
}

export enum DiceColor {
	White = 'White',
	Black = 'Black',
	Both = 'Both',
}

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

export const DiceColorSchema = z.nativeEnum(DiceColor);

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
});

type DicerExport = z.infer<typeof DicerExportSchema>;

export default class DicerService {
	//
	/*********************/
	/* User input params */
	/*********************/

	// These to must be manually kept in sync.
	// Unfortunately, some manipulations require an HTMLImageElement while others need image string.
	imgElement_original: HTMLImageElement | null = $state(null);
	imgString_original: string | null = $state(null); // ToDo: make readonly. Can only modify through importImage() method
	cropArea: CropArea | null = $state(null);
	lockAspectRatioOriginal: boolean = $state(true);
	diceCountHorizontal: number = $state(100);
	diceCountVertical: number = $state(60);
	diceColor: DiceColor = $state(DiceColor.Both);
	brightness: number = $state(100);
	contrast: number = $state(100);
	gamma: number = $state(100);

	//
	/***************/
	/* Constructor */
	/***************/

	constructor(data?: DicerExport) {
		if (data) {
			this.import(data);
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
		assert(
			this.lockAspectRatioOriginal,
			'diceCoutVerticalEffective is only available when lockAspectRatioOriginal is true.'
		);

		return this.aspectRatioOriginal === null
			? null //
			: Math.round(this.diceCountHorizontal / this.aspectRatioOriginal);
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
		return this.diceColor === DiceColor.Both
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
		};
	});

	diceDensityMatrix: number[][] | null = $derived.by(() => {
		if (!this.imgData_cropped_resized_filtered) {
			return null;
		}

		return generateDiceDensityMatrix(this.imgData_cropped_resized_filtered, this.availableDiceSidesCount);
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

		// Goes last in order to trigger the chain only once
		await this.importImageStr(data.imgString_original);
	}

	async importImageStr(imageStr: string | null): Promise<void> {
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
}
