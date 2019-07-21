<script>
  export let item;
</script>

<style>
  .card {
    border-radius: 3px;
    /* border: 1px solid black; */
    /* padding: 10px; */
    margin-bottom: 15px;
    min-height: 100%;

    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
    display: flex;
    flex-direction: column;
    padding: 10px;
    /* background-color:rgba(238, 149, 167, 0.116); */
  }

  .title {
    border-bottom: 1px solid #f7f7f7;
    padding-bottom: 10px;
    align-content: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 4em;
    align-items: center;
  }

  .title img {
    width: 25px;
    height: 25px;
  }

  .title a {
    text-decoration: none;
    margin: 0;
    padding: 0;
    color: inherit;
    text-align: center;
  }

  .img {
    padding: 20px;
    text-align: center;
  }
  .img img {
    /* align-self: center; */
    width: 100%;
    border-radius: 4px;
    transition: all 0.2s ease-out;
    opacity: 0.9;
    max-height: 250px;
    width: 250px;
    object-fit: contain;
    border: 1px solid #ddd;
  }
  .img img:hover {
    transform: scale(1.1);
    opacity: 1;
  }

  div {
    /* width: 100%; */
  }
  .description {
    /* font-size: 80%; */
    padding: 10px;
  }

  .skills {
    max-width: 100%;
    display: flex;
    flex-wrap: wrap;
    padding: 5px 10px 0px 10px;
  }

  .skill {
    background-color: #eee;
    border-radius: 3px;
    color: #999;
    transition: color 0.2s;
    margin: 0 5x 5px 0;
    padding: 2px 8px;
    margin-bottom: 10px;
    margin-right: 10px;
    position: relative;
    font: 12px/1.5 "PT Sans", serif;
    /* border-radius: 32px;     */
  }

  .skill:hover {
    background-color: #9b4dca;
    color: white;
  }
</style>

<div class="card">

  <div class="title">
    <img src={item.icon} alt={''} />
    <a href={item.url} target="__blank"> {item.title} </a>
  </div>
  <div class="img">
    <a href={item.url} target="__blank">
      <img src={item.img} alt={item.title} />
    </a>
  </div>
  <div class="description"> {item.description} </div>
  <div class="skills">
    {#each item.skills as skill}
      <div class="skill"> {skill} </div>
    {/each}
  </div>
</div>
