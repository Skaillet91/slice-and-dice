<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, ...restProps }: { children: Snippet } = $props();
</script>

<div class="space-y-2" {...restProps}>
	{@render children()}
</div>
