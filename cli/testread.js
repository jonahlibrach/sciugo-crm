let fs = require('fs');

console.log("What is your name?")
let buffer = fs.readFileSync(0);
let data = buffer.toString();
console.log("Hello, " + data);
