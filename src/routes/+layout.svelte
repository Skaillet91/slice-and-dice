<script lang="ts">
	import '../app.css';

	import DicerService from '$lib/dicer.svelte';
	import { setContext } from 'svelte';
	import { ModeWatcher } from 'mode-watcher';
	import DarkModeSwitcher from '$lib/components/dark-mode-switcher.svelte';
	import { css } from 'styled-system/css';

	const dicerService = new DicerService();
	dicerService.importFromLocalStorageMaybe();
	dicerService.setUpEffectToWriteToLocalStorage();
	setContext('service:dicer', dicerService);
</script>

<ModeWatcher />

<slot></slot>

<DarkModeSwitcher
	class={css({
		position: 'absolute',
		top: '1rem',
		right: '1rem',
	})}
/>
