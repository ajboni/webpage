<style>
  footer {
    margin-top: 100px;
    height: 100px;
    border-top: 1px solid;
    border-top-color: rgb(211, 212, 222);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: rgb(242, 245, 248);
  }
  .footer-copyright {
    color: rgb(99, 99, 102);
    text-align: center;
    display: flex;
    align-items: center;
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

<footer>
  <div class="footer-copyright">© Alexis Boni 2019</div>
  <div class="footer-copyright">
    Made with
    <img src="./img/icons8-heart-100.png" alt="love" />
    {' with '}
    <a href="https://svelte.dev/" alt="Svelte">Svelte</a>
    and
    <a href="https://milligram.io/" alt="Milligram">Milligram</a>
    - Icons from
    <img src="./img/icons8-icons8-100.png" alt="icons8" />
    <a href="https://icons8.com" alt="Icons8">Icons8</a>
    .
  </div>
</footer>
