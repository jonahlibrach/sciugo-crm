const prompt = require('prompt-sync')({eot:true});

while(true){
  const IN = prompt('Enter something:');
  if(IN === 'q'){
    break;
  }else{
    console.log("Hello, '"+IN+"'");
  }
}
