<style>
   .prompt.invisible {
      color: transparent;
   }
</style>

<script>
   export let time = 250;
   let prompt = "";
      setInterval(()=> {    
         if(prompt == "visible") { prompt = "invisible" } 
         else prompt = "visible";
      },time);
</script>

<span class="prompt {prompt}">_</span>
