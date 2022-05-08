let chalk = require('chalk');
let badWords = require("./badWords");

let nameExchange = [

  ['chistian','chris'],
  ['dave','david'],
  ['steve','steven'],
  ['thomas','tom'],
  ['nataliia','natalia','natalie'],
  ['will','bill','william'],
  ['zach','zachary','zack'],
  ['josh','joshua'],
  ['max','maxwell'],
  ['daniel','dan'],
  ['ben','benji','benjamin'],
  ['michael','mike'],
  ['ann','annie','anna','ana'],
  ['andrew','andy'],
  ['alexander','alex'],
  ['esther','ester'],
  ['tim','timothy']
]

const letterMap = {
  'á':'a',
  'é':'e',
  'í':'i',
  'ó':'o',
  'ú':'u',

  'Á':'A',
  'É':'E',
  'Í':'I',
  'Ó':'O',
  'Ú':'U',

  '’':"'",

  '--':'-',

  'ñ':'n',

  'ö':'oe'

}

const isNameExchangeMatch = (a,b) => {
 
  let findNameEx = nameExchange.find(names => {
    return names.includes(a.toLowerCase()) && names.includes(b.toLowerCase())

  })
  return Boolean(findNameEx)
}

const normalize = word => {
  let finalWord = word;

  Object.entries(letterMap).forEach(letter => {
    finalWord = finalWord.replace(letter[0],letter[1]);
  })

  return finalWord;
}

const dashesConform = (dashes,wordSplit) => {

  /*if( !dashes.includes('cotto-rios') ){
    return false;
  }*/


  //////console.log({dashes, wordSplit});
  let conform = dashes.every(dashedWord => {
    let wordsSplitByDashesIndices = dashedWord.split('-').map(split => wordSplit.indexOf(split))


    let allDeltasAreOne = wordsSplitByDashesIndices.every((x,ii) => {
      let nextIsntUndefined = wordsSplitByDashesIndices[ii+1]!==undefined;
      if( nextIsntUndefined ){
        return wordsSplitByDashesIndices[ ii + 1 ] === x + 1;
      }else{
        return true;
      }
    })

    //////console.log({wordsSplitByDashesIndices,allDeltasAreOne});

    //////////console.log(wordsSplitByDashesIndices);

    let good = allDeltasAreOne && (wordsSplitByDashesIndices.indexOf(-1)===-1);


    
    //if(good){ //////////console.log(wordsSplitByDashesIndices) }

    return good;
  })

  
  return conform;
  
}

const matchesByDashAnalysis = (a,b) => {
  let aSplit = a.split(' ');
  let bSplit = b.split(' ');

  let aSplitDashes = aSplit.filter(x => x.includes('-'));
  let bSplitDashes = bSplit.filter(x => x.includes('-'));

  let aNoDashes = aSplitDashes.length === 0;
  let bNoDashes = bSplitDashes.length === 0;
  if( aNoDashes && bNoDashes ){
    return false;
  }

  ////////console.log({aSplitDashes,bSplitDashes});
  let aSplitDashesConformToBOrder = !aNoDashes && dashesConform(aSplitDashes,bSplit);
  let bSplitDashesConformToAOrder = !bNoDashes && dashesConform(bSplitDashes,aSplit);

  let matches = aSplitDashesConformToBOrder || bSplitDashesConformToAOrder;

  if( matches ){
    //////////console.log({aSplitDashesConformToBOrder, bSplitDashesConformToAOrder})
   ////console.log([a,b]);
  }else{
    ////////console.log([a,b])
  }
  return matches;



}

const canSalvageName = (a,b) => {
  let queriedName = normalize(a.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(',',' '));
  let searchResultName = normalize(b.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(',',' '));

  let querySplit = queriedName.split(/ /)
  let resultSplit = searchResultName.split(/ /)

  let queriedFirstName = querySplit[0];
  let queriedLastName = querySplit[querySplit.length-1];

  let firstNameMatch = resultSplit.includes(queriedFirstName) || isNameExchangeMatch(resultSplit[0],queriedFirstName);
  
  let badGuySalvaged = firstNameMatch && (resultSplit.includes(queriedLastName) || matchesByDashAnalysis(queriedName,searchResultName))

  if(!badGuySalvaged){
    ////////////console.log([a,b])
  }
  return badGuySalvaged;

}

