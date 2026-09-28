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
    "an AI and agentic developer",
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
  <h1 class="headline">
    I build web apps, dev tools, and the infrastructure behind them.
  </h1>
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
        <strong>16+ years of technical expertise</strong>
        and hands-on experience. Passionate about
        <strong>
          Javascript, self-hosting, Linux, DIY projects, and free and
          open-source software (FOSS)</strong
        >, I thrive in environments where creativity and technical curiosity
        intersect. These days I also build with
        <strong>AI and agentic workflows</strong> where they add real value,
        always on top of solid engineering fundamentals.
      </p>

      <div class="cta-row">
        <a href="#contact" class="cta cta-primary">Contact me</a>
        <a
          href="https://www.linkedin.com/in/alexis-boni/"
          target="__blank"
          rel="noopener"
          class="cta">View my experience</a
        >
        <a href="#projects" class="cta">See projects</a>
      </div>
    </div>
  </div>
</div>

<style>
  .container {
    text-align: center;
    margin-top: 40px;
  }

  .headline {
    font-size: 2.2rem;
    line-height: 1.3;
    font-weight: 600;
    max-width: 820px;
    margin: 0 auto 2rem auto;
  }

  .cta-row {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 1.5rem;
  }

  a.cta {
    display: inline-block;
    padding: 1rem 2rem;
    border: 2px solid #6f4b86;
    border-radius: 4px;
    color: #d6dbdd;
    text-decoration: none;
    font-weight: 600;
    transition: background-color 0.2s, border-color 0.2s, color 0.2s;
  }

  a.cta:hover,
  a.cta:focus {
    background-color: #9b4dca;
    border-color: #9b4dca;
    color: white;
  }

  a.cta-primary {
    background-color: #6f4b86;
    border-color: #6f4b86;
    color: white;
  }

  @media screen and (max-width: 767px) {
    .headline {
      font-size: 1.6rem;
    }
    .cta-row {
      flex-direction: column;
      align-items: center;
    }
    a.cta {
      width: 100%;
      max-width: 320px;
    }
  }
</style>
