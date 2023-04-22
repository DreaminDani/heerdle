<script>
	/** @type {import('./$types').PageData} */
	export let data;
	const { track } = data;

	const artists = track.artists.map((artist) => artist.name);
	const year = track.album.release_date.split('-')[0];

	/**
	 * @type {EventTarget | null}
	 */
	let player;

	let revealed = false;
	function reveal() {
		revealed = true;
	}
	let endTime = 1;
	let skipTime = 1;
	function skip() {
		endTime = endTime + skipTime;
		skipTime = skipTime + 1;
		if (player && player.paused) {
			player.currentTime = 0;
		}
	}

	/**
	 * @param {Event} event
	 */
	function controlTime(event) {
		if (!player) {
			player = event.target;
		}
		if (player.currentTime > endTime) {
			player.pause();
		}
	}

	/**
	 * @param {Event} event
	 */
	function playCheck(event) {
		event?.preventDefault();
		if (player && player.currentTime > endTime) {
			player.currentTime = 0;
			player.play();
		}
	}
</script>

<h1>Try it</h1>
<audio on:play={playCheck} on:timeupdate={controlTime} controls src={track['preview_url']} />
<button on:click={skip}>Skip ({skipTime}s)</button>
<button on:click={reveal}>Reveal</button>
{#if revealed}
	<p>{artists.toString()} - {track.name} ({year})</p>
{/if}
