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
  import PortfolioItem from './PortfolioItem.svelte';
  import Separator from './Separator.svelte';
  let fillerSlots = 3 - portfolioItems.length % 3;
  let slotsArray = [];
  for (let index = 0; index < fillerSlots; index++) {
   slotsArray.push(index)
    
  }
 
</script>

<div class="container">
    <Separator>
      <h2>Portfolio</h2>
    </Separator>
    {#each portfolioItems as item,i (item.id)}
      {#if (i+1) % 3 === 1}
        <!-- content here -->        
        <div class="row">
          {#each portfolioItems.filter((eachElem, index) => {
            return index < i + 3 && index >= i
            }) as subItem,x (subItem.id)}
              <div class="column">                
                <PortfolioItem item={subItem}/>
              </div>     
          {/each}
               <!-- {#if (i+1) % 3 === 1} -->
               {#if (i + 3 === portfolioItems.length + fillerSlots)}
                {#each slotsArray as slot}                
                   <div class="column">                
                   </div>     
                {/each}  
              {/if}
        </div>
      {/if}
    {/each}  

  

</div>