import { z } from 'zod';
import type { DiceSidesCount, Die } from './dicer.svelte';

// https://codesandbox.io/p/sandbox/svelte-easy-crop-with-file-upload-and-live-preview-36xsr?file=%2FcanvasUtils.js
export const createImage = (url: string): Promise<HTMLImageElement> => {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.addEventListener('load', () => resolve(image));
		image.addEventListener('error', (error) => reject(error));
		image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
		image.src = url;
	});
};

export const readFileAsDataUrl = (files: FileList | null): Promise<string> => {
	return new Promise((resolve, reject) => {
		const file = files?.[0];

		if (!file) {
			reject(new Error('Expected a file'));
			return;
		}

		const reader = new FileReader();

		reader.onload = (eventOfReader) => {
			if (!eventOfReader.target?.result) {
				throw new Error('Expected `eventOfReader.target?.result` to exist at this point.');
			}

			if (eventOfReader.target?.result instanceof ArrayBuffer) {
				throw new Error('Expected `eventOfReader.target?.result` to be a string, was ArrayBuffer.');
			}

			resolve(eventOfReader.target?.result);
		};

		reader.readAsDataURL(file);
	});
};

export const withOffscreenCanvas = <T>(
	data: HTMLImageElement | ImageData | { width: number; height: number },
	callback: (ctx: OffscreenCanvasRenderingContext2D, canvas: OffscreenCanvas) => T
): T => {
	const canvas = new OffscreenCanvas(data.width, data.height);

	const ctx = canvas.getContext('2d');

	if (!ctx) {
		throw new Error('Expected `ctx` to be available at this point.');
	}

	if (data instanceof ImageData) {
		ctx.putImageData(data, 0, 0);
	} else if (data instanceof HTMLImageElement) {
		ctx.drawImage(data, 0, 0, data.width, data.height);
	}

	return callback(ctx, canvas);
};

export const cloneImageData = (imgData: ImageData): ImageData => {
	const newImgDataData = new Uint8ClampedArray(imgData.data);
	return new ImageData(newImgDataData, imgData.width, imgData.height, {
		colorSpace: imgData.colorSpace,
	});
};

export const applyFilters = (
	imgData: ImageData,
	{
		brightness,
		contrast,
		gamma,
		diceSidesCount,
	}: { brightness: number; contrast: number; gamma: number; diceSidesCount: DiceSidesCount }
): ImageData => {
	const newImgData = cloneImageData(imgData);
	const { data } = newImgData;
	const contrastFactor = (259 * (contrast - 100 + 255)) / (255 * (259 - (contrast - 100)));
	const brightnessFactor = brightness / 100;
	const gammaCorrection = 1 / (gamma / 100);
	const normalize = (value: number) => Math.max(0, Math.min(255, value));

	for (let i = 0; i < data.length; i += 4) {
		// Apply contrast
		data[i] = normalize(contrastFactor * (data[i] - 128) + 128);
		data[i + 1] = normalize(contrastFactor * (data[i + 1] - 128) + 128);
		data[i + 2] = normalize(contrastFactor * (data[i + 2] - 128) + 128);

		// Apply brightness
		data[i] = normalize(data[i] * brightnessFactor);
		data[i + 1] = normalize(data[i + 1] * brightnessFactor);
		data[i + 2] = normalize(data[i + 2] * brightnessFactor);

		// Apply gamma correction
		data[i] = normalize(255 * Math.pow(data[i] / 255, gammaCorrection));
		data[i + 1] = normalize(255 * Math.pow(data[i + 1] / 255, gammaCorrection));
		data[i + 2] = normalize(255 * Math.pow(data[i + 2] / 255, gammaCorrection));

		// Convert to grayscale
		data[i] = data[i + 1] = data[i + 2] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

		// Reduce color palette
		data[i] =
			data[i + 1] =
			data[i + 2] =
				normalize(
					// https://stackoverflow.com/a/17717174/901944
					Math.round((Math.round((data[i] / 255) * diceSidesCount) * 255) / diceSidesCount)
				);
	}

	return newImgData;
};

export const drawCircle = (
	ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
	x: number,
	y: number,
	radius: number,
	fill?: string,
	stroke?: string,
	strokeWidth: number = 0
): void => {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI, false);

	if (fill) {
		ctx.fillStyle = fill;
		ctx.fill();
	}

	if (stroke) {
		ctx.lineWidth = strokeWidth;
		ctx.strokeStyle = stroke;
		ctx.stroke();
	}
};

export const DiceMatrixSchema = z
	.array(z.array(z.object({})))
	.refine((value) => value.every((row) => row.length === value[0].length), {
		message: 'Expected all rows to have the same length.',
	});

