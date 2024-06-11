<script lang="ts">
	import getCroppedImg, {
		DiceSidesCount,
		applyFilters,
		cloneImageData,
		createImage,
		readFileAsDataUrl,
		withOffscreenCanvas
	} from '$lib/canvasUtils';
	import Cropper from 'svelte-easy-crop';

	// ToDo: Import from svelte-easy-crop somehow
	interface CropArea {
		x: number;
		y: number;
		width: number;
		height: number;
	}

	enum DiceColor {
		White,
		Black,
		Both
	}

	const authorizedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
	let canvas: HTMLCanvasElement | undefined; // popuplated from `bind:this`
	let imgString_original: string | null = $state(null);
	let imgElement_original: HTMLImageElement | null = $state(null);
	let cropArea: CropArea | null = $state(null);

	let imgData_cropped: ImageData | null = $derived(
		imgElement_original && cropArea ? getCroppedImg(imgElement_original, cropArea) : null
	);

	let lockOriginalImageAspectRatio: boolean = $state(true);

	let originalImageAspectRatio: number | null = $derived.by(() => {
		return imgElement_original ? imgElement_original.width / imgElement_original.height : null;
	});

	let diceCountHorizontal: number = $state(100);
	let diceCountVertical: number = $state(60);

	let diceCountVerticalEffective: number | null = $derived.by(() => {
		if (!lockOriginalImageAspectRatio) {
			return diceCountVertical;
		}

		if (originalImageAspectRatio === null) {
			return null;
		}

		return Math.round(diceCountHorizontal / originalImageAspectRatio);
	});

	let diceAspectRatio: number | undefined = $derived(
		diceCountVerticalEffective === null
			? undefined
			: diceCountHorizontal / diceCountVerticalEffective
	);
	let diceCountTotal: number | null = $derived(
		diceCountVerticalEffective === null ? null : diceCountHorizontal * diceCountVerticalEffective
	);

	let diceColor: DiceColor = $state(DiceColor.Both);

	let diceSidesCount: DiceSidesCount = $derived(
		diceColor === DiceColor.Both ? DiceSidesCount.Twelve : DiceSidesCount.Six
	);

	let brightness = $state(100);
	let contrast = $state(100);
	let gamma = $state(100);

	let imgData_cropped_resized: ImageData | null = $derived.by(() => {
		if (!imgData_cropped || !diceCountVerticalEffective) {
			return null;
		}

		const canvas = withOffscreenCanvas(imgData_cropped, (_ctx, canvas) => canvas);

		return withOffscreenCanvas(
			{ width: diceCountHorizontal, height: diceCountVerticalEffective },
			(ctx) => {
				ctx.drawImage(canvas, 0, 0, diceCountHorizontal, diceCountVerticalEffective);
				return ctx.getImageData(0, 0, diceCountHorizontal, diceCountVerticalEffective);
			}
		);
	});

	let imgData_cropped_resized_filtered: ImageData | null = $derived.by(() => {
		if (!imgData_cropped_resized) {
			return null;
		}

		return applyFilters(imgData_cropped_resized, { brightness, contrast, gamma, diceSidesCount });
	});

	$effect(() => {
		const imgData = imgData_cropped_resized_filtered;

		if (canvas && imgData) {
			canvas.width = imgData.width;
			canvas.height = imgData.height;

			const ctx = canvas.getContext('2d');

			if (!ctx) {
				throw new Error('Expected `ctx` to exist at this point.');
			}

			ctx.putImageData(imgData, 0, 0);
		}
	});


	async function persistUploadedImage(
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	) {
		const imgString = await readFileAsDataUrl(event.currentTarget?.files);
		imgElement_original = await createImage(imgString);
		cropArea = { x: 0, y: 0, width: imgElement_original.width, height: imgElement_original.height };
		imgString_original = imgString; // should populate after image is loaded inside `createImage`, in order to avoid a race condition
	}

	function persistCropArea(
		e: CustomEvent<{
			/* percent: CropArea; */
			pixels: CropArea;
		}>
	) {
		cropArea = e.detail.pixels;
	}
</script>

<p>
	<label for="file">
		<input
			type="file"
			id="file"
			name="fileToUpload"
			accept={authorizedExtensions.join(',')}
			required
			onchange={persistUploadedImage}
		/>

		<span>Upload your file</span>
	</label>
</p>

<div>
	<span>Original image aspect ratio:</span>
	<span>{originalImageAspectRatio ? Math.round(originalImageAspectRatio * 100) / 100 : null}</span>
	<label>
		<input type="checkbox" bind:checked={lockOriginalImageAspectRatio} />
		Lock
	</label>
</div>

<div>
	<label>
		<span>Dice count horizontal</span>
		<input type="number" min="1" bind:value={diceCountHorizontal} />
		<input type="range" min="1" max="200" bind:value={diceCountHorizontal} />
	</label>
</div>

<div>
	<label>
		<span>Dice count vertical</span>
		<input
			type="number"
			min="1"
			value={diceCountVerticalEffective}
			disabled={lockOriginalImageAspectRatio}
			oninput={(e) => diceCountVertical = parseInt((e.target as HTMLInputElement).value, 10)}
		/>
		<input
			type="range"
			min="1"
			max="200"
			value={diceCountVerticalEffective}
			disabled={lockOriginalImageAspectRatio}
			oninput={(e) => diceCountVertical = parseInt((e.target as HTMLInputElement).value, 10)}
		/>
	</label>
</div>

<div>
	<label>
		<span>Dice color</span>
		<input type="radio" name="dice color" value={DiceColor.White} bind:group={diceColor} />
		White
	</label>
	<label>
		<input type="radio" name="dice color" value={DiceColor.Black} bind:group={diceColor} />
		Black
	</label>
	<label>
		<input type="radio" name="dice color" value={DiceColor.Both} bind:group={diceColor} />
		Both
	</label>
</div>

<div>
	<span>Dice count total:</span>
	<span>{diceCountTotal}</span>
</div>

<div>
	<span>Dice aspect ratio:</span>
	<span>{diceAspectRatio === undefined ? null : Math.round(diceAspectRatio * 100) / 100}</span>
</div>

<div>
	<label>
		<span>Brightness</span>
		<input type="number" min="0" bind:value={brightness} />
		<input type="range" min="0" max="400" bind:value={brightness} />
	</label>
</div>

<div>
	<label>
		<span>Contrast</span>
		<input type="number" min="0" bind:value={contrast} />
		<input type="range" min="0" max="400" bind:value={contrast} />
	</label>
</div>

<div>
	<label>
		<span>Gamma</span>
		<input type="number" min="0" bind:value={gamma} />
		<input type="range" min="0" max="400" bind:value={gamma} />
	</label>
</div>

{#if imgString_original}
	<div style="position: relative; width: 100%; height: 300px;">
		<Cropper
			image={imgString_original}
			crop={{ x: 0, y: 0 }}
			aspect={diceAspectRatio}
			on:cropcomplete={persistCropArea}
		/>
	</div>
{/if}

<canvas
	bind:this={canvas}
	width={diceCountHorizontal}
	height={diceCountVerticalEffective}
	style="width: 500px; height: auto; image-rendering: pixelated;"
></canvas>
