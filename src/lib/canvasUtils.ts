// https://codesandbox.io/p/sandbox/svelte-easy-crop-with-file-upload-and-live-preview-36xsr?file=%2FcanvasUtils.js

export enum DiceSidesCount {
	Six = 6,
	Twelve = 12
}

export const createImage = (url: string): Promise<HTMLImageElement> => {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.addEventListener('load', () => resolve(image));
		image.addEventListener('error', (error) => reject(error));
		image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
		image.src = url;
	});
};

export function readFileAsDataUrl(files: FileList | null): Promise<string> {
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
}

export function withOffscreenCanvas<T>(
	data: HTMLImageElement | ImageData | { width: number; height: number },
	callback: (ctx: OffscreenCanvasRenderingContext2D, canvas: OffscreenCanvas) => T
): T {
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
}

export function cloneImageData(imgData: ImageData): ImageData {
	const newImgDataData = new Uint8ClampedArray(imgData.data);
	return new ImageData(newImgDataData, imgData.width, imgData.height, {
		colorSpace: imgData.colorSpace
	});
}

export function applyFilters(
	imgData: ImageData,
	{
		brightness,
		contrast,
		gamma,
		diceSidesCount
	}: { brightness: number; contrast: number; gamma: number; diceSidesCount: DiceSidesCount }
): ImageData {
	const newImgData = cloneImageData(imgData);
	const { data } = newImgData;

	console.log('contrast', contrast);

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
		data[i] =
			data[i + 1] =
			data[i + 2] =
				0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

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
}

export function generateArrayOfArraysOfDiceSideValues(
	imgData: ImageData,
	diceSidesCount: DiceSidesCount
): number[][] {
	const { width, height, data } = imgData;
	const matrix = [];

	for (let y = 0; y < height; y++) {
		const row = [];
		for (let x = 0; x < width; x++) {
			const index = (y * width + x) * 4; // Calculate the index for the red component (the image should be grey, so all color components should be the same)
			const redValue = data[index]; // Get the red component
			const diceSideValueRaw = Math.round(redValue / diceSidesCount); // Calculate the dice side value
			const diceSideValue = Math.max(1, Math.min(diceSideValueRaw, 12)); // Ensure the value is within [1, 12]
			row.push(diceSideValue);
		}
		matrix.push(row);
	}

	return matrix;
}

export default function getCroppedImg(
	image: HTMLImageElement,
	pixelCrop: { x: number; y: number; width: number; height: number }
): ImageData /* Promise<string | null> */ {
	if (!image.complete) {
		throw new Error('This is a sync function. It expects the image to be fully loaded.');
	}

	return withOffscreenCanvas(image, (ctx) => {
		// croppedAreaPixels values are bounding box relative
		// extract the cropped image using these values
		return ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);
	});
}
