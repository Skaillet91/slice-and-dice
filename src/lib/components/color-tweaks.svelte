<script lang="ts">
	import type DicerService from '$lib/dicer.svelte';
	import { getContext } from 'svelte';
	import Field from './ui/field.svelte';
	import Label from './ui/label/label.svelte';
	import Input from './ui/input/input.svelte';
	import assert from 'tiny-invariant';

	// Services
	const dicer = getContext<DicerService>('service:dicer');

	// State
	let { ...restProps } = $props();
	let canvas_colorPreview: HTMLCanvasElement | undefined = $state(); //5 popuplated from `bind:this`

	// Observables
	// Color Correction Preview
	$effect(() => {
		const imgData = dicer.imgData_cropped_resized_filtered;

		if (canvas_colorPreview) {
			if (imgData) {
				canvas_colorPreview.width = imgData.width;
				canvas_colorPreview.height = imgData.height;

				const ctx = canvas_colorPreview.getContext('2d');
				assert(ctx, 'Expected `ctx` to exist at this point.');
				ctx.putImageData(imgData, 0, 0);
			} else {
				canvas_colorPreview.width = 100;
				canvas_colorPreview.height = 0;
			}
		}
	});
</script>

<div class="space-y-4" {...restProps}>
	<Field>
		<Label for="Brightness">Brightness</Label>

		<div class="flex gap-6">
			<Input class="w-20" type="number" id="Brightness" min="0" bind:value={dicer.brightness} />

			<Input type="range" min="0" max="200" bind:value={dicer.brightness} />
		</div>
	</Field>

	<Field>
		<Label for="Contrast">Contrast</Label>

		<div class="flex gap-6">
			<Input class="w-20" type="number" id="Contrast" min="0" bind:value={dicer.contrast} />

			<Input type="range" min="0" max="200" bind:value={dicer.contrast} />
		</div>
	</Field>

	<Field>
		<Label for="Gamma">Gamma</Label>

		<div class="flex gap-6">
			<Input class="w-20" type="number" id="Gamma" min="0" bind:value={dicer.gamma} />

			<Input type="range" min="0" max="200" bind:value={dicer.gamma} />
		</div>
	</Field>

	<canvas
		bind:this={canvas_colorPreview}
		width={dicer.diceCountHorizontal}
		height={dicer.diceCountVerticalEffective}
		class="
    w-full

    [image-rendering:pixelated]
  "
	></canvas>
</div>
