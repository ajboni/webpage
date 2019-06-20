<style>
  .container h2 {
    text-align: center;
}

.row {
  text-align: center;
}

a {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: gray;
}

</style>
  
<script>
  import {contactItems} from './contactItems';
  import ContactForm from './ContactForm.svelte';
</script>

<div class="container">
  <div class="row">
    <div class="column">
      <h2>Contact</h2>
    </div>
  </div>

  <div class="row">
    {#each contactItems as item,i }
      <div class="column" >
          <a href={item.url} target="__blank"><img src={item.img} alt={item.title}>{item.title}</a>
      </div>
    {/each}
  </div>

  <ContactForm/>

</div>