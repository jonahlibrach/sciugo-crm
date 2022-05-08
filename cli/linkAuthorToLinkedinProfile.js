let chalk = require('chalk');
let axios = require('axios');
//const readline = require('readline');
/*
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});*/

let suffix = {1:'st',2:'nd',3:'rd'}

let choicePrompt = "Choose entry [b]number, use b if choosing option from bad.\n";

function parseChoiceToPath(input){
  let path = ['good'];
  let trimmed = input.trim();
  let toParseInt = input;
  if( trimmed[0] === 'b' ){
    path[0] = 'bad';
    toParseInt = input.slice(1);
  }

  let index = Number(toParseInt);

  path.push(index);

  return path;

}




function main(results,_id,rl){
  if( !_id ){
    throw Error("Cannot link to an author without an _id.");
  }

  ['good','bad'].forEach(listName => {

    console.log(chalk.bold(listName));
    let list = results[listName];
    list.forEach(person => {
      console.log(chalk.blue.bold(person.name) + ' · ' + person.distance + suffix[person.distance])
      console.log(person.headline)
      console.log('\n');
    })
    console.log('\n----\n')


    const linkResult = function(input){
      if(input === 'q'){
        rl.close();
      }else{
        let path = parseChoiceToPath(input);
        let choice = results[ path[0] ][ path[1] ];
        if(!choice){
          console.log(chalk.red.bold("Choice not found."));
          rl.question(choicePrompt,linkResult);
        }else{


          axios.post('http://localhost:4444/set',{
            _id,
            type:'people',
            properties:{
              linkedinProfile:results.bad[0].href
            }
          })


          console.log(choice);
        }
      }
    }

    rl.question(choicePrompt, linkResult);



  })


}

module.exports = main;
