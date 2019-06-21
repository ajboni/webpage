<style>
  .row {
    margin-top: 80px;
    margin-bottom: 20px;
  }
  hr {
     background: linear-gradient(to right, transparent, rgb(211, 212, 222), transparent);
     width: 80%;
     margin-right: 20px;
     margin-left: 20px;
      height: 1px;
  }

</style>

<div class="row">
  <div class="column"><hr></div>
  <div class="column"> <slot></slot> </div>
  <div class="column"> <hr></div>  
</div>