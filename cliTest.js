const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function enterNumber(res){
    let num = Number(res);
    if( num && !isNaN(num) ){
        console.log("Great!");
        rl.close();
    }else{
        rl.question("That is not correct. Try again.\n", enterNumber)
    }
    
}

rl.question("Enter a number.\n",enterNumber);





/*
rl.question("What is your name ? ", function(name) {
    rl.question("Where do you live ? ", function(country) {
        console.log(`${name}, is a citizen of ${country}`);
        rl.close();
    });
});
*/

rl.on("close", function() {
    console.log("\nBYE BYE !!!");
    process.exit(0);
});

