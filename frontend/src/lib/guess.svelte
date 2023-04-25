<script>
	// @ts-nocheck
	export let type;
	export let guess;
</script>

{#if type === 'match'}
	<span>artist match </span>
	<p>{guess.name} - {guess.artists.map((artist) => artist.name).join(', ')}</p>
{:else if type === 'nomatch'}
	<span>no match </span>
	<p>{guess.name} - {guess.artists.map((artist) => artist.name).join(', ')}</p>
{:else if type === 'skip'}
	<p>{guess.name}</p>
{:else}
	<p>empty bits go here</p>
{/if}
