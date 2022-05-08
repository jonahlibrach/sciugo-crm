let fs = require('fs');
let data = JSON.parse(fs.readFileSync('badMatches.json'));

let fixed = [];
let remaining = [];


let words = data.map(x => x.bad.map(res => res.headline.split(' ').map(y => y.replace(',','').replace('.','').toLowerCase())).flat()).flat()

let map = {};
words.forEach(w => map[w] = 1+(map[w]||0))

let counts = Object.entries(map);
counts.sort((a,b) => b[1] - a[1]);

let goodWords = ['research','postdoctoral','oncolog','molecular','laboratory','postdoctoral','scien','immuno','biolog','genom','drug']

let badWords = ['clinic','computer','robot','middle','psych','geo','enviro','account','finan','microsoft','data scien','judi','indust','ocean','ubm','risk','talent','business']

let findGoodInBad = data.map(x => ({personId:x._id,name:x.name,
  fistName:x.name.split(' ')[0],
  good:x.bad.filter(res => x.name.split(' ').some(name => res.name.includes(name)) && !badWords.some(word => res.headline.toLowerCase().includes(word)) &&  goodWords.some(word => res.headline.toLowerCase().includes(word)))
})).filter(x => x.good.length >= 1).map(x => x.good.map(g => ({
  _id:x.personId,
  profileLink:g.href,
  href:g.href
}))).flat()


//console.log(counts.slice(0,200).map(w => w.join(' - ')).join('\n'));



console.log(JSON.stringify(findGoodInBad,null,1));
//console.log(findGoodInBad.length);
//console.log(data.length);
//console.log(data[0]);
