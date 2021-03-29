<script>
  import LogoNav from "./Nav.svelte";
  import Greet from "./Greet.svelte";
  import Portfolio from "./Portfolio.svelte";
  import Contact from "./Contact.svelte";
  import Footer from "./Footer.svelte";
  import Skills from "./Skills.svelte";
  export let name;
</script>

<div class="mainContainer">
  <LogoNav />
  <Greet />
  <Skills />
  <Portfolio />
  <Contact />
  <Footer />
</div>

<style>
  .mainContainer {
    background-color: #1d1f21 !important;
    color: #d6dbdd !important;
    font-family: "Droid Sans Mono", "monospace", monospace,
      "Droid Sans Fallback";
    font-weight: normal;
    font-size: 1.08em;
  }

  :global(::-moz-selection) {
    /* Code for Firefox */
    background-color: #6f4b86;
  }

  :global(h2) {
    font-size: 3.5rem;
    line-height: 1.6;
  }

  :global(::selection) {
    background-color: #6f4b86;
  }
</style>
