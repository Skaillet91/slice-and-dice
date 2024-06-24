<script lang="ts">
	import { css } from 'styled-system/css';
	import { DiceColor } from '$lib/dicer.svelte';
	import { getDieValue } from '$lib/dice-utils';

	let { diceDensityMatrix, diceColor }: { diceDensityMatrix: number[][]; diceColor: DiceColor } = $props();

	// $effect(() => {
	// 	console.log({ diceDensityMatrix });
	// });
</script>

{#snippet die({ dieValue, dieColor, dotRadius = 16, singleDotRadius = 20 })}
	{@const dotColor = dieColor === DiceColor.White ? 'black' : 'white'}
	<div
		data-die-color={dieColor}
		class={css({
			width: '100%',
			padding: '10%',
			// borderRadius: '10%',
			// border: '1cqmin solid',

			'&[data-die-color=White]': {
				bgColor: '#eee',
				// borderTopColor: '#fafafa',
				// borderLeftColor: '#fafafa',
				// borderBottomColor: '#ccc',
				// borderRightColor: '#ccc',
			},

			'&[data-die-color=Black]': {
				bgColor: '#000',
				// borderTopColor: '#999',
				// borderLeftColor: '#999',
				// borderBottomColor: '#000',
				// borderRightColor: '#000',
			},
		})}
	>
		<svg
			viewBox="0 0 100 100"
			xmlns="http://www.w3.org/2000/svg"
			class={css({
				width: '100%',
			})}
		>
			{#if dieValue >= 2}
				<circle cx={dotRadius} cy={dotRadius} r={dotRadius} class="top-left" fill={dotColor} />
			{/if}

			{#if dieValue >= 4}
				<circle cx={100 - dotRadius} cy={dotRadius} r={dotRadius} class="bottom-left" fill={dotColor} />
			{/if}

			{#if dieValue >= 4}
				<circle cx={dotRadius} cy={100 - dotRadius} r={dotRadius} class="top-right" fill={dotColor} />
			{/if}

			{#if dieValue >= 2}
				<circle cx={100 - dotRadius} cy={100 - dotRadius} r={dotRadius} class="bottom-right" fill={dotColor} />
			{/if}

			{#if dieValue === 6}
				<circle cx={dotRadius} cy="50" r={dotRadius} class="middle-left" fill={dotColor} />
			{/if}

			{#if dieValue === 6}
				<circle cx={100 - dotRadius} cy="50" r={dotRadius} class="middle-right" fill={dotColor} />
			{/if}

			{#if dieValue % 2 === 1}
				<circle
					cx="50"
					cy="50"
					r={dieValue === 1 ? singleDotRadius : dotRadius}
					class="middle-middle"
					fill={dotColor}
				/>
			{/if}
		</svg>
	</div>
{/snippet}

<table
	class={css({
		width: '100%',
		tableLayout: 'fixed',
	})}
>
	<tbody>
		{#each diceDensityMatrix as diceDensityRow}
			<tr>
				{#each diceDensityRow as dieDensity}
					{@const { dieColor, dieValue } = getDieValue(dieDensity, diceColor)}

					<td>
						{@render die({ dieValue, dieColor })}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
