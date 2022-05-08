let data = JSON.parse(require('fs').readFileSync('people.json'));


let map = {};
data.forEach(person => map[person._id] = person);

let withSearchData = data.filter(x => x.searchData);

let peopleWithNameMatches = withSearchData.filter(x => x.searchData.good.length === 1).map(x => x.searchData.good[0]);

console.log(peopleWithNameMatches.length + " / " + withSearchData.length );

let onlyBad = withSearchData.filter(x => x.searchData.good.length === 0 && x.searchData.bad.length > 0);

let namesOnly = onlyBad.map(x => ({name:x.firstName+' '+x.lastName, unmatched:x.searchData.bad.map(y => y.name+ ' | ' +y.headline)}));
//let matches = peopleWithNameMatches.map(x => ({name
//
console.log(peopleWithNameMatches);
