<style>
  .container h2, h3 {
    text-align: center;
  }
  
  .card {
      display: flex;
      flex-direction: column;      
      padding: 0 20px;
      margin: 0 20px;
  }
   
</style>

<script>
    import Separator from './Separator.svelte';
    import {skillsItems} from './skillsItems';
</script>  



 <div class="container">
    <Separator>
      <h2>Skills</h2>
    </Separator>
    <div class="row">
        <div class="column card">
            <h3>IT</h3> 
            <ul>
                {#each skillsItems.it as item}
                    <li>
                        {item}
                    </li>  
                {/each}                            
            </ul>   
        </div>
        <div class="column">
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
    </div>

</div>
