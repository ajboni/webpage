<script>
export let time = 250;

let prompt = "\xa0\xa0";
   setInterval(()=> {    
        if(prompt == "\xa0\xa0") { prompt = "_" } 
        else prompt = "\xa0\xa0";
   },time);
</script>

<span>{prompt}</span>
