<script lang="ts">
	import { readFileAsDataUrl } from '$lib/canvas-utils';
	import DiceTable from '$lib/components/dice-table.svelte';
	import DicerService, { DiceColor, type CropArea } from '$lib/dicer.svelte';
	import { getContext } from 'svelte';
	import Cropper from 'svelte-easy-crop';
	import assert from 'tiny-invariant';

	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Field from '$lib/components/ui/field.svelte';
	import * as RadioGroup from '$lib/components/ui/radio-group';

	const dicer = getContext<DicerService>('service:dicer');
	const authorizedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
	let canvas: HTMLCanvasElement | undefined; // popuplated from `bind:this`

	$effect(() => {
		const imgData = dicer.imgData_cropped_resized_filtered;

		if (canvas) {
			if (imgData) {
				canvas.width = imgData.width;
				canvas.height = imgData.height;

				const ctx = canvas.getContext('2d');
				assert(ctx, 'Expected `ctx` to exist at this point.');
				ctx.putImageData(imgData, 0, 0);
			} else {
				canvas.width = 100;
				canvas.height = 0;
			}
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

<main
	class="
   block p-4

   lg:flex lg:space-x-8
 "
>
	<div
		class="
    w-full

    lg:w-1/4
  "
	>
		<Accordion.Root multiple value={['image', 'mosaic', 'color', 'planning']}>
			<Accordion.Item value="image">
				<Accordion.Trigger>Source Image</Accordion.Trigger>

				<Accordion.Content>
					<Field>
						<Label for="file">Upload your file</Label>

						<Input
							type="file"
							name="file"
							accept={authorizedExtensions.join(',')}
							required
							onchange={persistUploadedImage}
						/>
					</Field>

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
				</Accordion.Content>
			</Accordion.Item>

			<Accordion.Item value="mosaic">
				<Accordion.Trigger>Mosaic</Accordion.Trigger>

				<Accordion.Content>
					<div class="space-y-4">
						<Field>
							<Label for="diceCountHorizontal">Dice count horizontal</Label>

							<div class="flex gap-6">
								<Input
									class="w-20"
									id="diceCountHorizontal"
									type="number"
									min="1"
									bind:value={dicer.diceCountHorizontal}
								/>

								<Input type="range" min="1" max="200" bind:value={dicer.diceCountHorizontal} />
							</div>
						</Field>

						<Field>
							<Label for="diceCountVertical">Dice count vertical</Label>

							<div class="flex gap-6">
								<Input
									class="w-20"
									id="diceCountVertical"
									type="number"
									min="1"
									value={dicer.diceCountVerticalEffective}
									disabled={dicer.lockAspectRatioOriginal}
									oninput={(e) => dicer.diceCountVertical = parseInt((e.target as HTMLInputElement).value, 10)}
								/>

								<Input
									type="range"
									min="1"
									max="200"
									value={dicer.diceCountVerticalEffective}
									disabled={dicer.lockAspectRatioOriginal}
									oninput={(e) => dicer.diceCountVertical = parseInt((e.target as HTMLInputElement).value, 10)}
								/>
							</div>
						</Field>

						<Field>
							<Label>Aspect Ratio</Label>

							<p>
								{dicer.aspectRatioDice === undefined ? null : Math.round(dicer.aspectRatioDice * 100) / 100}
								({dicer.diceCountTotal} dice)
							</p>

							<p class="flex items-center space-x-2">
								<Checkbox
									id="lockAspectRatioOriginal"
									bind:checked={dicer.lockAspectRatioOriginal}
									aria-labelledby="lockAspectRatioOriginal-label"
								/>

								<Label id="lockAspectRatioOriginal-label" for="lockAspectRatioOriginal">
									Use aspect ratio from source image
								</Label>
							</p>
						</Field>

						<Field>
							<Label>Dice Color</Label>

							<RadioGroup.Root class="flex space-x-4" bind:value={dicer.diceColor}>
								<span class="inline-flex items-center space-x-2">
									<RadioGroup.Item value={DiceColor.White} id="DiceColorWhite" />

									<Label for="DiceColorWhite">White</Label>
								</span>

								<span class="inline-flex items-center space-x-2">
									<RadioGroup.Item value={DiceColor.Black} id="DiceColorBlack" />

									<Label for="DiceColorBlack">Black</Label>
								</span>

								<span class="flex items-center space-x-2">
									<RadioGroup.Item value={DiceColor.Both} id="DiceColorBoth" />

									<Label for="DiceColorBoth">Both</Label>
								</span>
							</RadioGroup.Root>
						</Field>
					</div>
				</Accordion.Content>
			</Accordion.Item>

			<Accordion.Item value="color">
				<Accordion.Trigger>Color Tweaks</Accordion.Trigger>

				<Accordion.Content>
					<div class="space-y-4">
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
							bind:this={canvas}
							width={dicer.diceCountHorizontal}
							height={dicer.diceCountVerticalEffective}
							class="
								w-full

								[image-rendering:pixelated]
							"
						></canvas>
					</div>
				</Accordion.Content>
			</Accordion.Item>

			<Accordion.Item value="planning">
				<Accordion.Trigger>Planning</Accordion.Trigger>

				<Accordion.Content>
					<div class="space-y-4">
						<div class="flex space-x-4">
							<Field>
								<Label for="dieSize">Die size</Label>

								<Input class="w-20" type="number" id="dieize" min="1" bind:value={dicer.dieSize} />
							</Field>

							<Field>
								<Label for="glueSize">Glue thickness</Label>

								<Input class="w-20" type="number" id="glueSize" min="0" step="0.05" bind:value={dicer.glueSize} />
							</Field>
						</div>

						<div class="flex space-x-4">
							<Field>
								<Label>Mosaic width</Label>

								<p>
									{dicer.totalWidth} mm
								</p>
							</Field>

							<Field>
								<Label>Mosaic height</Label>

								<p>
									{dicer.totalHeight} mm
								</p>
							</Field>
						</div>

						<div class="flex space-x-4">
							<Field>
								<Label>White dice</Label>

								<p>
									{dicer.diceCountWhite}
								</p>
							</Field>

							<Field>
								<Label>Black dice</Label>

								<p>
									{dicer.diceCountBlack}
								</p>
							</Field>
						</div>

						<Field>
							<Label for="dieSize">Dice Price</Label>

							<div class="flex items-center space-x-2">
								<Input class="w-20" type="number" id="diePricePerBatch" min="1" bind:value={dicer.dicePricePerBatch} />
								<label for="diePricePerBatch">₽</label>
								<span>per</span>
								<Input class="w-20" type="number" id="dieBatchSize" min="1" bind:value={dicer.diceBatchSize} />
								<label for="diePricePerBatch">dice</label>
							</div>
						</Field>

						{#if dicer.totalPriceRoundedUpToBatch}
							<Field>
								<Label>Total Mosaic Price</Label>

								<p>
									{dicer.totalPriceRoundedUpToBatch} ₽ for {dicer.diceCountWhiteRoundedUpToBatch} white and {dicer.diceCountBlackRoundedUpToBatch}
									black dice
								</p>
							</Field>
						{/if}
					</div>
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</div>

	{#if dicer.diceDensityMatrix}
		<DiceTable diceDensityMatrix={dicer.diceDensityMatrix} diceColor={dicer.diceColor} />
	{/if}
</main>
