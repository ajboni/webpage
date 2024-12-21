<script>
  import active from "svelte-spa-router/active";
  import { link } from "svelte-spa-router";
</script>

<div class="logoContainer">
  <h4>Alexis Boni</h4>
  <a href="/" use:link use:active>Home</a>
  <a href="/radio" use:link use:active>Radio</a>
</div>

<style>
  :global(a.active) {
    color: #9b4dca;
  }
  :global(a:not(.active)) {
    color: #606c76;
  }

  .logoContainer {
    position: relative;
    height: 60px;
    z-index: 100;
    display: flex;
    align-items: center;
    padding: 20px;
    border-bottom: 2px solid #252728;
    background-color: #1a1a1d;
    gap: 2rem;
  }
  h4 {
    margin: 0px;
  }
</style>
