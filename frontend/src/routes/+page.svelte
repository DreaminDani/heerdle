<script>
	/** @type {import('./$types').PageData} */
	export let data;
	const { track } = data;

	const artists = track.artists.map((artist) => artist.name);
	const year = track.album.release_date.split('-')[0];

	let revealed = false;
	function reveal() {
		revealed = true;
	}
</script>

<h1>Try it</h1>
<audio controls src={track['preview_url']} />
<button on:click={reveal}>Reveal</button>
{#if revealed}
	<p>{artists.toString()} - {track.name} ({year})</p>
{/if}
