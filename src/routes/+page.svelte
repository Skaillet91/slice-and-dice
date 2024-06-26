<script lang="ts">
	import { readFileAsDataUrl } from '$lib/canvas-utils';
	import DicerService, { DesignTwo, DiceColorObj, type CropArea } from '$lib/dicer.svelte';
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

	let canvas_colorPreview: HTMLCanvasElement | undefined = $state(); // popuplated from `bind:this`
	let canvas_dieOneWhite: HTMLCanvasElement | undefined = $state(); // popuplated from `bind:this`
	let canvas_dieOneBlack: HTMLCanvasElement | undefined = $state(); // popuplated from `bind:this`
	let canvas_dieTwoWhite: HTMLCanvasElement | undefined = $state(); // popuplated from `bind:this`
	let canvas_dieTwoBlack: HTMLCanvasElement | undefined = $state(); // popuplated from `bind:this`
	let canvas_dieThreeWhite: HTMLCanvasElement | undefined = $state(); // popuplated from `bind:this`
	let canvas_dieThreeBlack: HTMLCanvasElement | undefined = $state(); // popuplated from `bind:this`
	let canvas_dieFourWhite: HTMLCanvasElement | undefined = $state(); // popuplated from `bind:this`
	let canvas_dieFourBlack: HTMLCanvasElement | undefined = $state(); // popuplated from `bind:this`
	let canvas_dieFiveWhite: HTMLCanvasElement | undefined = $state(); // popuplated from `bind:this`
	let canvas_dieFiveBlack: HTMLCanvasElement | undefined = $state(); // popuplated from `bind:this`
	let canvas_dieSixWhite: HTMLCanvasElement | undefined = $state(); // popuplated from `bind:this`
	let canvas_dieSixBlack: HTMLCanvasElement | undefined = $state(); // popuplated from `bind:this`
	let canvas_mosaic: HTMLCanvasElement | undefined = $state(); // popuplated from `bind:this`

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

	$effect(() => {
		if (canvas_dieOneWhite) {
			const ctx = canvas_dieOneWhite.getContext('2d');
			assert(ctx, 'Expected `ctx` to exist at this point.');
			ctx.putImageData(dicer.imgDataDieOneWhite, 0, 0);
		}
	});

	$effect(() => {
		if (canvas_dieOneBlack) {
			const ctx = canvas_dieOneBlack.getContext('2d');
			assert(ctx, 'Expected `ctx` to exist at this point.');
			ctx.putImageData(dicer.imgDataDieOneBlack, 0, 0);
		}
	});

	$effect(() => {
		if (canvas_dieTwoWhite) {
			const ctx = canvas_dieTwoWhite.getContext('2d');
			assert(ctx, 'Expected `ctx` to exist at this point.');
			ctx.putImageData(dicer.imgDataDieTwoWhite, 0, 0);
		}
	});

	$effect(() => {
		if (canvas_dieTwoBlack) {
			const ctx = canvas_dieTwoBlack.getContext('2d');
			assert(ctx, 'Expected `ctx` to exist at this point.');
			ctx.putImageData(dicer.imgDataDieTwoBlack, 0, 0);
		}
	});

	$effect(() => {
		if (canvas_dieThreeWhite) {
			const ctx = canvas_dieThreeWhite.getContext('2d');
			assert(ctx, 'Expected `ctx` to exist at this point.');
			ctx.putImageData(dicer.imgDataDieThreeWhite, 0, 0);
		}
	});

	$effect(() => {
		if (canvas_dieThreeBlack) {
			const ctx = canvas_dieThreeBlack.getContext('2d');
			assert(ctx, 'Expected `ctx` to exist at this point.');
			ctx.putImageData(dicer.imgDataDieThreeBlack, 0, 0);
		}
	});

	$effect(() => {
		if (canvas_dieFourWhite) {
			const ctx = canvas_dieFourWhite.getContext('2d');
			assert(ctx, 'Expected `ctx` to exist at this point.');
			ctx.putImageData(dicer.imgDataDieFourWhite, 0, 0);
		}
	});

	$effect(() => {
		if (canvas_dieFourBlack) {
			const ctx = canvas_dieFourBlack.getContext('2d');
			assert(ctx, 'Expected `ctx` to exist at this point.');
			ctx.putImageData(dicer.imgDataDieFourBlack, 0, 0);
		}
	});

	$effect(() => {
		if (canvas_dieFiveWhite) {
			const ctx = canvas_dieFiveWhite.getContext('2d');
			assert(ctx, 'Expected `ctx` to exist at this point.');
			ctx.putImageData(dicer.imgDataDieFiveWhite, 0, 0);
		}
	});

	$effect(() => {
		if (canvas_dieFiveBlack) {
			const ctx = canvas_dieFiveBlack.getContext('2d');
			assert(ctx, 'Expected `ctx` to exist at this point.');
			ctx.putImageData(dicer.imgDataDieFiveBlack, 0, 0);
		}
	});

	$effect(() => {
		if (canvas_dieSixWhite) {
			const ctx = canvas_dieSixWhite.getContext('2d');
			assert(ctx, 'Expected `ctx` to exist at this point.');
			ctx.putImageData(dicer.imgDataDieSixWhite, 0, 0);
		}
	});

	$effect(() => {
		if (canvas_dieSixBlack) {
			const ctx = canvas_dieSixBlack.getContext('2d');
			assert(ctx, 'Expected `ctx` to exist at this point.');
			ctx.putImageData(dicer.imgDataDieSixBlack, 0, 0);
		}
	});

	$effect(() => {
		if (canvas_mosaic) {
			const ctx = canvas_mosaic.getContext('2d');
			assert(ctx, 'Expected `ctx` to exist at this point.');

			if (dicer.imgDataMosaic) {
				canvas_mosaic.width = dicer.imgDataMosaic.width;
				canvas_mosaic.height = dicer.imgDataMosaic.height;

				ctx.putImageData(dicer.imgDataMosaic, 0, 0);
			} else {
				canvas_mosaic.width = 100;
				canvas_mosaic.height = 0;
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
   relative block items-start p-4

   lg:flex lg:justify-between
 "
>
	<div
		class="
    w-full

    lg:w-1/4
  "
	>
		<Accordion.Root multiple value={['image', 'design']}>
			<Accordion.Item value="image">
				<Accordion.Trigger>Source Image</Accordion.Trigger>

				<Accordion.Content>
					<Field>
						<Label for="file">Upload your file</Label>

						<Input type="file" name="file" accept={authorizedExtensions.join(',')} onchange={persistUploadedImage} />
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
									<RadioGroup.Item value={DiceColorObj.White} id="DiceColorWhite" />

									<Label for="DiceColorWhite">White</Label>
								</span>

								<span class="inline-flex items-center space-x-2">
									<RadioGroup.Item value={DiceColorObj.Black} id="DiceColorBlack" />

									<Label for="DiceColorBlack">Black</Label>
								</span>

								<span class="flex items-center space-x-2">
									<RadioGroup.Item value={DiceColorObj.Both} id="DiceColorBoth" />

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
							bind:this={canvas_colorPreview}
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

			<Accordion.Item value="design">
				<Accordion.Trigger>Design</Accordion.Trigger>

				<Accordion.Content>
					<div class="space-y-4">
						<p>This defines how the dice look in this app. It does not affect any calculations.</p>

						{#if dicer.diceColor !== DiceColorObj.Black}
							<div class="flex w-full justify-between">
								<canvas id="die1white" width="100" height="100" class="[width:14%]" bind:this={canvas_dieOneWhite}
								></canvas>
								<canvas id="die2white" width="100" height="100" class="[width:14%]" bind:this={canvas_dieTwoWhite}
								></canvas>
								<canvas id="die3white" width="100" height="100" class="[width:14%]" bind:this={canvas_dieThreeWhite}
								></canvas>
								<canvas id="die4white" width="100" height="100" class="[width:14%]" bind:this={canvas_dieFourWhite}
								></canvas>
								<canvas id="die5white" width="100" height="100" class="[width:14%]" bind:this={canvas_dieFiveWhite}
								></canvas>
								<canvas id="die6white" width="100" height="100" class="[width:14%]" bind:this={canvas_dieSixWhite}
								></canvas>
							</div>
						{/if}

						{#if dicer.diceColor !== DiceColorObj.White}
							<div class="flex w-full justify-between">
								<canvas id="die1black" width="100" height="100" class="[width:14%]" bind:this={canvas_dieOneBlack}
								></canvas>
								<canvas id="die2black" width="100" height="100" class="[width:14%]" bind:this={canvas_dieTwoBlack}
								></canvas>
								<canvas id="die3black" width="100" height="100" class="[width:14%]" bind:this={canvas_dieThreeBlack}
								></canvas>
								<canvas id="die4black" width="100" height="100" class="[width:14%]" bind:this={canvas_dieFourBlack}
								></canvas>
								<canvas id="die5black" width="100" height="100" class="[width:14%]" bind:this={canvas_dieFiveBlack}
								></canvas>
								<canvas id="die6black" width="100" height="100" class="[width:14%]" bind:this={canvas_dieSixBlack}
								></canvas>
							</div>
						{/if}

						<div class="flex space-x-4">
							<Field>
								<Label for="design_dot_size">Dot radius</Label>
								<Input id="design_dot_size" type="number" min="1" max="33" bind:value={dicer.design_dotSize} />
							</Field>

							<Field>
								<Label for="design_dot_size_single">Dot radius of One</Label>
								<Input
									id="design_dot_size_single"
									type="number"
									min="1"
									max="33"
									bind:value={dicer.design_dotSizeSingle}
								/>
							</Field>
						</div>

						<div class="flex space-x-4">
							<Field>
								<Label for="design_padding">Padding</Label>
								<Input id="design_padding" type="number" min="1" max="33" bind:value={dicer.design_padding} />
							</Field>

							<Field>
								<Label for="design_padding_siz">Padding for Six</Label>
								<Input id="design_padding_siz" type="number" min="1" max="33" bind:value={dicer.design_paddingForSix} />
							</Field>
						</div>

						<Field>
							<Label>Two</Label>

							<RadioGroup.Root class="flex space-x-4" bind:value={dicer.design_two}>
								<span class="inline-flex items-center space-x-2">
									<RadioGroup.Item value={DesignTwo.Diagonal} id="design_two_diagonal" />

									<Label for="design_two_diagonal">Diagonal</Label>
								</span>

								<span class="inline-flex items-center space-x-2">
									<RadioGroup.Item value={DesignTwo.Vertical} id="design_two_vertical" />

									<Label for="design_two_vertical">Vertical</Label>
								</span>

								<span class="inline-flex items-center space-x-2">
									<RadioGroup.Item value={DesignTwo.Horizontal} id="design_two_horizontal" />

									<Label for="design_two_horizontal">Horizontal</Label>
								</span>
							</RadioGroup.Root>
						</Field>
					</div>
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</div>

	<!-- <DiceTable diceDensityMatrix={dicer.diceDensityMatrix} diceColor={dicer.diceColor} /> -->
	<canvas id="canvas_mosaic" bind:this={canvas_mosaic} class="sticky top-4 w-8/12 object-contain"></canvas>
</main>
