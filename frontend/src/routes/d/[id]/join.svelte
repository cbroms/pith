<script>
	let name = ""

	const onSubmit = () => {
		submitNickname(name)
		name = ""
	}

	const onKeydown = (e) => {
		if (e.key === "Enter") onSubmit()
	}
</script>

<div>
	<h1>Create a nickname</h1>
	<p>Your nickname will be used to identify your contributions in the discussion.</p>
	<input placeholder="type a nickname..." bind:value={name} on:keydown={onKeydown}>
	<button on:click={onSubmit}>Join Discussion</button>
</div>