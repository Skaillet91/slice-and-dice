<script lang="ts">
	import type DicerService from '$lib/dicer.svelte';
	import { getContext } from 'svelte';
	import { DiceColorObj } from '$lib/dicer.svelte';
	import Field from './ui/field.svelte';
	import Label from './ui/label/label.svelte';
	import Input from './ui/input/input.svelte';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Table from '$lib/components/ui/table';
	import Button from './ui/button/button.svelte';
	import UndoIcon from 'lucide-svelte/icons/undo';

	// Services
	const dicer = getContext<DicerService>('service:dicer');

	// State
	let { ...restProps } = $props();

	// HTML event handlers
</script>

<div class="space-y-4" {...restProps}>
	<Field>
		<Label for="diceCountHorizontal">Dice count horizontal</Label>

		<div class="flex gap-6">
			<Input
				class="w-20"
				id="diceCountHorizontal"
				type="number"
				min="1"
				max={Math.min(dicer.imgData_cropped?.width ?? 9999)}
				bind:value={dicer.diceCountHorizontal}
			/>

			<Input
				type="range"
				min="1"
				max={Math.min(dicer.imgData_cropped?.width ?? 200, 200)}
				bind:value={dicer.diceCountHorizontal}
			/>

			<Button
				variant="outline"
				size="icon"
				disabled={dicer.diceCountHorizontal === dicer.defaults.diceCountHorizontal}
				onclick={() => {
					dicer.diceCountHorizontal = dicer.defaults.diceCountHorizontal;
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
		<Label for="diceCountVertical">Dice count vertical</Label>

		<div class="flex gap-6">
			<Input
				class="w-20"
				id="diceCountVertical"
				type="number"
				min="1"
				max={Math.min(dicer.imgData_cropped?.height ?? 9999)}
				value={dicer.diceCountVerticalEffective}
				disabled={dicer.lockAspectRatioOriginal}
				oninput={(e) => dicer.diceCountVertical = parseInt((e.target as HTMLInputElement).value, 10)}
			/>

			<Input
				type="range"
				min="1"
				max={Math.min(dicer.imgData_cropped?.height ?? 200, 200)}
				value={dicer.diceCountVerticalEffective}
				disabled={dicer.lockAspectRatioOriginal}
				oninput={(e) => dicer.diceCountVertical = parseInt((e.target as HTMLInputElement).value, 10)}
			/>

			<Button
				variant="outline"
				size="icon"
				disabled={dicer.lockAspectRatioOriginal || dicer.diceCountVertical === dicer.defaults.diceCountVertical}
				onclick={() => {
					dicer.diceCountVertical = dicer.defaults.diceCountVertical;
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

			<Label id="lockAspectRatioOriginal-label" for="lockAspectRatioOriginal">Use aspect ratio from source image</Label>
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
