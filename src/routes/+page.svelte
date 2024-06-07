<script lang="ts">
	import getCroppedImg, { createImage, readFileAsDataUrl } from '$lib/canvasUtils';
	import Cropper from 'svelte-easy-crop';

	// ToDo: Import from svelte-easy-crop somehow
	interface CropArea {
		x: number;
		y: number;
		width: number;
		height: number;
	}

	const authorizedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
	const size = 600;
	let canvas: HTMLCanvasElement | undefined; // popuplated from `bind:this`
	let originalImageStr: string | null = $state(null);
	let imageCroppedStr: string | null = $state(null);

	let originalImageWidth = $state(0);
	let originalImageHeight = $state(0);
	let lockOriginalImageAspectRatio = $state(true);
	let originalImageAspectRatio = $derived(originalImageWidth / originalImageHeight);

	let diceCountHorizontal = $state(100);
	let diceCountVertical = $state(60);
	let diceCountVerticalEffective = $derived(
		lockOriginalImageAspectRatio
			? Math.round(diceCountHorizontal / originalImageAspectRatio)
			: diceCountVertical
	);
	let diceAspectRatio = $derived(diceCountHorizontal / diceCountVerticalEffective);

	// $effect(() => {
	//   const ctx = canvas.getContext('2d');

	// });

	async function imageUploaded(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		console.log(event);
		originalImageStr = await readFileAsDataUrl(event.currentTarget?.files);
		const imgElemnt = await createImage(originalImageStr);

		originalImageWidth = imgElemnt.width;
		originalImageHeight = imgElemnt.height;
	}

	async function cropImage(
		e: CustomEvent<{
			percent: CropArea;
			pixels: CropArea;
		}>
	) {
		if (!originalImageStr) {
			throw new Error('Expected imageStr to exist at this point');
		}

		imageCroppedStr = await getCroppedImg(originalImageStr, e.detail.pixels); 

		if (!imageCroppedStr) {
			throw new Error('Expected `imageCroppedStr` to exist at this point.');
		}

		if (!canvas) {
			throw new Error('Expected `canvas` to be initialized at this point.');
		}

		canvas.width = originalImageWidth;
		canvas.height = originalImageHeight;
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			throw new Error('Expected `ctx` to be initialized at this point.');
		}
		
		const croppedImgElement = await createImage(imageCroppedStr);

		ctx.drawImage(croppedImgElement, 0, 0);
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
			onchange={imageUploaded}
		/>

		<span>Upload your file</span>
	</label>
</p>

<div>
	<span>Original image aspect ratio:</span>
	<span>{originalImageAspectRatio}</span>
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
	<span>Dice aspect ratio</span>
	<span>{diceAspectRatio}</span>
</div>

{#if originalImageStr}
	<div style="position: relative; width: 100%; height: 300px;">
		<Cropper
			image={originalImageStr}
			crop={{ x: 0, y: 0 }}
			aspect={diceAspectRatio}
			on:cropcomplete={cropImage}
		/>
	</div>
{/if}

<canvas bind:this={canvas} width={size} height={size} style="width: 500px; height: auto"></canvas>
