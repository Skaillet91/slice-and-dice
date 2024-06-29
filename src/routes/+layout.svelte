<script lang="ts">
	import '../app.css';

	import DicerService from '$lib/dicer.svelte';
	import { setContext } from 'svelte';
	import { ModeWatcher, mode } from 'mode-watcher';
	import DarkModeSwitcher from '$lib/components/dark-mode-switcher.svelte';
	import DicesIcon from 'lucide-svelte/icons/dices';
	import ExternalLinkIcon from 'lucide-svelte/icons/external-link';
	import { Toaster } from '$lib/components/ui/sonner';
	import assert from 'tiny-invariant';
	import { readFileAsDataUrl } from '$lib/canvas-utils';

	const dicerService = new DicerService();
	dicerService.importFromLocalStorageMaybe();
	dicerService.setUpEffectToWriteToLocalStorage();
	setContext('service:dicer', dicerService);

	// https://web.dev/patterns/clipboard/paste-images#progressive_enhancement
	const readFiles = async (items: ClipboardItem[] | FileList) => {
		let image: File | undefined;

		loop1: for (const item of items) {
			if (item instanceof File && item.type?.startsWith('image/')) {
				// For files from `e.clipboardData.files`.
				image = item;
				break;
			} else if (item instanceof ClipboardItem) {
				// For files from `navigator.clipboard.read()`.
				const imageTypes = item.types?.filter((type) => type.startsWith('image/'));
				for (const imageType of imageTypes) {
					const blob = await item.getType(imageType);
					const file = new File([blob], 'image', { type: blob.type });
					image = file;
					break loop1;
				}
			} else {
				assert(false, 'This code should be unreachable.');
			}
		}

		if (image) {
			const imgString = await readFileAsDataUrl(image);
			await dicerService.importImageStr(imgString);
		}
	};

	// Paste from clipboard
	document.addEventListener('paste', async (event) => {
		const clipboardItems =
			typeof navigator?.clipboard?.read === 'function' ? await navigator.clipboard.read() : event.clipboardData?.files;

		if (!clipboardItems) return;

		await readFiles(clipboardItems);
	});

	// Drag and drop
	document.addEventListener(
		'drop',
		async (event) => {
			event.preventDefault();
			event.stopPropagation();

			let files = event.dataTransfer?.files;

			if (!files) return;

			await readFiles(files);
		},
		false
	);
</script>

<ModeWatcher />
<Toaster />

<header
	class="
   flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b bg-background p-4

   md:flex-nowrap md:px-6
 "
>
	<DicesIcon class="inline self-center" />

	<h1
		class="
    flex-1 shrink-0 grow whitespace-nowrap text-xl font-semibold tracking-tight

    md:grow-0
  "
	>
		Slice and Dice
	</h1>

	<summary
		class="
    order-last block w-full grow text-muted-foreground

    md:order-none md:w-auto
  "
	>
		Convert an image to a dice mosaic, then craft it in real life
	</summary>

	<a href="https://github.com/lolmaus/slice-and-dice/" target="_blank" class="relative">
		<!-- https://simpleicons.org/?q=github -->
		<svg
			role="img"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			fill={$mode === 'light' ? 'black' : 'white'}
			class="h-6 w-6"
		>
			<title>GitHub</title>
			<path
				d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
			/>
		</svg>
		<ExternalLinkIcon size={12} class="absolute -right-3 -top-3" />
	</a>
	<DarkModeSwitcher class="" />
</header>

<main
	class="
   relative block items-start p-4

   lg:flex lg:justify-between
 "
>
	<slot></slot>
</main>

<footer class="p-4 text-center">
	Created by <a href="https://lolma.us" class="underline">Andrey Mikhaylov (@lolmaus)</a>
</footer>
