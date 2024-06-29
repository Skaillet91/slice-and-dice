<script lang="ts">
	import { readFileAsDataUrl } from '$lib/canvas-utils';
	import Field from './ui/field.svelte';
	import Input from './ui/input/input.svelte';
	import Label from './ui/label/label.svelte';
	import assert from 'tiny-invariant';
	import ImageDownIcon from 'lucide-svelte/icons/image-down';
	import Button from '$lib/components/ui/button/button.svelte';
	import { toast } from 'svelte-sonner';
	import type DicerService from '$lib/dicer.svelte';
	import { getContext } from 'svelte';

	const authorizedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

	// Services
	const dicer = getContext<DicerService>('service:dicer');

	// State
	let { ...restProps } = $props();
	let imageURL = $state('');

	const eventHandler_persistUploadedImage = async (
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		const file = event.currentTarget?.files?.[0];
		assert(file, 'Expected `file` to exist at this point.');
		const imgString = await readFileAsDataUrl(file);
		await dicer.importImageStr(imgString);
	};

	const eventHandler_downloadImageFromURL = async (event: SubmitEvent) => {
		event.preventDefault();

		try {
			if (!URL.canParse(imageURL)) {
				throw new Error('Invalid URL');
			}

			const proxyURL = 'https://corsproxy.io/?' + encodeURIComponent(imageURL);
			const response = await fetch(proxyURL);

			if (!response.ok) {
				throw new Error(`${response.status}`);
			}

			const blob = await response.blob();
			const file = new File([blob], 'image', { type: blob.type });
			const imgString = await readFileAsDataUrl(file);
			await dicer.importImageStr(imgString);
		} catch (e) {
			toast.error('Failed to download the image from the URL.', {
				description: (e as Error)?.message,
			});
		}
	};
</script>

<Field {...restProps}>
	<Label for="file">Upload your file</Label>

	<Input
		type="file"
		name="file"
		accept={authorizedExtensions.join(',')}
		onchange={eventHandler_persistUploadedImage}
		class="cursor-pointer"
	/>

	<form onsubmit={eventHandler_downloadImageFromURL} class="flex gap-2">
		<Input placeholder="Or upload an image from URL" class="grow" bind:value={imageURL} />

		<Button variant="outline" size="icon" type="submit" class="shrink-0">
			<ImageDownIcon class="h-[1.2rem] w-[1.2rem]" />
		</Button>
	</form>
</Field>
