<script lang="ts">
	import type DicerService from '$lib/dicer.svelte';
	import { getContext } from 'svelte';
	import Cropper from 'svelte-easy-crop';
	import type { CropArea } from '$lib/dicer.svelte';
	import Field from './ui/field.svelte';
	import Label from './ui/label/label.svelte';
	import AspectRatio from './ui/aspect-ratio/aspect-ratio.svelte';

	// Services
	const dicer = getContext<DicerService>('service:dicer');

	// State
	let { ...restProps } = $props();

	// HTML event handlers
	const persistCropArea = (event: CustomEvent<{ pixels: CropArea }>) => {
		dicer.cropArea = event.detail.pixels;
	};
</script>

<Field {...restProps}>
	<Label for="dieSize">Crop the image</Label>

	{#if dicer.imgString_original}
		<AspectRatio ratio={1}>
			<Cropper
				image={dicer.imgString_original}
				crop={{ x: 0, y: 0 }}
				aspect={dicer.aspectRatioDice}
				on:cropcomplete={persistCropArea}
			/>
		</AspectRatio>
	{/if}
</Field>
