<script lang="ts">
	import DicerService from '$lib/dicer.svelte';
	import { setContext } from 'svelte';

	const dicerService = new DicerService();
  dicerService.importFromLocalStorageMaybe();
  dicerService.setUpEffectToWriteToLocalStorage();
	setContext('service:dicer', dicerService);
</script>

<slot></slot>
