<script>
	// @ts-nocheck
	import { browser } from '$app/environment';
	import { writable } from 'svelte/store';
	import { defaultGameState } from '$lib/defaults.js';
	import infoIcon from '../icons/info.svg?raw';
	import githubIcon from '../icons/github.svg?raw';
	import playIcon from '../icons/Play.svg?raw';
	import pauseIcon from '../icons/Pause.svg?raw';
	import AutoComplete from '$lib/AutoComplete.svelte';
	import Guess from '$lib/guess.svelte';
	import ProgressCircle from '$lib/progressCircle.svelte';

	export let data;
	let { gamestate, options, tracks } = data;
	const date = new Date();
	const today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

	let win = defaultGameState.win;
	let revealed = defaultGameState.revealed;
	let guesses = defaultGameState.guesses;
	let endTime = defaultGameState.endTime;
	let skipTime = defaultGameState.skipTime;

	if (gamestate.date && gamestate.date === today) {
		let { win, revealed, guesses, endTime, skipTime } = gamestate;
	} else {
		gamestate = defaultGameState;
		gamestate.date = today;
		if (browser) {
			document.cookie = `gamestate=${JSON.stringify(gamestate)};path=/`;
		}
	}
	const track = tracks[gamestate.date];

	const game = writable(gamestate);
	game.subscribe((value) => {
		guesses = value.guesses;
		endTime = value.endTime;
		skipTime = value.skipTime;
		win = value.win;
		revealed = value.revealed;
		if (browser) {
			document.cookie = `gamestate=${JSON.stringify(value)};path=/`;
		}
	});

	const artists = track.artists.map((artist) => artist.name);
	const year = track.album.release_date.split('-')[0];

	let player;
	let paused;
	let currentTime;
	let selectedTrack = {};

	let shareMessage = 'Share Result';

	function reveal() {
		if (guesses.length < 6) {
			game.set({
				...gamestate,
				guesses: [...guesses, { name: 'Skipped', id: `skip${skipTime}` }],
				revealed: true
			});
		} else {
			game.set({ ...gamestate, guesses, revealed: true });
		}
	}

	function isArtistMatch(guess) {
		return guess.artists.some((n) => track.artists.some((h) => h.id === n.id));
	}

	function next(skipped) {
		if (guesses.length < 5) {
			if (skipped) {
				game.set({
					...gamestate,
					guesses: [...guesses, { name: 'Skipped', id: `skip${skipTime}` }],
					endTime: endTime + skipTime,
					skipTime: skipTime + 1
				});
			} else {
				game.set({
					...gamestate,
					guesses: guessesForStorage(),
					endTime: endTime + skipTime,
					skipTime: skipTime + 1
				});
				selectedTrack = {};
			}
			if (player && player.paused) {
				player.currentTime = 0;
			}
		} else {
			reveal();
		}
	}

	function guessesForStorage() {
		return [
			...guesses,
			{
				name: selectedTrack.name,
				id: selectedTrack.id,
				artists: selectedTrack.artists.map((value) => {
					return { name: value.name, id: value.id };
				})
			}
		];
	}

	function guess() {
		if (Object.keys(selectedTrack).length !== 0) {
			if (!guesses.find((guess) => guess.id === selectedTrack.id)) {
				if (selectedTrack.id === track.id) {
					game.set({
						...gamestate,
						win: true,
						revealed: true,
						guesses: guessesForStorage(),
						endTime,
						skipTime
					});
				} else {
					next(false);
				}
			} else {
				selectedTrack = {};
			}
		}
	}

	function skip() {
		next(true);
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

	function playback() {
		if (!currentTime) {
			paused = false;
		} else {
			paused = !paused;
		}
	}

	function share() {
		if (guesses.length < 6) {
			guesses.length = 6;
		}
		let shareText;
		if (win) {
			shareText = '🎉';
		} else {
			shareText = '👂';
		}

		for (let i = 0; i < guesses.length; i++) {
			if (guesses[i] && guesses[i].id === track.id) {
				shareText += '🟩';
			} else if (guesses[i] && guesses[i].id.startsWith('skip')) {
				shareText += '⬛';
			} else if (guesses[i] && isArtistMatch(guesses[i])) {
				shareText += '🟨';
			} else if (guesses[i]) {
				shareText += '🟥';
			} else {
				shareText += '⬜️';
			}
		}
		shareText += ` #heerdle${date.getMonth() + 1}${date.getDate()}`;
		shareText += '\n\nheerdle.playaheadgames.com';

		navigator.clipboard.writeText(shareText);
		shareMessage = 'Copied to Clipboard';
	}

	function getNextHeerdle() {
		const now = new Date();
		const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
		const diff = Math.abs(midnight - now);

		const hours = Math.floor(diff / 3.6e6);
		const minutes = Math.floor((diff % 3.6e6) / 6e4);

		return `${hours} hours and ${minutes} minutes`;
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
			<img height="160" width="160" alt="album cover" src={track.album.images[0].url} />
			<h1>{track.name}</h1>
			<h2>{artists.join(', ')}</h2>
			<h2>{year}</h2>
			<div class="score">
				{#if win}
					<p>
						You got today's heerdle within {endTime}
						{endTime > 1 ? 'seconds' : 'second'}.
					</p>
				{:else}
					<p>Better luck next time!</p>
				{/if}
				<button class="button secondary" on:click={share}>{shareMessage}</button>
			</div>
		</div>
		<div class="footer end">
			<div class="footer-content">Next Heerdle is at midnight local time ({getNextHeerdle()})</div>
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
					style={'display: none'}
					bind:currentTime
					bind:paused
					on:play={playCheck}
					on:timeupdate={controlTime}
					controls
					src={track['preview_url']}
				/>
				<div class="controls">
					<button class="button secondary" on:click={skip}>
						{#if guesses.length < 5}
							Skip (+{skipTime}s)
						{:else}
							Reveal
						{/if}
					</button>
					<ProgressCircle max="16" value={currentTime}>
						<button on:click={playback} class="play-button">
							{#if currentTime === undefined || paused}
								{@html playIcon}
							{:else}
								{@html pauseIcon}
							{/if}
						</button>
					</ProgressCircle>
					<button class="button primary" on:click={guess}>Guess</button>
				</div>
				<AutoComplete
					placeholder="Know it? Search for artist/title..."
					delay="200"
					showClear={true}
					items={options}
					bind:selectedItem={selectedTrack}
					labelFieldName="searchable"
				/>
				<button class="reveal" on:click={reveal}>Don't know it? Reveal the answer...</button>
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
	button {
		background: none;
		color: inherit;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		outline: inherit;
	}
	.button {
		min-width: 100px;
		box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.12), 0px 2px 2px rgba(0, 0, 0, 0.14),
			0px 3px 1px -2px rgba(0, 0, 0, 0.2);
		border-radius: 100px;
		font-weight: 700;
		font-size: 14px;
		line-height: 19px;
		text-align: center;
		padding: 8px 12px;
	}
	.button.primary {
		background: #08aeea;
		color: #fff;
	}
	.button.secondary {
		background: rgba(255, 255, 255, 0.6);
		color: rgba(16, 24, 40, 0.8);
	}
	.play-button {
		position: relative;
		top: 2.74px;
	}
	:global(.autocomplete-list) {
		max-height: 200px !important;
		border-radius: 8px;
	}
	:global(.autocomplete::after) {
		display: none !important;
	}
	:global(.autocomplete-input) {
		border: none;
		box-shadow: 0px 0px 0px 1px #e0e0e0;
		border-radius: 8px;
	}
	:global(.autocomplete-clear-button) {
		color: rgba(0, 0, 0, 0.54) !important;
		top: 44% !important;
	}
	:global(.autocomplete-list-item.selected) {
		background: #08aeea !important;
	}
	.end-screen {
		padding: 16px 8px;
		align-items: center;
		text-align: center;
		display: flex;
		flex-direction: column;
	}
	.end-screen img {
		box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 1px rgba(0, 0, 0, 0.14),
			0px 2px 1px -1px rgba(0, 0, 0, 0.2);
	}
	.end-screen h1 {
		margin-top: 8px;
		font-weight: 600;
		font-size: 24px;
		line-height: 33px;
	}
	.end-screen h2 {
		font-weight: 700;
		font-size: 14px;
		line-height: 19px;
	}
	.end-screen .score {
		margin-top: 80px;
	}
	.end-screen p {
		margin-bottom: 12px;
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
	.footer.end {
		height: 51px;
		width: 100% !important;
		text-align: center;
		display: flex;
		align-items: center;
	}
	.footer-content {
		width: calc(100%-8px);
		padding: 0 8px;
		margin: 0 auto;
		max-width: 800px;
		display: flex;
		flex-direction: column;
	}
	.reveal {
		text-decoration: underline;
		margin-top: 16px;
	}
	.controls {
		display: flex;
		justify-content: space-between;
		height: 2.2em;
		margin-top: 8px;
		margin-bottom: 12px;
	}
</style>
