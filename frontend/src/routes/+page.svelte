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

	function isArtistMatch(guess) {
		return guess.artists.some((n) => track.artists.some((h) => h.id === n.id));
	}

	$: guesses = [];
	function guess() {
		if (!guesses.find((guess) => guess.id === selectedTrack.id)) {
			guesses = [...guesses, selectedTrack];
			if (selectedTrack.id === track.id) {
				if (guesses.length < 5) {
					guesses.length = 5;
				}
				win = true;
				revealed = true;
			} else {
				selectedTrack = {};
				skip();
			}
		} else {
			selectedTrack = {};
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

	function share() {
		let shareText = '';
		for (let i = 0; i <= guesses.length; i++) {
			if (guesses[i] && guesses[i].id === track.id) {
				shareText += '🟩';
			} else if (guesses[i] && isArtistMatch(guesses[i])) {
				shareText += '🟨';
			} else {
				shareText += '⬜️';
			}
		}
		shareText += '\nhttps://heerdle.playaheadgames.com';

		navigator.clipboard.writeText(shareText);
		console.log('Copied to clipboard:' + shareText); // todo convert to snackbar
	}
</script>

<h1>Heerdle (alpha)</h1>
{#if revealed}
	<img alt="album cover" src={track.album.images[0].url} />
	<p>{track.name} - {artists.join(', ')} ({year})</p>
	{#if win}
		You got today's heerdle within {endTime}
		{endTime > 1 ? 'seconds' : 'second'}.
	{/if}
	<button on:click={share}>Share</button>
{:else}
	<div>
		<div class="guess-list">
			{#if guesses.length > 0}
				{#each guesses as guess (guess.id)}
					{#if isArtistMatch(guess)}
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
			<button class="reveal" on:click={reveal}>Reveal</button>
		</div>
	</div>
{/if}

<style>
	.footer {
		display: flex;
		flex-direction: column;
	}
	.reveal {
		margin-top: 16px;
	}
	.controls {
		display: flex;
		justify-content: space-between;
	}
</style>
