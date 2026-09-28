<script>
  import { contactItems } from "./contactItems";
  import ContactForm from "./ContactForm.svelte";
  import Separator from "./Separator.svelte";
  import { reveal } from "./reveal";
</script>

<div class="container" id="contact">
  <Separator>
    <h2>Contact me</h2>
  </Separator>

  <div class="row contact-row">
    {#each contactItems as item, i}
      <div class="column" use:reveal={{ delay: i * 60 }}>
        <a href={item.url} target="__blank"
          ><img src={item.img} alt={item.title} />{item.title}</a
        >
      </div>
    {/each}
  </div>

  <ContactForm />
</div>

<style>
  @media screen and (max-width: 767px) {
    .contact-row {
      flex-direction: row;
      flex-wrap: wrap;
    }
    .contact-row .column {
      width: 33.33%;
    }
  }

  .container h2 {
    text-align: center;
  }

  .row {
    text-align: center;
  }

  a,
  a:focus,
  a:hover {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: gray !important;
  }
</style>
