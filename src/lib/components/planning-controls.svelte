<script lang="ts">
	import type DicerService from '$lib/dicer.svelte';
	import { getContext } from 'svelte';
	import Field from './ui/field.svelte';
	import Label from './ui/label/label.svelte';
	import * as Table from '$lib/components/ui/table';
	import Input from './ui/input/input.svelte';

	// Services
	const dicer = getContext<DicerService>('service:dicer');

	// State
	let { ...restProps } = $props();

	// HTML event handlers
</script>

<div class="space-y-4" {...restProps}>
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
