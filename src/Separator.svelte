<div class="row">
  <div class="column"><hr /></div>
  <div class="column"><slot /></div>
  <div class="column"><hr /></div>
</div>

<style>
  .row {
    margin-top: 80px;
    margin-bottom: 20px;
  }
  hr {
    background: linear-gradient(
      to right,
      transparent,
      rgb(71, 71, 77),
      transparent
    );
    width: 80%;
    margin-right: 20px;
    margin-left: 20px;
    height: 2px;
    border-top: unset !important;
  }
</style>
