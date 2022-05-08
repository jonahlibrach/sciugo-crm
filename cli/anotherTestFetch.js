let fs = require('fs');
const readline = require("readline");
const chalk = require('chalk');
let args = process.argv;

let people = JSON.parse(fs.readFileSync('people.json'))
let papers = JSON.parse(fs.readFileSync('papers.json'))
let linkedinEvents = JSON.parse(fs.readFileSync('linkedinEvents.json'))

let fetch = require('cross-fetch')



let data = {people,papers}
let store = {};

Object.keys(data).forEach(type => {

  let idMap = Object.fromEntries(data[type].map( rec => [rec._id,rec] ))
  store[type] = idMap;

})

const getName = person => person.firstName + ' ' + person.lastName;


let correspondingAuthors = Array.from(new Set(papers.map(pap => pap.correspondingAuthors).flat()))



let paperCount = {};
let correspondingAuthorsIds = papers.map(pap => pap.correspondingAuthors).flat()


correspondingAuthorsIds.forEach(id => {
  paperCount[id] = (paperCount[id]||0)+1;
})

