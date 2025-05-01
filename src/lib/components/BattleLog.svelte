<script>
  import { onMount, afterUpdate } from 'svelte';
  
  export let messages = [];
  
  let logElement;
  
  // Scroll to bottom when messages change
  afterUpdate(() => {
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