module.exports = function(results){

  //////////////////console.dir(results,{depth:null});

  let nameWords = { }


  let salvaged = results.map(person => {
    let queriedName = person.author;
    let splitName = person.author.split(' ').map(x => x.toLowerCase());
    splitName.forEach(split => {
      if(split in nameWords){
        nameWords[split]++;
      }else{ nameWords[split] = 1 }
    })
    let salvagedBadByName = person.searchData.bad.filter( otherGuyName => {
      return canSalvageName(queriedName,otherGuyName.name) 
    })



    let goodWords = ['research','postdoctoral','oncolog','molecular','laboratory','postdoctoral','scien','immuno','biolog','genom','drug','medic','cancer','phd','post doc','phd','student','disease','neuro','weill','sloane','md anderson',]

    

    let nameRemainder = []
    ////////////////console.log(person.author);
    let salvagedByHeadline = [];
    let notSalvagedByHeadline = [];

    



    salvagedBadByName.forEach(x => {
      let lowercaseHeadline = x.headline.toLowerCase()
      //////////////////console.log(lowercaseHeadline);
      let goodWord = goodWords.find(word => lowercaseHeadline.includes(word));
      let headlineHasGoodWords = goodWord;
      if( goodWord ){
        x.goodWord = goodWord;
      }
    
      let badWord = badWords.find(word => lowercaseHeadline.includes(word));

      let headlineDoesNotHaveBadWords = !badWord;
      
      if( badWord ){
        x.badWord = badWord;
        
      }
      
      if(!headlineHasGoodWords && !badWords.some(word => lowercaseHeadline.includes(word))){
        let finalWords = ['student','university','professor'];
        if( finalWords.some(word => lowercaseHeadline.includes(word)) ){
          nameRemainder.push(lowercaseHeadline);
        }
      }

      if( headlineHasGoodWords && headlineDoesNotHaveBadWords){
        
        salvagedByHeadline.push(x)
      }else if( !headlineHasGoodWords && headlineDoesNotHaveBadWords ){
        nameRemainder.push(x);
      }else{
        notSalvagedByHeadline.push(x);
      }
    })


    if( salvagedByHeadline.length === 0 && (person.searchData.bad.length < 2) ){
      
      ////console.log({...notSalvagedByHeadline,name:person.author});
      let headlines = person.searchData.bad.filter(x => badWords.every(word => !(x.headline.toLowerCase().includes(word)))).map(x => [x.headline,x.name])
      if(headlines.length > 0){
      //console.log({headlines:person.searchData.bad.map(x => [x.headline,x.name]),name:person.author});
      }
    }else if( salvagedByHeadline.length > 0 ){
      ////console.log(salvagedByHeadline);
    }

    /*

    if(person.author.includes('Iris')){
      ////////////////console.log(person.searchData)
      //////////////console.log({salvagedBadByName});
      
      //////////////console.log({salvagedByHeadline});
    }
    */

    //////////////////console.log(notSalvagedByHeadline);

    ////////////////console.log(salvagedByHeadline);

    if( nameRemainder.length ){
      //////////////////console.log( nameRemainder.length + ' / ' + person.searchData.bad.length + ' ||| ' + nameRemainder.join(' || ') )
      //////////////////console.log(' --> ' + person.coauthorHeadlines.join(' || ')); 
    }

    //////////////////console.log(salvagedByHeadline);

    return ({...person, salvagedNegatives:salvagedByHeadline});

    /*
    ////////////////console.log(queriedName);
    ////////////////console.log(salvagedBadByName);
    ////////////////console.log(salvagedByHeadline);
    */

  }).filter(x => x.salvagedNegatives.length === 1)

  ////////////console.log(Object.entries(nameWords).sort((a,b) => b[1]-a[1]).slice(0,20));
  return salvaged;

}
