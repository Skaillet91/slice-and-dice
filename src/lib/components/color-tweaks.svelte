<script lang="ts">
	import type DicerService from '$lib/dicer.svelte';
	import { getContext } from 'svelte';
	import Field from './ui/field.svelte';
	import Label from './ui/label/label.svelte';
	import Input from './ui/input/input.svelte';
	import assert from 'tiny-invariant';
	import Button from './ui/button/button.svelte';
	import { UndoIcon } from 'lucide-svelte';
	import Slider from './ui/slider/slider.svelte';

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

<div class="space-y-6" {...restProps}>
	<Field>
		<Label for="Brightness">Brightness</Label>

		<div class="flex gap-6">
			<Input class="w-20" type="number" id="Brightness" min="0" bind:value={dicer.brightness} />

			<Slider
				min={0}
				max={200}
				value={[dicer.brightness]}
				onValueChange={([newValue]) => (dicer.brightness = newValue)}
			/>

			<Button
				variant="outline"
				size="icon"
				disabled={dicer.brightness === dicer.defaults.brightness}
				onclick={() => {
					dicer.brightness = dicer.defaults.brightness;
				}}
				class="shrink-0"
			>
				<UndoIcon
					class="
       absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all

       dark:rotate-0 dark:scale-100
     "
				/>
			</Button>
		</div>
	</Field>

	<Field>
		<Label for="Contrast">Contrast</Label>

		<div class="flex gap-6">
			<Input class="w-20" type="number" id="Contrast" min="0" bind:value={dicer.contrast} />

			<Slider min={0} max={200} value={[dicer.contrast]} onValueChange={([newValue]) => (dicer.contrast = newValue)} />

			<Button
				variant="outline"
				size="icon"
				disabled={dicer.contrast === dicer.defaults.contrast}
				onclick={() => {
					dicer.contrast = dicer.defaults.contrast;
				}}
				class="shrink-0"
			>
				<UndoIcon
					class="
       absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all

       dark:rotate-0 dark:scale-100
     "
				/>
			</Button>
		</div>
	</Field>

	<Field>
		<Label for="Gamma">Gamma</Label>

		<div class="flex gap-6">
			<Input class="w-20" type="number" id="Gamma" min="0" bind:value={dicer.gamma} />

			<Slider min={0} max={200} value={[dicer.gamma]} onValueChange={([newValue]) => (dicer.gamma = newValue)} />

			<Button
				variant="outline"
				size="icon"
				disabled={dicer.gamma === dicer.defaults.gamma}
				onclick={() => {
					dicer.gamma = dicer.defaults.gamma;
				}}
				class="shrink-0"
			>
				<UndoIcon
					class="
       absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all

       dark:rotate-0 dark:scale-100
     "
				/>
			</Button>
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
