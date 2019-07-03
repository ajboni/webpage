<script>
  import { onMount } from "svelte";
  import { tick } from "svelte";
  import Prompt from "./Prompt.svelte";
  let animate = false;
  let skills = [
    "a web developer",
    "a network administrator and engineer",
    "a game developer",
    "a devOps engineer",
    "a music maker",
    "Linux, OSS, and DIY enthusiast"
  ];
  let currentSkill = skills[0];
  let currentSkillIndex = 0;

  onMount(() => {
    animate = true;
    setTimeout(() => {
      // console.log("Animate OUT");
      animate = false;
    }, 3800);

    setInterval(() => {
      // console.log("Animate IN");
      cycleSkills();
      animate = true;
      setTimeout(() => {
        animate = false;
        // console.log("Animate OUT");
      }, 3500);
    }, 6000);
  });

  function cycleSkills() {
    if (currentSkillIndex >= skills.length - 1) {
      currentSkillIndex = -1;
    }
    currentSkillIndex++;
    currentSkill = skills[currentSkillIndex];
  }

  function typewriter(node, { speed = 50 }) {
    const text = node.textContent;
    const duration = text.length * speed;
    return {
      duration,
      tick: t => {
        const i = ~~(text.length * t);
        node.textContent = text.slice(0, i);
      }
    };
  }

  function reverseTypewriter(node, { speed = 50 }) {
    const text = node.textContent;
    const duration = text.length * speed;
    const o = +getComputedStyle(node).opacity;
    // node.textContent = "";
    return {
      duration: duration,
      delay: 300,
      css: t => `
                  background-color: #9b4dca; 
                  color: #FFFFFF; 
                `
    };
  }
</script>

<style>
  .container {
    text-align: center;
    margin-top: 40px;
  }
</style>

<div class="container">
  <h3>Hello</h3>
  <h1>
    I'm
    {#if animate}
      <span in:typewriter out:reverseTypewriter> {currentSkill} </span>
    {/if}
    <Prompt />
  </h1>

  <div class="row">
    <div class="column">
      <p in:typewriter>
        I'm a 33 years old IT Professional with over 10 years of hands-on
        experience.
        <br />
        I'm currently learning skills about webdev, devOps, kubernetes, gamedev,
        music production and linux.
        <br />
        I'm a self-hosted, DIY and FOSS ethusiast and always looking for fun
        projects.
      </p>
      <button>Contact Me!</button>
    </div>

  </div>
</div>
