<script lang="ts">
	import type DicerService from '$lib/dicer.svelte';
	import { getContext } from 'svelte';
	import Field from './ui/field.svelte';
	import Label from './ui/label/label.svelte';
	import Input from './ui/input/input.svelte';
	import { DesignTwo } from '$lib/dicer.svelte';
	import * as RadioGroup from '$lib/components/ui/radio-group';

	// Services
	const dicer = getContext<DicerService>('service:dicer');

	// State
	let { ...restProps } = $props();
</script>

<div class="space-y-4" {...restProps}>
	<p class="text-muted-foreground">This defines how the dice look in this app. It does not affect any calculations.</p>

	<div class="flex space-x-4">
		<Field>
			<Label for="design_dot_size">Dot radius</Label>
			<Input id="design_dot_size" type="number" min="1" max="33" bind:value={dicer.design_dotSize} />
		</Field>

		<Field>
			<Label for="design_dot_size_single">Dot radius of One</Label>
			<Input id="design_dot_size_single" type="number" min="1" max="33" bind:value={dicer.design_dotSizeSingle} />
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
