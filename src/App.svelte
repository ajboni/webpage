<script>
  import Router from "svelte-spa-router";
  import Home from "./Home.svelte";
  import Radio from "./Radio.svelte";
  import Nav from "./Nav.svelte";

  export let url = "";

  const routes = {
    "/": Home,
    "/radio": Radio,
    "*": Home,
  };
</script>

<div class="main">
  <Nav />
  <Router {routes}></Router>
</div>

<style>
  .main {
    background: #1d1f21 !important;
  }
</style>
