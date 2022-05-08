let fs = require('fs');
let linkedinRequests = JSON.parse(fs.readFileSync('linkedinEvents.json'));
let people = JSON.parse(fs.readFileSync('people.json'));

let peopleNames = people.map(x => (x.firstName+' '+x.lastName).toLowerCase());
let linkedinNames = linkedinRequests.map(x => x.name).filter(x => x).map(x => x.toLowerCase().split(',')[0].trim());

//console.log(linkedinNames.slice(0,5))
//console.log(peopleNames.slice(0,5))

let unmatched = [];
let peopleToLinkedinIndex = {};

peopleNames.forEach(x => {
  let index = linkedinNames.indexOf(x);
  if( index !== -1 ){
    peopleToLinkedinIndex[x] = x;
  }else{
    unmatched.push(x);
  }
})



unmatched.sort()
//console.log(unmatched.join('\n'));

let unmatchedLinkedinNames = linkedinNames.filter(name => (!(name in peopleToLinkedinIndex)))
console.log(unmatchedLinkedinNames.join('\n'))

//linkedinNames.sort();
//console.log(linkedinNames.join('\n'));


console.log("LinkedInName: " + linkedinNames.length);
console.log("PeopleNames: " + peopleNames.length);


