import { browser } from '$app/environment';
import { writable } from "svelte/store";

const storedWin = browser ? window.localStorage.getItem('win') ?? false : false;
const win = writable(storedWin);

win.subscribe((value) => {
	if (browser) {
		window.localStorage.setItem('win', value);
	}
});

export default win;
// todo manage entire game state here
// todo check for game state on load