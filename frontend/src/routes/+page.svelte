<script>
	// @ts-nocheck
	import infoIcon from '../icons/info.svg?raw';
	import githubIcon from '../icons/github.svg?raw';
	import AutoComplete from 'simple-svelte-autocomplete';
	import Guess from '../lib/guess.svelte';

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

	function isArtistMatch(guess) {
		return guess.artists.some((n) => track.artists.some((h) => h.id === n.id));
	}

	let endTime = 1;
	let skipTime = 1;
	function next() {
		endTime = endTime + skipTime;
		skipTime = skipTime + 1;
		if (player && player.paused) {
			player.currentTime = 0;
		}
	}

	$: guesses = [];
	function guess() {
		if (!guesses.find((guess) => guess.id === selectedTrack.id)) {
			guesses = [...guesses, selectedTrack];
			if (selectedTrack.id === track.id) {
				win = true;
				revealed = true;
			} else {
				selectedTrack = {};
				next();
			}
		} else {
			selectedTrack = {};
		}
	}

	function skip() {
		guesses = [...guesses, { name: 'Skipped', id: `skip${skipTime}` }];
		next();
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
		if (guesses.length < 5) {
			guesses.length = 5;
		}
		let shareText = '';
		for (let i = 0; i <= guesses.length; i++) {
			if (guesses[i] && guesses[i].id === track.id) {
				shareText += '🟩';
			} else if (guesses[i] && guesses[i].id.startsWith('skip')) {
				shareText += '⬜️';
			} else if (guesses[i] && isArtistMatch(guesses[i])) {
				shareText += '🟨';
			} else if (guesses[i]) {
				shareText += '🟥';
			} else {
				shareText += '⬜️';
			}
		}
		shareText += '\n\nheerdle.playaheadgames.com';

		navigator.clipboard.writeText(shareText);
		console.log('Copied to clipboard:' + shareText); // todo convert to snackbar
	}
</script>

<head>
	<title>Heerdle</title>
</head>

<header>
	<div class="header-content">
		{@html infoIcon}
		<h1>Heerdle</h1>
		<a href="https://github.com/DreaminDani/heerdle" target="_blank">{@html githubIcon}</a>
	</div>
</header>
<main>
	{#if revealed}
		<div class="end-screen">
			<img alt="album cover" src={track.album.images[0].url} />
			<p>{track.name} - {artists.join(', ')} ({year})</p>
			{#if win}
				You got today's heerdle within {endTime}
				{endTime > 1 ? 'seconds' : 'second'}.
			{/if}
			<button on:click={share}>Share</button>
		</div>
	{:else}
		<div class="guess-list">
			{#if guesses.length > 0}
				{#each guesses as guess (guess.id)}
					{#if guess.id.startsWith('skip')}
						<Guess type="skip" {guess} />
					{:else if isArtistMatch(guess)}
						<Guess type="match" {guess} />
					{:else}
						<Guess type="nomatch" {guess} />
					{/if}
				{/each}
				{#each { length: 6 - guesses.length } as _, i}
					<Guess />
				{/each}
			{:else}
				{#each { length: 6 } as _, i}
					<Guess />
				{/each}
			{/if}
		</div>
		<div class="footer">
			<div class="footer-content">
				<audio
					on:play={playCheck}
					on:timeupdate={controlTime}
					controls
					src={track['preview_url']}
				/>
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
</main>

<style>
	:global(*) {
		margin: 0;
	}
	:global(html, body) {
		height: 100%;
	}
	:global(body) {
		font-family: 'Manrope', sans-serif;
		color: rgba(16, 24, 40, 0.8);
		background: linear-gradient(0deg, rgba(8, 174, 234, 0.4) 0%, rgba(42, 245, 152, 0.4) 100%),
			#ffffff;
	}
	header {
		width: 100%;
		background: rgba(255, 255, 255, 0.84);
		box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.12), 0px 2px 2px rgba(0, 0, 0, 0.14),
			0px 3px 1px -2px rgba(0, 0, 0, 0.2);
	}
	.header-content {
		height: 52px;
		margin: 0 auto;
		padding: 0 16px;
		max-width: 800px;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
	.header-content h1 {
		font-size: 24px;
		font-weight: 600;
	}
	.guess-list {
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		padding: 16px 8px;
		gap: 8px;
		max-width: 800px;
		height: calc(100vh - 142px);
		overflow-y: auto;
		overflow-x: hidden;
	}
	.footer {
		height: 142px; /* should be 104px */
		width: 100%;
		position: fixed;
		bottom: 0;
		background: rgba(255, 255, 255, 0.84);
		box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.12), 0px 4px 5px rgba(0, 0, 0, 0.14),
			0px 2px 4px -1px rgba(0, 0, 0, 0.2);
	}
	.footer-content {
		width: 100%;
		margin: 0 auto;
		max-width: 800px;
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
