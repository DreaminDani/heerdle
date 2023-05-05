<script>
	/*
  Source: https://github.com/stephane-vanraes/svelte-progresscircle
  */
	export let value = 0;
	export let max = 100;

	$: progressPath = () => {
		if (value <= 0) {
			return '';
		} else if (value >= max) {
			return 'M50,5A45 45 0 1 1 49.9999 5';
		} else {
			const angle = Math.PI * 2 * (value / max);
			const x = 50 + Math.cos(angle - Math.PI / 2) * 45;
			const y = 50 + Math.sin(angle - Math.PI / 2) * 45;

			let path = 'M50,5';

			if (angle > Math.PI) {
				path += 'A45 45 0 0 1 50 95';
			}

			path += `A45 45 0 0 1 ${x} ${y}`;

			return path;
		}
	};
</script>

<div class="container">
	<svg viewBox="0 0 100 100">
		<path d="M50,5A45 45 0 1 1 49.9999 5" />
		<path d={progressPath()} />
	</svg>
	<div class="content">
		<slot class="slot" />
	</div>
</div>

<style>
	.container {
		position: relative;
		top: -45px;
		width: 85px;
		height: 85px;
		background: #fff;
		border-radius: 100px;
	}
	.content {
		text-align: center;
	}
	svg {
		fill: var(--progress-fill, transparent);
		height: 100%;
		position: absolute;
		stroke-linecap: var(--progress-linecap, square);
		width: 100%;
	}
	path:first-child {
		stroke: #ffffff;
		stroke-width: var(--progress-trackwidth, 10px);
	}
	path:last-child {
		stroke: #056137;
		stroke-width: var(--progress-width, 10px);
	}
	div {
		height: 100%;
		position: relative;
		width: 100%;
	}
	span {
		left: 50%;
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
	}
</style>