/* 

	Diagram structure for both vertical and horizontal axis:

  * outerPadding
  * labelWidth / labelHeight
	* die
	* innerPadding
	* die
	* innerPadding
	* die
	* outerPadding

*/

export const generateMosaicPure = async ({
	diceMatrix,
	diceImageStrings,
	outerPadding = 50,
	labelWidth = 100,
	labelHeight = 50,
	dieSize = 100,
	innerPadding = 0,
}: {
	diceMatrix: Die[][];
	diceImageStrings: {
		White: { [key: number]: string };
		Black: { [key: number]: string };
	};
	outerPadding?: number;
	labelWidth?: number;
	labelHeight?: number;
	dieSize?: number;
	innerPadding?: number;
}): Promise<string> => {
	const base64StringToImageData = async (base64: string): Promise<ImageData> => {
		const response = await fetch(base64);
		const blob = await response.blob();
		const imageBitmap = await createImageBitmap(blob);
		const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			throw new Error('Expected `ctx` to be available at this point.');
		}

		ctx.drawImage(imageBitmap, 0, 0);
		return ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
	};

	const diceImageDatas: {
		White: { [key: number]: ImageData };
		Black: { [key: number]: ImageData };
	} = {
		White: {
			[1]: await base64StringToImageData(diceImageStrings.White[1]),
			[2]: await base64StringToImageData(diceImageStrings.White[2]),
			[3]: await base64StringToImageData(diceImageStrings.White[3]),
			[4]: await base64StringToImageData(diceImageStrings.White[4]),
			[5]: await base64StringToImageData(diceImageStrings.White[5]),
			[6]: await base64StringToImageData(diceImageStrings.White[6]),
		} as const,
		Black: {
			[1]: await base64StringToImageData(diceImageStrings.Black[1]),
			[2]: await base64StringToImageData(diceImageStrings.Black[2]),
			[3]: await base64StringToImageData(diceImageStrings.Black[3]),
			[4]: await base64StringToImageData(diceImageStrings.Black[4]),
			[5]: await base64StringToImageData(diceImageStrings.Black[5]),
			[6]: await base64StringToImageData(diceImageStrings.Black[6]),
		} as const,
	} as const;

	const diceCountHorizontal = diceMatrix[0].length;
	const diceCountVertical = diceMatrix.length;
	const canvasWidth = outerPadding * 2 + labelWidth + (dieSize + innerPadding) * diceCountHorizontal - innerPadding;
	const canvasHeight = outerPadding * 2 + labelHeight + (dieSize + innerPadding) * diceCountVertical - innerPadding;
	const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		throw new Error('Expected `ctx` to be available at this point.');
	}

	console.log('* doing web worker for width', diceMatrix[0].length);

	// Background
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	// Draw horizontal axis labels
	ctx.textAlign = 'center';
	ctx.fillStyle = 'black';
	ctx.font = '48px sans-serif';
	diceMatrix[0].forEach((_die, x: number) => {
		const left = outerPadding + labelWidth + x * (dieSize + innerPadding) + dieSize / 2;
		const top = outerPadding + labelHeight / 2;

		ctx.fillText(`${x + 1}`, left, top);
	});

	// Draw vertical axis labels
	ctx.textAlign = 'center';
	ctx.fillStyle = 'black';
	ctx.textBaseline = 'middle';
	ctx.font = '48px sans-serif';
	diceMatrix.forEach((_die, y: number) => {
		const top = outerPadding + labelHeight + y * (dieSize + innerPadding) + dieSize / 2;
		const left = outerPadding + labelWidth / 2;

		ctx.fillText(`${y + 1}`, left, top);
	});

	// Draw dice
	diceMatrix.forEach((row: Die[], y: number) => {
		row.forEach((die: Die, x: number) => {
			const left = outerPadding + labelWidth + x * (dieSize + innerPadding);
			const top = outerPadding + labelHeight + y * (dieSize + innerPadding);
			const imageData = diceImageDatas[die.dieColor][die.dieValue];

			ctx.putImageData(imageData, left, top);
		});
	});

	const blob = await canvas.convertToBlob();

	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			if (typeof reader.result !== 'string') {
				throw new Error('Expected `reader.result` to be a string at this point.');
			}

			console.log('^ about to finish web worker for width', diceMatrix[0].length);

			resolve(reader.result);
		};

		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
};

const getCroppedImg = (
	image: HTMLImageElement,
	pixelCrop: { x: number; y: number; width: number; height: number }
): ImageData => {
	if (!image.complete) {
		throw new Error('This is a sync function. It expects the image to be fully loaded.');
	}

	return withOffscreenCanvas(image, (ctx) => {
		// croppedAreaPixels values are bounding box relative
		// extract the cropped image using these values
		return ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);
	});
};

export default getCroppedImg;
