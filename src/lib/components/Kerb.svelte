<!-- A strip of track kerb in the livery colours, with the white track-limit line beside it -->
<div class="kerb" aria-hidden="true"></div>

<style>
	.kerb {
		height: 14px;
		border-top: 3px solid #f3f3ef;
		background: repeating-linear-gradient(100deg, var(--cyan) 0 52px, #f3f3ef 52px 104px);
		background-size: 211px 100%;
		animation: pass 7s linear infinite;
	}
	@keyframes pass {
		to {
			background-position: -211px 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.kerb {
			animation: none;
		}
	}
</style>
