
let badWords = require("./badWords");

let goodWords = ['research','postdoctoral','oncolog','molecular','laboratory','postdoctoral','scien','immuno','biolog','genom','drug','biochem','protein','molec','cancer']




module.exports = function(results){

  let trimmed = results.map(person => {

    //console.log(person);
    let toKeep = person.searchData.good;

    let test = toKeep.filter(res => {

      let lowercaseHeadline = res.headline.toLowerCase();
      let includedBadWord = badWords.find(word => lowercaseHeadline.includes(word));

      let shouldKeepPerson = !includedBadWord;
      return shouldKeepPerson;

    })

    if( test.length > 1 ){
      test = test.filter(res => {

        let lowercaseHeadline = res.headline.toLowerCase();
        let includedGoodWord = goodWords.find(word => lowercaseHeadline.includes(word)); 
        let shouldKeepPerson = includedGoodWord;
        return shouldKeepPerson;

      })
    }

    return {
      ...person, trimmedPositives:test
    }
  
  })


  let final = trimmed.filter(x => x.trimmedPositives.length === 1)

  

  //console.dir(final[0],{depth:null});

  //console.log(final.length+"/"+results.length + " salvaged.");

  return final;

  //console.log(results);
}
