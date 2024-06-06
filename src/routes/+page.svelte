<script lang="ts">
	const authorizedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
	const size = 600;
	let canvas: HTMLCanvasElement | undefined; // popuplated from `bind:this`

	let originalImageWidth = $state(0);
	let originalImageHeight = $state(0);
	let lockOriginalImageAspectRatio = $state(true);
	let originalImageAspectRatio = $derived(originalImageWidth / originalImageHeight);

	let diceCountHorizontal = $state(100);
	let diceCountVertical = $state(60);
	let diceCountVerticalEffective = $derived(
		lockOriginalImageAspectRatio
			? Math.round(diceCountHorizontal / originalImageAspectRatio)
			: diceCountVertical
	);
	let diceAspectRatio = $derived(diceCountHorizontal / diceCountVerticalEffective);

	// $effect(() => {
	//   const ctx = canvas.getContext('2d');

	// });

	function imageUploaded(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		console.log(event);

		const file = event.currentTarget?.files?.[0];

		if (!file) {
			console.log('There are no files uploaded, aborting.');
			return;
		}

		const reader = new FileReader();

		reader.onload = (eventOfReader) => {
			const img = new Image();

			if (!eventOfReader.target?.result) {
				throw new Error('Expected `eventOfReader.target?.result` to exist at this point.');
			}

			if (eventOfReader.target?.result instanceof ArrayBuffer) {
				throw new Error('Expected `eventOfReader.target?.result` to be a string, was ArrayBuffer.');
			}

			img.src = eventOfReader.target.result;

			img.onload = () => {
				console.log('img', img);

				if (!canvas) {
					throw new Error('Expected `canvas` to be initialized at this point.');
				}

				canvas.width = img.width;
				canvas.height = img.height;

				originalImageWidth = img.width;
				originalImageHeight = img.height;

				const ctx = canvas.getContext('2d');

				if (!ctx) {
					throw new Error('Expected `ctx` to be initialized at this point.');
				}

				ctx.drawImage(img, 0, 0);
			};
		};

		reader.readAsDataURL(file);
	}
</script>

<p>
	<label for="file">
		<input
			type="file"
			id="file"
			name="fileToUpload"
			accept={authorizedExtensions.join(',')}
			required
			onchange={imageUploaded}
		/>

		<span>Upload your file</span>
	</label>
</p>

<div>
	<span>Original image aspect ratio:</span>
	<span>{originalImageAspectRatio}</span>
	<label>
		<input type="checkbox" bind:checked={lockOriginalImageAspectRatio} />
		Lock
	</label>
</div>

<div>
	<label>
		<span>Dice count horizontal</span>
		<input type="number" min="1" bind:value={diceCountHorizontal} />
		<input type="range" min="1" max="200" bind:value={diceCountHorizontal} />
	</label>
</div>

<div>
	<label>
		<span>Dice count vertical</span>
		<input
			type="number"
			min="1"
			value={diceCountVerticalEffective}
			disabled={lockOriginalImageAspectRatio}
			oninput={(e) => diceCountVertical = parseInt((e.target as HTMLInputElement).value, 10)}
		/>
		<input
			type="range"
			min="1"
			max="200"
			value={diceCountVerticalEffective}
			disabled={lockOriginalImageAspectRatio}
			oninput={(e) => diceCountVertical = parseInt((e.target as HTMLInputElement).value, 10)}
		/>
	</label>
</div>

<div>
	<span>Dice aspect ratio</span>
	<span>{diceAspectRatio}</span>
</div>

<canvas bind:this={canvas} width={size} height={size} style="width: 500px; height: auto"></canvas>
