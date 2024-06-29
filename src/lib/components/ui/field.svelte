<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let { class: classNames, children, ...restProps }: { children: Snippet; class?: string } = $props();
</script>

<div class={cn('space-y-2', classNames)} {...restProps}>
	{@render children()}
</div>
