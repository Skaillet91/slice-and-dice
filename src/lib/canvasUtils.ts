// https://codesandbox.io/p/sandbox/svelte-easy-crop-with-file-upload-and-live-preview-36xsr?file=%2FcanvasUtils.js

export const createImage = (url: string): Promise<HTMLImageElement> => {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.addEventListener('load', () => resolve(image));
		image.addEventListener('error', (error) => reject(error));
		image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
		image.src = url;
	});
}

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

export function getRadianAngle(degreeValue: number) {
	return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
	const rotRad = getRadianAngle(rotation);

	return {
		width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
		height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height)
	};
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export default async function getCroppedImg(
	imageSrc: string,
	pixelCrop: { x: number; y: number; width: number; height: number },
	rotation = 0,
	flip = { horizontal: false, vertical: false }
): Promise<string | null> {
	const image = await createImage(imageSrc);

	const rotRad = getRadianAngle(rotation);

	// calculate bounding box of the rotated image
	const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

	const canvas = new OffscreenCanvas(bBoxWidth, bBoxHeight);
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		throw new Error('Expected `ctx` to be available at this point.');
	}

	// translate canvas context to a central location to allow rotating and flipping around the center
	ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
	ctx.rotate(rotRad);
	ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
	ctx.translate(-image.width / 2, -image.height / 2);

	// draw rotated image
	ctx.drawImage(image, 0, 0);

	// croppedAreaPixels values are bounding box relative
	// extract the cropped image using these values
	const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

	// set canvas width to final desired crop size - this will clear existing context
	canvas.width = pixelCrop.width;
	canvas.height = pixelCrop.height;

	// paste generated rotate image at the top left corner
	ctx.putImageData(data, 0, 0);

	const blob = await canvas.convertToBlob();

	return URL.createObjectURL(blob);
}
