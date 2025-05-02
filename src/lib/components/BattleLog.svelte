<script>
  // Props for the component
  let { messages = [] } = $props();

  // Reference to the log element for auto-scrolling
  let logElement;

  // Auto-scroll to bottom when messages change
  $effect(() => {
    if (logElement && messages.length > 0) {
      logElement.scrollTop = logElement.scrollHeight;
    }
  });
</script>

<div
  bind:this={logElement}
  class="border rounded-md p-2 h-32 overflow-y-auto bg-gray-50 mb-4"
>
  {#each messages as message}
    <div class="mb-1">{message}</div>
  {/each}

  {#if messages.length === 0}
    <div class="text-gray-400 italic">No messages yet.</div>
  {/if}
</div>

<style>
  /* Smooth scrolling for battle log */
  div {
    scroll-behavior: smooth;
  }
</style>
