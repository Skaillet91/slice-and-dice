<script lang="ts">
	import type DicerService from '$lib/dicer.svelte';
	import { getContext } from 'svelte';
	import Button from './ui/button/button.svelte';

	// Services
	const dicer = getContext<DicerService>('service:dicer');

	// State
	let { ...restProps } = $props();

	// HTML event handlers
</script>

<div class="flex flex-wrap gap-4" {...restProps}>
	<Button variant="outline" onclick={() => dicer.reset()}>Reset parameters</Button>

	<Button variant="outline" onclick={() => dicer.importImageStr()}>Forget the image</Button>
</div>
