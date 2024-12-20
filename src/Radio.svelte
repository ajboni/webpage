<script>
  import { onMount, onDestroy } from "svelte";

  // Props
  export let playlistId = "PLanxhTsICXCzmyo7HL1QZFFQZOX6rz4gP";
  export let showControls = true;

  let player;
  let playerContainer;
  let showSplash = true;
  let isPlaying = false;

  const startPlaying = () => {
    if (player) {
      player.unMute();
      player.playVideo();
      showSplash = false;
      isPlaying = true;
    }
  };
  onMount(() => {
    // Initialize player when API is ready
    console.log("Create player");
    player = new YT.Player(playerContainer, {
      height: "100%",
      width: "100%",
      playerVars: {
        listType: "playlist",
        list: playlistId,
        autoplay: 0, // Changed to 0 to prevent autoplay
        mute: 0, // No need to mute since we're not autoplaying
        controls: showControls ? 1 : 0,
        modestbranding: 1,
        showinfo: 0,
        rel: 0,
        loop: 1,
        playsinline: 1,
      },
      events: {
        onReady: (event) => {
          event.target.cuePlaylist({ list: playlistId });
        },
      },
    });
  });
  // Video control functions
  function togglePlay() {
    // If first time trigger startPlaying instead to remove the splash screen
    if (showSplash) {
      startPlaying();
      return;
    }
    if (player?.getPlayerState() === 1) {
      pauseVideo();
    } else {
      playVideo();
    }
  }

  function playVideo() {
    player?.playVideo();
    isPlaying = true;
  }

  function pauseVideo() {
    player?.pauseVideo();
    isPlaying = false;
  }

  function nextVideo() {
    player?.nextVideo();
  }

  function previousVideo() {
    player?.previousVideo();
  }
</script>

<div class="radio-container crt">
  {#if showSplash}
    <img
      style="position: absolute; width: 100vw; height: 100vh; top: 0px; left: 0px; object-fit: cover; z-index: 97;"
      src="/img/gif/cover.gif"
      alt=""
    />
  {/if}

  <div class="controls">
    <div class="previous" on:click={previousVideo}>
      <svg class="icon" viewBox="0 0 24 24">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
      </svg>
    </div>
    <div class="play" on:click={togglePlay}>
      <svg class="icon play-icon" viewBox="0 0 24 24">
        {#if !isPlaying}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
            />
          </svg>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 5.25v13.5m-7.5-13.5v13.5"
            />
          </svg>
        {/if}
      </svg>
    </div>
    <div class="next" on:click={nextVideo}>
      <svg class="icon" viewBox="0 0 24 24">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m8.25 4.5 7.5 7.5-7.5 7.5"
          />
        </svg>
      </svg>
    </div>
  </div>
  <div
    style="pointer-events: none; user-select: none; z-index: -1; border-radius: 8px; width: 100vw; height: 200vw;"
  ></div>
  <!-- <div id="yt-wrapper" bind:this={playerContainer}></div> -->

  <div
    style="position: fixed; inset: 0px; display: flex; align-items: center; justify-content: center; z-index: 0; background: black;"
    class="yt-wrapper"
  >
    <div
      style="width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center; border-radius: 8px;"
    >
      <div
        style="pointer-events: none; user-select: none; z-index: -1; border-radius: 8px; width: 100vw; height: 200vw;"
      >
        <div style="width: 100%; height: 100%;">
          <div id="yt-wrapper" bind:this={playerContainer}></div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .controls {
    width: 100%;
    height: 100%;
    z-index: 98;
    position: fixed;
    opacity: 0.5;
    display: flex;
    gap: 10rem;
  }
  .previous,
  .next {
    flex-grow: 0;
    width: 10%;
    height: 100%;
    cursor: pointer;
    position: relative;
  }
  .play {
    flex-grow: 1;
    height: 100%;
    cursor: pointer;
    position: relative;
  }

  .icon {
    color: white;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    width: 48px;
    height: 48px;
  }
  .icon.play-icon {
    top: 60%;
    left: 50%;
    transform: translate(-50%, -60%);
  }

  .previous:hover .icon,
  .play:hover .icon,
  .next:hover .icon {
    opacity: 1;
  }

  .radio-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    position: fixed;
    top: 0px;
    left: 0;
    right: 0;
    bottom: 0;
    animation: crtAnimation 1.2s 0.2s both;
    animation-timing-function: ease;
    animation-timing-function: cubic-bezier(0.2, -0.1, 0, 1);
    overflow: hidden;
  }

  #radio-footer {
    position: absolute;
    z-index: 50;
    background-color: black;
    top: calc(100vh - 60px);
    left: 0;
    right: 0;
    bottom: 0;
  }

  #yt-wrapper {
    height: 100%;
    width: 100%;
    overflow: hidden;
    aspect-ratio: 16/9;
    pointer-events: none;
  }

  #yt-iframe {
    width: 100%;
    height: 100%;
  }

  .crt {
    overflow: hidden;
    filter: contrast(1.1) brightness(0.9) saturate(1.2);
  }

  .crt::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.05),
      rgba(255, 255, 255, 0.05) 1px,
      transparent 1px,
      transparent 2px
    );
    z-index: 2;
    pointer-events: none;
  }

  .crt::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle,
      rgba(0, 0, 0, 0.3) 0%,
      rgba(0, 0, 0, 0.3) 70%,
      rgba(0, 0, 0, 0.5) 100%
    );
    z-index: 3;
    pointer-events: none;
    mix-blend-mode: multiply;
  }

  .crt::before,
  .crt::after {
    filter: blur(0.5px);
  }
</style>
