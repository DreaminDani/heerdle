<script>
	// @ts-nocheck

	import AutoComplete from 'simple-svelte-autocomplete';

	/** @type {import('./$types').PageData} */
	export let data;
	const { track } = data;

	const artists = track.artists.map((artist) => artist.name);
	const year = track.album.release_date.split('-')[0];

	let player;
	let selectedColor;
	async function searchColor(keyword) {
		return ['White', 'Red', 'Yellow', 'Green', 'Blue', 'Black', 'Mät bläck', '<i>Jét Black</i>'];
	}

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

	function controlTime(event) {
		if (!player) {
			player = event.target;
		}
		if (player.currentTime > endTime) {
			player.pause();
		}
	}

	function playCheck(event) {
		event?.preventDefault();
		if (player && player.currentTime > endTime) {
			player.currentTime = 0;
			player.play();
		}
	}
</script>

<h1>Try it</h1>
{#if revealed}
	<p>{artists.toString()} - {track.name} ({year})</p>
{:else}
	<div class="footer">
		<audio on:play={playCheck} on:timeupdate={controlTime} controls src={track['preview_url']} />
		<AutoComplete
			placeholder="start typing to guess"
			delay="200"
			searchFunction={searchColor}
			bind:selectedItem={selectedColor}
		/>
		<div class="controls">
			<button on:click={skip}>Skip ({skipTime}s)</button>
			<button on:click={() => {}}>Guess</button>
		</div>
		<button on:click={reveal}>Reveal</button>
	</div>
{/if}

<style>
	.footer {
		display: flex;
		flex-direction: column;
	}
	.controls {
		display: flex;
		justify-content: space-between;
	}
</style>
