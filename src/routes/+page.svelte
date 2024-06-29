<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import FileUpload from '$lib/components/file-upload.svelte';
	import CropperMy from '$lib/components/cropper-my.svelte';
	import MosaicControls from '$lib/components/mosaic-controls.svelte';
	import ColorTweaks from '$lib/components/color-tweaks.svelte';
	import PlanningControls from '$lib/components/planning-controls.svelte';
	import DesignControls from '$lib/components/design-controls.svelte';
	import DiceMosaic from '$lib/components/dice-mosaic.svelte';
</script>

<div
	class="
   w-full

   lg:w-[28%]
 "
>
	<Accordion.Root multiple value={['image']}>
		<Accordion.Item value="image">
			<Accordion.Trigger>Source Image</Accordion.Trigger>

			<Accordion.Content>
				<div class="space-y-4">
					<FileUpload />
					<CropperMy />
				</div>
			</Accordion.Content>
		</Accordion.Item>

		<Accordion.Item value="mosaic">
			<Accordion.Trigger>Mosaic</Accordion.Trigger>

			<Accordion.Content>
				<MosaicControls />
			</Accordion.Content>
		</Accordion.Item>

		<Accordion.Item value="color">
			<Accordion.Trigger>Color Tweaks</Accordion.Trigger>

			<Accordion.Content>
				<ColorTweaks />
			</Accordion.Content>
		</Accordion.Item>

		<Accordion.Item value="planning">
			<Accordion.Trigger>Planning</Accordion.Trigger>

			<Accordion.Content>
				<PlanningControls />
			</Accordion.Content>
		</Accordion.Item>

		<Accordion.Item value="design">
			<Accordion.Trigger>Design</Accordion.Trigger>

			<Accordion.Content>
				<DesignControls />
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</div>

<div
	class="
   relative min-h-96

   lg:sticky lg:top-4 lg:w-[70%]
 "
>
	<DiceMosaic />
</div>
