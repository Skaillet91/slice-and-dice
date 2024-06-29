<script lang="ts">
	import { createImage, generateMosaicPure } from '$lib/canvas-utils';
	import DicerService, { type Die } from '$lib/dicer.svelte';
	import { getContext } from 'svelte';
	import assert from 'tiny-invariant';
	import debounce from 'lodash/debounce';

	import { FuncWork } from 'funcwork';
	import LoaderCircleIcon from 'lucide-svelte/icons/loader-circle';

	// Services
	const dicer = getContext<DicerService>('service:dicer');

	// State
	let { ...restProps } = $props();
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
	let renderMosaicCounter = $state(0);

	// Observables
	// Populate the dice design canvases
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
				dicer.imgString_original;
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

	// Functions
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
</script>

<div class="space-y-6" {...restProps}>
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
