<script>
	// @ts-nocheck
	export let type;
	export let guess;

	import squareIcon from '../icons/square.svg?raw';
	import divideSquareIcon from '../icons/divide-square.svg?raw';
	import xSquareIcon from '../icons/x-square.svg?raw';
</script>

<div class="guess">
	{#if type === 'match'}
		{@html divideSquareIcon}
		<p>{guess.name} - {guess.artists.map((artist) => artist.name).join(', ')}</p>
	{:else if type === 'nomatch'}
		{@html xSquareIcon}
		<p>{guess.name} - {guess.artists.map((artist) => artist.name).join(', ')}</p>
	{:else if type === 'skip'}
		{@html squareIcon}
		<p class="skipped">{guess.name}</p>
	{/if}
</div>

<style>
	.skipped {
		text-transform: uppercase;
	}

	.guess {
		min-height: 40px;
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 8px 6px;
		gap: 8px;
		background: rgba(255, 255, 255, 0.56);
		border-radius: 8px;
		font-weight: 700;
	}

	:global(.guess svg) {
		min-width: 24px;
	}
</style>
