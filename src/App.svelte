<script>
  import { Router, Link, Route } from "svelte-routing";
  import Home from "./Home.svelte";
  import Radio from "./Radio.svelte";
  import Nav from "./Nav.svelte";

  export let url = "";
  console.log(url);
</script>

<Router {url}>
  <div class="main">
    <Nav />
    <Route path="/radio" component={Radio} />
    <Route path="/"><Home /></Route>
  </div>
</Router>

<style>
  .main {
    background: #1d1f21 !important;
  }
</style>
