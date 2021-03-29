<script>
  import { portfolioItems } from "./portfolioItems";
  import PortfolioItem from "./PortfolioItem.svelte";
  import Separator from "./Separator.svelte";

  let filteredPortfolioItems = portfolioItems;
  let filter = "";
  let filterType = "All";
  let slotsArray = [];
  let fillerSlots = 3 - (filteredPortfolioItems.length % 3);

  // if(filteredPortfolioItems.length < 3) { fillerSlots = 3;}

  for (let index = 0; index < fillerSlots; index++) {
    slotsArray.push(index);
  }

  function handleSearch(event) {
    const value = event.target.value;
    if (value.length > 0) {
      // filteredPortfolioItems = portfolioItems.slice(0,2);

      switch (filterType) {
        case "Text":
          filteredPortfolioItems = portfolioItems.filter(
            (item) =>
              item.description.toLowerCase().includes(filter.toLowerCase()) ||
              item.title.toLowerCase().includes(filter.toLowerCase())
          );
          break;

        case "Tags":
          filteredPortfolioItems = portfolioItems.filter((item) =>
            item.skills.join("|").toLowerCase().includes(filter.toLowerCase())
          );
          break;

        default:
          filteredPortfolioItems = portfolioItems.filter(
            (item) =>
              item.description.toLowerCase().includes(filter.toLowerCase()) ||
              item.title.toLowerCase().includes(filter.toLowerCase()) ||
              item.skills.join("|").toLowerCase().includes(filter.toLowerCase())
          );
          break;
      }
    } else {
      filteredPortfolioItems = portfolioItems;
    }
  }
</script>

<div class="container">
  <Separator>
    <h2>Personal Projects</h2>
  </Separator>

  <div class="row">
    <div class="column column-20" />
    <div class="column column-40">
      <input
        bind:value={filter}
        on:input={handleSearch}
        placeholder="Search..."
      />
    </div>
    <div class="column column-25">
      <!-- <label for="ageRangeField">Age Range</label> -->
      <select
        id="ageRangeField"
        bind:value={filterType}
        on:change={handleSearch}
      >
        <option value="All">All</option>
        <option value="Text">Text</option>
        <option value="Tags">Tags</option>
      </select>
    </div>
    <div class="column column-20" />
  </div>

  {#each filteredPortfolioItems as item, i (item.id)}
    {#if (i + 1) % 3 === 1}
      <!-- content here -->
      <div class="row">
        <!-- Only for the last row -->
        {#if i + 3 >= filteredPortfolioItems.length}
          {#if filteredPortfolioItems.length % 3 === 1}
            <div class="column column-25" />
          {/if}
        {/if}

        {#each filteredPortfolioItems.filter((eachElem, index) => {
          return index < i + 3 && index >= i;
        }) as subItem, x (subItem.id)}
          <div class="column">
            <PortfolioItem item={subItem} />
          </div>
        {/each}

        <!-- Only for the last row -->
        {#if i + 3 >= filteredPortfolioItems.length}
          {#if filteredPortfolioItems.length % 3 === 1}
            <div class="column column-25" />
          {/if}
        {/if}

        <!-- {#if (i+1) % 3 === 1} -->
        <!-- {#if (i + 3 === filteredPortfolioItems.length + fillerSlots)}
                {#each slotsArray as slot}                
                   <div class="column">                
                   </div>     
                {/each}  
              {/if}               -->
      </div>
    {/if}
  {/each}
</div>

<style>
  .container h2 {
    text-align: center;
  }

  .row .column {
    margin-bottom: 40px !important;
  }
  /* .container {
    display: flex;

  } */

  input,
  select {
    color: #d6dbdd !important;
  }
</style>
