<script>
  import { Link, Route } from "svelte-routing";
  import { useLocation } from "svelte-routing";
  const location = useLocation();
</script>

<div class="logoContainer">
  <!-- <a href="https://aboni.dev"> Alexis Boni</a> -->
  <h4>Alexis Boni</h4>
  <Link to="/" let:active>
    <div style={`color: ${active ? "#9b4dca" : "#606c76"}`}>Home</div>
  </Link>
  <Link to="/radio" let:active>
    <div style={`color: ${active ? "#9b4dca" : "#606c76"}`}>Radio</div>
  </Link>
</div>

<style>
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
