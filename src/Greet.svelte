<script>
  import { onMount } from "svelte";
  import { tick } from "svelte";
  import Prompt from "./Prompt.svelte";
  let animate = false;
  let skills = [
    "a web developer",
    "a network administrator and engineer",
    "an IT infraestructure administrator",
    "a game developer",
    "a devOps engineer",
    "a music maker",
    "a Linux, OSS, and DIY enthusiast",
    "a curious individual",
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
      tick: (t) => {
        const i = ~~(text.length * t);
        node.textContent = text.slice(0, i);
      },
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
      css: (t) => `
                  background-color: #6f4b86; 
                  color: #FFFFFF; 
                `,
    };
  }
</script>

<div class="container">
  <h2>Hello World</h2>
  <!-- <h2>
    I'm
    {#if animate}
      <span in:typewriter out:reverseTypewriter>{currentSkill}</span>
    {/if}
    <Prompt />
  </h2> -->

  <div class="row">
    <div class="column">
      <p>
        I’m a <strong>problem-solving</strong> web <strong>developer</strong>
        and <strong>IT generalist</strong> with over
        <strong>14+ years of technical expertise</strong>
        and hands-on experience. Passionate about
        <strong>
          Javascript, self-hosting, Linux, DIY projects, and free and
          open-source software (FOSS)</strong
        >, I thrive in environments where creativity and technical curiosity
        intersect.
      </p>
      <a href="#contact" id="contact-btn">
        <button style="width: 150px">Contact Me!</button>
      </a>
    </div>
  </div>
</div>

<style>
  a {
    color: inherit;
  }

  .container {
    text-align: center;
    margin-top: 40px;
  }

  button {
    background-color: #6f4b86;
    border-color: #6f4b86;
  }
  button:hover {
    background-color: #9b4dca;
    border-color: #9b4dca;
    color: white;
    cursor: pointer;
  }
</style>
