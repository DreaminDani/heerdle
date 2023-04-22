<script>
	// @ts-nocheck

	import AutoComplete from 'simple-svelte-autocomplete';

	/** @type {import('./$types').PageData} */
	export let data;
	const { options, track } = data;
	console.log(track);

	const artists = track.artists.map((artist) => artist.name);
	const year = track.album.release_date.split('-')[0];

	let player;
	let selectedTrack = {};

	let win = false;

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

	$: guesses = [];
	function guess() {
		guesses = [...guesses, selectedTrack];
		if (selectedTrack.id === track.id) {
			win = true;
			revealed = true;
		} else {
			selectedTrack = {};
			skip();
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
	<p>{track.name} - {artists.join(', ')} ({year})</p>
{:else}
	<div>
		<div class="guess-list">
			{#if guesses.length > 0}
				{#each guesses as guess (guess.id)}
					{#if guess.artists.some((n) => track.artists.some((h) => h.id === n.id))}
						<span>artist match </span>
					{:else}
						<span>no match </span>
					{/if}
					<p>{guess.name} - {guess.artists.map((artist) => artist.name).join(', ')}</p>
				{/each}
			{/if}
		</div>
		<div class="footer">
			<audio on:play={playCheck} on:timeupdate={controlTime} controls src={track['preview_url']} />
			<AutoComplete
				placeholder="start typing to guess"
				delay="200"
				showClear={true}
				items={options}
				bind:selectedItem={selectedTrack}
				labelFieldName="searchable"
			/>
			<div class="controls">
				<button on:click={skip}>Skip ({skipTime}s)</button>
				<button on:click={guess}>Guess</button>
			</div>
			<button on:click={reveal}>Reveal</button>
		</div>
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
