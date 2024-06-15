<script lang="ts">
	import getCroppedImg, {
		DiceSidesCount,
		applyFilters,
		cloneImageData,
		createImage,
		readFileAsDataUrl,
		withOffscreenCanvas
	} from '$lib/canvasUtils';
	import { useLocalStorageRune, type Valuable } from '$lib/runes.svelte';
	import Cropper from 'svelte-easy-crop';

	const LS_PREFIX = 'slice-and-dice__';

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
	const imgString_original: Valuable<string | null> = useLocalStorageRune(
		`${LS_PREFIX}imgStringOriginal`,
		null
	);
	let imgElement_original: HTMLImageElement | null = $state(null);
	const cropArea: Valuable<CropArea | null> = useLocalStorageRune(`${LS_PREFIX}cropArea`, null);

	// Restoring image from local storage
	// @ts-ignore Intentionally using async here: all state values are touched above await.
	$effect(async () => {
		if (imgString_original.value && !imgElement_original) {
			imgElement_original = await createImage(imgString_original.value);
		}
	});

	let imgData_cropped: ImageData | null = $derived(
		imgElement_original && cropArea.value
			? getCroppedImg(imgElement_original, cropArea.value)
			: null
	);

	const lockOriginalImageAspectRatio: Valuable<boolean> = useLocalStorageRune(
		`${LS_PREFIX}lockOriginalImageAspectRatio`,
		true
	);

	let originalImageAspectRatio: number | null = $derived.by(() => {
		return imgElement_original ? imgElement_original.width / imgElement_original.height : null;
	});

	const diceCountHorizontal: Valuable<number> = useLocalStorageRune(
		`${LS_PREFIX}diceCountHorizontal`,
		100
	);
	const diceCountVertical: Valuable<number> = useLocalStorageRune(
		`${LS_PREFIX}diceCountVertical`,
		60
	);

	let diceCountVerticalEffective: number | null = $derived.by(() => {
		if (!lockOriginalImageAspectRatio.value) {
			return diceCountVertical.value;
		}

		if (originalImageAspectRatio === null) {
			return null;
		}

		return Math.round(diceCountHorizontal.value / originalImageAspectRatio);
	});

	let diceAspectRatio: number | undefined = $derived(
		diceCountVerticalEffective === null
			? undefined
			: diceCountHorizontal.value / diceCountVerticalEffective
	);
	let diceCountTotal: number | null = $derived(
		diceCountVerticalEffective === null
			? null
			: diceCountHorizontal.value * diceCountVerticalEffective
	);

	const diceColor: Valuable<DiceColor> = useLocalStorageRune(
		`${LS_PREFIX}diceColor`,
		DiceColor.Both
	);

	let diceSidesCount: DiceSidesCount = $derived(
		diceColor.value === DiceColor.Both ? DiceSidesCount.Twelve : DiceSidesCount.Six
	);

	const brightness: Valuable<number> = useLocalStorageRune(`${LS_PREFIX}brightness`, 100);
	const contrast: Valuable<number> = useLocalStorageRune(`${LS_PREFIX}contrast`, 100);
	const gamma: Valuable<number> = useLocalStorageRune(`${LS_PREFIX}gamma`, 100);

	let imgData_cropped_resized: ImageData | null = $derived.by(() => {
		if (!imgData_cropped || !diceCountVerticalEffective) {
			return null;
		}

		const canvas = withOffscreenCanvas(imgData_cropped, (_ctx, canvas) => canvas);

		return withOffscreenCanvas(
			{ width: diceCountHorizontal.value, height: diceCountVerticalEffective },
			(ctx) => {
				ctx.drawImage(canvas, 0, 0, diceCountHorizontal.value, diceCountVerticalEffective);
				return ctx.getImageData(0, 0, diceCountHorizontal.value, diceCountVerticalEffective);
			}
		);
	});

	let imgData_cropped_resized_filtered: ImageData | null = $derived.by(() => {
		if (!imgData_cropped_resized) {
			return null;
		}

		return applyFilters(imgData_cropped_resized, {
			brightness: brightness.value,
			contrast: contrast.value,
			gamma: gamma.value,
			diceSidesCount
		});
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

	const persistUploadedImage = async (
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		const imgString = await readFileAsDataUrl(event.currentTarget?.files);
		imgElement_original = await createImage(imgString);
		cropArea.value = {
			x: 0,
			y: 0,
			width: imgElement_original.width,
			height: imgElement_original.height
		};
		imgString_original.value = imgString; // should populate after image is loaded inside `createImage`, in order to avoid a race condition
	};

	function persistCropArea(
		e: CustomEvent<{
			/* percent: CropArea; */
			pixels: CropArea;
		}>
	) {
		cropArea.value = e.detail.pixels;
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
		<input type="checkbox" bind:checked={lockOriginalImageAspectRatio.value} />
		Lock
	</label>
</div>

<div>
	<label>
		<span>Dice count horizontal</span>
		<input type="number" min="1" bind:value={diceCountHorizontal.value} />
		<input type="range" min="1" max="200" bind:value={diceCountHorizontal.value} />
	</label>
</div>

<div>
	<label>
		<span>Dice count vertical</span>
		<input
			type="number"
			min="1"
			value={diceCountVerticalEffective}
			disabled={lockOriginalImageAspectRatio.value}
			oninput={(e) => diceCountVertical.value = parseInt((e.target as HTMLInputElement).value, 10)}
		/>
		<input
			type="range"
			min="1"
			max="200"
			value={diceCountVerticalEffective}
			disabled={lockOriginalImageAspectRatio.value}
			oninput={(e) => diceCountVertical.value = parseInt((e.target as HTMLInputElement).value, 10)}
		/>
	</label>
</div>

<div>
	<label>
		<span>Dice color</span>
		<input type="radio" name="dice color" value={DiceColor.White} bind:group={diceColor.value} />
		White
	</label>
	<label>
		<input type="radio" name="dice color" value={DiceColor.Black} bind:group={diceColor.value} />
		Black
	</label>
	<label>
		<input type="radio" name="dice color" value={DiceColor.Both} bind:group={diceColor.value} />
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
		<input type="number" min="0" bind:value={brightness.value} />
		<input type="range" min="0" max="200" bind:value={brightness.value} />
	</label>
</div>

<div>
	<label>
		<span>Contrast</span>
		<input type="number" min="0" bind:value={contrast.value} />
		<input type="range" min="0" max="200" bind:value={contrast.value} />
	</label>
</div>

<div>
	<label>
		<span>Gamma</span>
		<input type="number" min="0" bind:value={gamma.value} />
		<input type="range" min="0" max="200" bind:value={gamma.value} />
	</label>
</div>

{#if imgString_original.value}
	<div style="position: relative; width: 100%; height: 300px;">
		<Cropper
			image={imgString_original.value}
			crop={{ x: 0, y: 0 }}
			aspect={diceAspectRatio}
			on:cropcomplete={persistCropArea}
		/>
	</div>
{/if}

<canvas
	bind:this={canvas}
	width={diceCountHorizontal.value}
	height={diceCountVerticalEffective}
	style="width: 500px; height: auto; image-rendering: pixelated;"
></canvas>
