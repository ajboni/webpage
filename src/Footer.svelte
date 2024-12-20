<footer>
  <div class="footer-copyright">© Alexis Boni 2025</div>
  <div class="footer-copyright">
    Made with
    <img src="./img/icons8-heart-100.png" alt="love" />
    {" with "}
    <a href="https://svelte.dev/" alt="Svelte">Svelte</a>
    and
    <a href="https://milligram.io/" alt="Milligram">Milligram</a>
    - Icons from
    <img src="./img/icons8-icons8-100.png" alt="icons8" />
    <a href="https://icons8.com" alt="Icons8">Icons8</a>
    .
  </div>
</footer>

<style>
  @media screen and (max-width: 767px) {
    .footer-copyright {
      flex-direction: row;
      justify-content: center;
      flex-wrap: wrap;
    }
  }
  footer {
    margin-top: 100px;
    height: 100px;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    border-top: 2px solid #252728;
    background-color: #1a1a1d;
    font-size: 90%;
  }
  .footer-copyright {
    color: rgb(99, 99, 102);
    text-align: center;
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }
  img {
    width: 20px;
    height: 20px;
    margin: 0px 5px;
  }

  a {
    margin: 0 5px;
  }
</style>
