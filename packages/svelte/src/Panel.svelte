<script>
	function add(a, b) {
		return a + b;
	}
</script>

{#snippet add(a, b)}
	{a} + {b} = {add(a, b)}
{/snippet}