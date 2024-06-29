<script lang="ts">
	import type DicerService from '$lib/dicer.svelte';
	import { getContext } from 'svelte';
	import Field from './ui/field.svelte';
	import Label from './ui/label/label.svelte';
	import Input from './ui/input/input.svelte';
	import { DesignTwo } from '$lib/dicer.svelte';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import Button from './ui/button/button.svelte';
	import { UndoIcon } from 'lucide-svelte';

	// Services
	const dicer = getContext<DicerService>('service:dicer');

	// State
	let { ...restProps } = $props();
</script>

<div class="space-y-4" {...restProps}>
	<p class="text-muted-foreground">This defines how the dice look in this app. It does not affect any calculations.</p>

	<div class="flex flex-wrap justify-between gap-4">
		<Field class="w-[47%]">
			<Label for="design_dot_size">Dot radius</Label>

			<div class="flex gap-2">
				<Input id="design_dot_size" type="number" min="1" max="33" bind:value={dicer.design_dotSize} />

				<Button
					variant="outline"
					size="icon"
					disabled={dicer.design_dotSize === dicer.defaults.design_dotSize}
					onclick={() => {
						dicer.design_dotSize = dicer.defaults.design_dotSize;
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

		<Field class="w-[47%]">
			<Label for="design_dot_size_single">Dot radius of One</Label>

			<div class="flex gap-2">
				<Input id="design_dot_size_single" type="number" min="1" max="33" bind:value={dicer.design_dotSizeSingle} />

				<Button
					variant="outline"
					size="icon"
					disabled={dicer.design_dotSizeSingle === dicer.defaults.design_dotSizeSingle}
					onclick={() => {
						dicer.design_dotSizeSingle = dicer.defaults.design_dotSizeSingle;
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

		<Field class="w-[47%]">
			<Label for="design_padding">Padding</Label>

			<div class="flex gap-2">
				<Input id="design_padding" type="number" min="1" max="33" bind:value={dicer.design_padding} />

				<Button
					variant="outline"
					size="icon"
					disabled={dicer.design_padding === dicer.defaults.design_padding}
					onclick={() => {
						dicer.design_padding = dicer.defaults.design_padding;
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

		<Field class="w-[47%]">
			<Label for="design_padding_siz">Padding for Six</Label>

			<div class="flex gap-2">
				<Input id="design_padding_siz" type="number" min="1" max="33" bind:value={dicer.design_paddingForSix} />

				<Button
					variant="outline"
					size="icon"
					disabled={dicer.design_paddingForSix === dicer.defaults.design_paddingForSix}
					onclick={() => {
						dicer.design_paddingForSix = dicer.defaults.design_paddingForSix;
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
