<script lang="ts">
	import { readFileAsDataUrl } from '$lib/canvas-utils';
	import DiceTable from '$lib/components/dice-table.svelte';
	import DicerService, { DiceColor, DiceSidesCount, type CropArea } from '$lib/dicer.svelte';
	import { useLocalStorageRune, type Valuable } from '$lib/runes.svelte';
	import { css } from 'styled-system/css';
	import { getContext } from 'svelte';
	import Cropper from 'svelte-easy-crop';
	import assert from 'tiny-invariant';

	const dicer = getContext<DicerService>('service:dicer');
	const authorizedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
	let canvas: HTMLCanvasElement | undefined; // popuplated from `bind:this`

	$effect(() => {
		const imgData = dicer.imgData_cropped_resized_filtered;

		if (canvas && imgData) {
			canvas.width = imgData.width;
			canvas.height = imgData.height;

			const ctx = canvas.getContext('2d');
			assert(ctx, 'Expected `ctx` to exist at this point.');
			ctx.putImageData(imgData, 0, 0);
		}
	});

	const persistUploadedImage = async (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		const imgString = await readFileAsDataUrl(event.currentTarget?.files);
		await dicer.importImageStr(imgString);
	};

	const persistCropArea = (
		e: CustomEvent<{
			/* percent: CropArea; */
			pixels: CropArea;
		}>
	) => {
		dicer.cropArea = e.detail.pixels;
	};
</script>

<div
	class={css({
		display: 'flex'
	})}
>
	<div>
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
			<span>{dicer.aspectRatioOriginal ? Math.round(dicer.aspectRatioOriginal * 100) / 100 : null}</span>
			<label>
				<input type="checkbox" bind:checked={dicer.lockAspectRatioOriginal} />
				Lock
			</label>
		</div>

		<div>
			<label>
				<span>Dice count horizontal</span>
				<input type="number" min="1" bind:value={dicer.diceCountHorizontal} />
				<input type="range" min="1" max="200" bind:value={dicer.diceCountHorizontal} />
			</label>
		</div>

		<div>
			<label>
				<span>Dice count vertical</span>
				<input
					type="number"
					min="1"
					value={dicer.diceCountVerticalEffective}
					disabled={dicer.lockAspectRatioOriginal}
					oninput={(e) => dicer.diceCountVertical = parseInt((e.target as HTMLInputElement).value, 10)}
				/>
				<input
					type="range"
					min="1"
					max="200"
					value={dicer.diceCountVerticalEffective}
					disabled={dicer.lockAspectRatioOriginal}
					oninput={(e) => dicer.diceCountVertical = parseInt((e.target as HTMLInputElement).value, 10)}
				/>
			</label>
		</div>

		<div>
			<label>
				<span>Dice color</span>
				<input type="radio" name="dice color" value={DiceColor.White} bind:group={dicer.diceColor} />
				White
			</label>
			<label>
				<input type="radio" name="dice color" value={DiceColor.Black} bind:group={dicer.diceColor} />
				Black
			</label>
			<label>
				<input type="radio" name="dice color" value={DiceColor.Both} bind:group={dicer.diceColor} />
				Both
			</label>
		</div>

		<div>
			<span>Dice count total:</span>
			<span>{dicer.diceCountTotal}</span>
		</div>

		<div>
			<span>Dice aspect ratio:</span>
			<span>{dicer.aspectRatioDice === undefined ? null : Math.round(dicer.aspectRatioDice * 100) / 100}</span>
		</div>

		<div>
			<label>
				<span>Brightness</span>
				<input type="number" min="0" bind:value={dicer.brightness} />
				<input type="range" min="0" max="200" bind:value={dicer.brightness} />
			</label>
		</div>

		<div>
			<label>
				<span>Contrast</span>
				<input type="number" min="0" bind:value={dicer.contrast} />
				<input type="range" min="0" max="200" bind:value={dicer.contrast} />
			</label>
		</div>

		<div>
			<label>
				<span>Gamma</span>
				<input type="number" min="0" bind:value={dicer.gamma} />
				<input type="range" min="0" max="200" bind:value={dicer.gamma} />
			</label>
		</div>

		{#if dicer.imgString_original}
			<div style="position: relative; width: 100%; height: 300px;">
				<Cropper
					image={dicer.imgString_original}
					crop={{ x: 0, y: 0 }}
					aspect={dicer.aspectRatioDice}
					on:cropcomplete={persistCropArea}
				/>
			</div>
		{/if}
	</div>

	<canvas
		bind:this={canvas}
		width={dicer.diceCountHorizontal}
		height={dicer.diceCountVerticalEffective}
		style="width: 500px; height: auto; image-rendering: pixelated;"
	></canvas>
</div>

{#if dicer.diceDensityMatrix}
	<DiceTable diceDensityMatrix={dicer.diceDensityMatrix} diceColor={dicer.diceColor} />
{/if}
