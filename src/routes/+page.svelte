<script lang="ts">
	import { createImage, generateMosaicPure, readFileAsDataUrl } from '$lib/canvas-utils';
	import DicerService, { DesignTwo, DiceColorObj, type CropArea, type Die } from '$lib/dicer.svelte';
	import { getContext } from 'svelte';
	import Cropper from 'svelte-easy-crop';
	import assert from 'tiny-invariant';
	import debounce from 'lodash/debounce';

	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Field from '$lib/components/ui/field.svelte';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Table from '$lib/components/ui/table';
	import { FuncWork } from 'funcwork';
	import LoaderCircleIcon from 'lucide-svelte/icons/loader-circle';

	const dicer = getContext<DicerService>('service:dicer');
	const authorizedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

	let renderMosaicCounter = $state(0);

	let canvas_colorPreview: HTMLCanvasElement | undefined = $state(); //5 popuplated from `bind:this`
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

	// Delegate rendering to a web worker
	const renderMosaic = (args: {
		diceMatrix: Die[][];
		diceImageStrings: {
			White: { [key: number]: string };
			Black: { [key: number]: string };
		};
		outerPadding?: number;
		labelHeight?: number;
		dieSize?: number;
		innerPadding?: number;
	}) => {
		const renderMosaicIterationCurrent = ++renderMosaicCounter;
		const fw = new FuncWork();

		fw.add(generateMosaicPure);

		fw.invoke(generateMosaicPure, args).then(async (imageStr: string) => {
			const imageElement = await createImage(imageStr);

			if (renderMosaicIterationCurrent !== renderMosaicCounter) {
				return;
			}

			renderMosaicCounter = 0;

			requestAnimationFrame(() => {
				assert(canvas_mosaic, 'Expected canvas_mosaic to exist at this point');

				canvas_mosaic.width = imageElement.width;
				canvas_mosaic.height = imageElement.height;

				const ctx = canvas_mosaic.getContext('2d');

				assert(ctx, 'Expected `ctx` to exist at this point.');

				ctx.drawImage(imageElement, 0, 0);
			});
		});
	};

	const renderMosaicDebounced = debounce(renderMosaic, 500);

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

	// Dice Design Preview
	$effect(() => {
		if (!canvas_dieOneWhite) return;
		const ctx = canvas_dieOneWhite.getContext('2d');
		assert(ctx, 'Expected `ctx` to exist at this point.');
		ctx.putImageData(dicer.imgDataDieOneWhite, 0, 0);
	});
	$effect(() => {
		if (!canvas_dieOneBlack) return;
		const ctx = canvas_dieOneBlack.getContext('2d');
		assert(ctx, 'Expected `ctx` to exist at this point.');
		ctx.putImageData(dicer.imgDataDieOneBlack, 0, 0);
	});
	$effect(() => {
		if (!canvas_dieTwoWhite) return;
		const ctx = canvas_dieTwoWhite.getContext('2d');
		assert(ctx, 'Expected `ctx` to exist at this point.');
		ctx.putImageData(dicer.imgDataDieTwoWhite, 0, 0);
	});
	$effect(() => {
		if (!canvas_dieTwoBlack) return;
		const ctx = canvas_dieTwoBlack.getContext('2d');
		assert(ctx, 'Expected `ctx` to exist at this point.');
		ctx.putImageData(dicer.imgDataDieTwoBlack, 0, 0);
	});
	$effect(() => {
		if (!canvas_dieThreeWhite) return;
		const ctx = canvas_dieThreeWhite.getContext('2d');
		assert(ctx, 'Expected `ctx` to exist at this point.');
		ctx.putImageData(dicer.imgDataDieThreeWhite, 0, 0);
	});
	$effect(() => {
		if (!canvas_dieThreeBlack) return;
		const ctx = canvas_dieThreeBlack.getContext('2d');
		assert(ctx, 'Expected `ctx` to exist at this point.');
		ctx.putImageData(dicer.imgDataDieThreeBlack, 0, 0);
	});
	$effect(() => {
		if (!canvas_dieFourWhite) return;
		const ctx = canvas_dieFourWhite.getContext('2d');
		assert(ctx, 'Expected `ctx` to exist at this point.');
		ctx.putImageData(dicer.imgDataDieFourWhite, 0, 0);
	});
	$effect(() => {
		if (!canvas_dieFourBlack) return;
		const ctx = canvas_dieFourBlack.getContext('2d');
		assert(ctx, 'Expected `ctx` to exist at this point.');
		ctx.putImageData(dicer.imgDataDieFourBlack, 0, 0);
	});
	$effect(() => {
		if (!canvas_dieFiveWhite) return;
		const ctx = canvas_dieFiveWhite.getContext('2d');
		assert(ctx, 'Expected `ctx` to exist at this point.');
		ctx.putImageData(dicer.imgDataDieFiveWhite, 0, 0);
	});
	$effect(() => {
		if (!canvas_dieFiveBlack) return;
		const ctx = canvas_dieFiveBlack.getContext('2d');
		assert(ctx, 'Expected `ctx` to exist at this point.');
		ctx.putImageData(dicer.imgDataDieFiveBlack, 0, 0);
	});
	$effect(() => {
		if (!canvas_dieSixWhite) return;
		const ctx = canvas_dieSixWhite.getContext('2d');
		assert(ctx, 'Expected `ctx` to exist at this point.');
		ctx.putImageData(dicer.imgDataDieSixWhite, 0, 0);
	});
	$effect(() => {
		if (!canvas_dieSixBlack) return;
		const ctx = canvas_dieSixBlack.getContext('2d');
		assert(ctx, 'Expected `ctx` to exist at this point.');
		ctx.putImageData(dicer.imgDataDieSixBlack, 0, 0);
	});

	// Synchronously collect state for a dice mosaic, then render it asynchronously
	$effect(() => {
		if (canvas_mosaic) {
			if (
				dicer.diceMatrix &&
				canvas_dieOneWhite &&
				canvas_dieTwoWhite &&
				canvas_dieThreeWhite &&
				canvas_dieFourWhite &&
				canvas_dieFiveWhite &&
				canvas_dieSixWhite &&
				canvas_dieOneBlack &&
				canvas_dieTwoBlack &&
				canvas_dieThreeBlack &&
				canvas_dieFourBlack &&
				canvas_dieFiveBlack &&
				canvas_dieSixBlack
			) {
				// Touch properties to trigger reactivity
				/* eslint-disable @typescript-eslint/no-unused-expressions */
				dicer.design_bgColor_blackDie;
				dicer.design_bgColor_whiteDie;
				dicer.design_borderColor_blackDie;
				dicer.design_borderColor_whiteDie;
				dicer.design_borderWidth;
				dicer.design_dotColor_BlackDie;
				dicer.design_dotColor_WhiteDie;
				dicer.design_dotColorSingle_blackDie;
				dicer.design_dotColorSingle_whiteDie;
				dicer.design_dotSize;
				dicer.design_dotSizeSingle;
				dicer.design_padding;
				dicer.design_paddingForSix;
				dicer.design_two;
				/* eslint-enable @typescript-eslint/no-unused-expressions */

				const args: {
					diceMatrix: Die[][];
					diceImageStrings: {
						White: { [key: number]: string };
						Black: { [key: number]: string };
					};
					outerPadding?: number;
					labelHeight?: number;
					dieSize?: number;
					innerPadding?: number;
				} = {
					diceMatrix: dicer.diceMatrix,
					diceImageStrings: {
						White: {
							1: canvas_dieOneWhite.toDataURL(),
							2: canvas_dieTwoWhite.toDataURL(),
							3: canvas_dieThreeWhite.toDataURL(),
							4: canvas_dieFourWhite.toDataURL(),
							5: canvas_dieFiveWhite.toDataURL(),
							6: canvas_dieSixWhite.toDataURL(),
						},
						Black: {
							1: canvas_dieOneBlack.toDataURL(),
							2: canvas_dieTwoBlack.toDataURL(),
							3: canvas_dieThreeBlack.toDataURL(),
							4: canvas_dieFourBlack.toDataURL(),
							5: canvas_dieFiveBlack.toDataURL(),
							6: canvas_dieSixBlack.toDataURL(),
						},
					},
				};

				// Async
				renderMosaicDebounced(args);
			} else {
				canvas_mosaic.width = 100;
				canvas_mosaic.height = 0;
			}
		}
	});

	// HTML event handlers
	const persistUploadedImage = async (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		const imgString = await readFileAsDataUrl(event.currentTarget?.files);
		await dicer.importImageStr(imgString);
	};

	const persistCropArea = (event: CustomEvent<{ pixels: CropArea }>) => {
		dicer.cropArea = event.detail.pixels;
	};
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
				</div>
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
						<Table.Root>
							<Table.Body>
								<Table.Row>
									<Table.Head class="h-auto w-1/2 pl-0">Aspect ratio:</Table.Head>
									<Table.Cell class="p-0 text-left">
										{dicer.aspectRatioDice === undefined ? null : Math.round(dicer.aspectRatioDice * 100) / 100}
									</Table.Cell>
								</Table.Row>
							</Table.Body>
						</Table.Root>

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
					<p class="text-muted-foreground">For your informartion. These numbers do not affect the mosaic.</p>

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

					<Table.Root>
						<Table.Body>
							<Table.Row>
								<Table.Head class="h-auto pl-0">Mosaic width:</Table.Head>
								<Table.Cell class="p-0">{dicer.totalWidth} mm</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Head class="h-auto pl-0">Mosaic height:</Table.Head>
								<Table.Cell class="p-0">{dicer.totalHeight} mm</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Head class="h-auto pl-0">White dice count:</Table.Head>
								<Table.Cell class="p-0">{dicer.diceCountWhite}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Head class="h-auto pl-0">Black dice count:</Table.Head>
								<Table.Cell class="p-0">{dicer.diceCountBlack}</Table.Cell>
							</Table.Row>
						</Table.Body>
					</Table.Root>

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

							<p class="text-muted-foreground">
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
					<p class="text-muted-foreground">
						This defines how the dice look in this app. It does not affect any calculations.
					</p>

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

						<RadioGroup.Root class="flex space-x-2" bind:value={dicer.design_two}>
							<span class="inline-flex items-center space-x-1">
								<RadioGroup.Item value={DesignTwo.Diagonal} id="design_two_diagonal" />

								<Label for="design_two_diagonal">Diagonal</Label>
							</span>

							<span class="inline-flex items-center space-x-1">
								<RadioGroup.Item value={DesignTwo.Vertical} id="design_two_vertical" />

								<Label for="design_two_vertical">Vertical</Label>
							</span>

							<span class="inline-flex items-center space-x-1">
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

