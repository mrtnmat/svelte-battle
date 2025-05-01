<script>
  let {messages = []} = $props();
  
  let logElement;
  
  // Using $effect instead of afterUpdate
  $effect(() => {
    if (logElement) {
      logElement.scrollTop = logElement.scrollHeight;
    }
  });
</script>

<div bind:this={logElement} class="border rounded-md p-2 h-32 overflow-y-auto bg-gray-50 mb-4">
  {#each messages as message}
    <div class="mb-1">{message}</div>
  {/each}
</div>