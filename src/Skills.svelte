<script>
  import Separator from "./Separator.svelte";
  import { skillsItems } from "./skillsItems";
</script>

<div class="container">
  <Separator>
    <h2>Skills</h2>
  </Separator>
  <div class="row section">
    <div class="column title">
      <h3>Dev</h3>
    </div>
    <div class="column card">
      <ul>
        {#each skillsItems.dev as item}
          <li>
            {item}
          </li>
        {/each}
      </ul>
    </div>
  </div>
  <div class="row section">
    <div class="column title">
      <h3>IT</h3>
    </div>
    <div class="column card">
      <ul>
        {#each skillsItems.it as item}
          <li>
            {item}
          </li>
        {/each}
      </ul>
    </div>
  </div>

  <div class="row section">
    <div class="column title">
      <h3>Misc</h3>
    </div>
    <div class="column card">
      <ul>
        {#each skillsItems.misc as item}
          <li>
            {item}
          </li>
        {/each}
      </ul>
    </div>
  </div>
  <!-- <div class="column">
      <div class="row card">
        <h3>Dev</h3>
        <ul>
          {#each skillsItems.dev as item}
            <li>
              {item}
            </li>
          {/each}
        </ul>
      </div>
      <div class="row card">
        <h3>Misc</h3>
        <ul>
          {#each skillsItems.misc as item}
            <li>
              {item}
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>-->
</div>

<style>
  .container h2,
  h3 {
    text-align: center;
  }

  ul {
    margin: 0;
  }

  @media screen and (max-width: 767px) {
    .section {
    }

    .title {
      width: 100% !important;
      border-bottom: 2px solid #252728;
      align-items: center;
      justify-items: center;
      justify-content: center;
    }
    h3 {
      margin: 1rem 0;
    }
  }

  .section {
    margin-bottom: 4rem;
    border: 2px solid #252728;
  }
  .card {
    display: flex;
    flex-direction: column;
    padding: 2rem 20px;
    margin: 0 20px;
  }

  .title {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 25%;
    background-color: #1a1a1a4b;
    margin-bottom: 0;
    border-right: 2px solid #252728;
  }
</style>