<div
	class="
   relative min-h-96 space-y-4

   lg:sticky lg:top-4 lg:w-[70%]
 "
>
	<div class="flex w-full justify-between gap-1">
		<div>
			<canvas id="die1white" width="100" height="100" class="w-full" bind:this={canvas_dieOneWhite}></canvas>
		</div>
		<div>
			<canvas id="die2white" width="100" height="100" class="w-full" bind:this={canvas_dieTwoWhite}></canvas>
		</div>
		<div>
			<canvas id="die3white" width="100" height="100" class="w-full" bind:this={canvas_dieThreeWhite}></canvas>
		</div>
		<div>
			<canvas id="die4white" width="100" height="100" class="w-full" bind:this={canvas_dieFourWhite}></canvas>
		</div>
		<div>
			<canvas id="die5white" width="100" height="100" class="w-full" bind:this={canvas_dieFiveWhite}></canvas>
		</div>
		<div>
			<canvas id="die6white" width="100" height="100" class="w-full" bind:this={canvas_dieSixWhite}></canvas>
		</div>
		<div>
			<canvas id="die1black" width="100" height="100" class="w-full" bind:this={canvas_dieOneBlack}></canvas>
		</div>
		<div>
			<canvas id="die2black" width="100" height="100" class="w-full" bind:this={canvas_dieTwoBlack}></canvas>
		</div>
		<div>
			<canvas id="die3black" width="100" height="100" class="w-full" bind:this={canvas_dieThreeBlack}></canvas>
		</div>
		<div>
			<canvas id="die4black" width="100" height="100" class="w-full" bind:this={canvas_dieFourBlack}></canvas>
		</div>
		<div>
			<canvas id="die5black" width="100" height="100" class="w-full" bind:this={canvas_dieFiveBlack}></canvas>
		</div>
		<div>
			<canvas id="die6black" width="100" height="100" class="w-full" bind:this={canvas_dieSixBlack}></canvas>
		</div>
	</div>

	<!-- <DiceTable diceDensityMatrix={dicer.diceDensityMatrix} diceColor={dicer.diceColor} /> -->
	<canvas id="canvas_mosaic" bind:this={canvas_mosaic} class="h-auto w-full object-contain"></canvas>

	{#if renderMosaicCounter}
		<div
			class="
     absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform pt-[4cqi] text-center
     font-extrabold leading-tight tracking-tight

     [-webkit-text-stroke:0.3cqi_black]

     [font-size:6cqi]
   "
		>
			slicing
			<br />
			and
			<br />
			dicing
			<br />
			<LoaderCircleIcon class="inline animate-spin rounded-full bg-black" size="1em" />
		</div>
	{/if}
</div>
