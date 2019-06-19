<style>
  .container h2 {
    text-align: center;
  }
  /* .container {
    display: flex;

  } */
</style>
  
<script>
  import {portfolioItems} from './portfolioItems';
</script>

<div class="container">
  <div class="row">
    <div class="column">
      <h2>Portfolio</h2>
    </div>
  </div>

    {#each portfolioItems as item,i (item.id)}
      {#if (i+1) % 3 === 1}
        <!-- content here -->        
        <div class="row">
            <!-- <div class="column">
              {portfolioItems[i].id}
            </div>   
             -->
          {#each portfolioItems.filter((eachElem, index) => {
            return index < i + 3 && index >= i
            }) as subItem,x (subItem.id)}
              <div class="column">
                {subItem.id}
              </div>          
          {/each}
        </div>
      {/if}
    {/each}  
  

</div>