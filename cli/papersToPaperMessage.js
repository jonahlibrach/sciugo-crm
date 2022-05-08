let fs = require('fs');

let pNames = String(fs.readFileSync('sortedProteinNames')).split('\n')

let papers = JSON.parse(fs.readFileSync('papers.json'));

let titles = papers.map(p => p.title.split(' ')).map(words => [words.filter(word => pNames.includes(word)),words]);

console.log(titles);
console.log(pNames);
