let axios = require('axios');

let getAuthorsNeedingUpdates = require('./getAuthorsNeedingUpdates');
let salvageNegatives = require("./salvageNegatives");
const get = col => axios.get('http://localhost:4444/get/'+col);
let types = ['people','papers','linkedinEvents'];
let idTypesToMap = ['people','papers','linkedinEvents'];

let chalk = require('chalk');
let { printTable } = require('console-table-printer');

let getAddableObject = require('./getAddableObject');

let trimFalsePositiveSearchResults = require('./trimFalsePositiveSearchResults');

let toSkip = ['Eun Ji','Yanting Zhu','Jim Su',]

let shouldSearch = process.argv.includes('--search');


let getCoauthors = (person, people, papers) => {
  //console.log(person);
  let coauthors = person.papers.map(id => papers[id].authors.map(authId => people[authId])).flat();

  return coauthors;
  
}

Promise.all(types.map(get)).then(data => {

  let objectArg = {}
  let store = {};

  data.forEach((d,ii) => {
    let type = types[ii];
    objectArg[type] = d.data;

    if( idTypesToMap.includes( types[ii] ) ){
      let idMap = Object.fromEntries(d.data.map( rec => [rec._id,rec] ))
      store[type] = idMap;
    }

  })

  return [store,objectArg];

}).then( appArgs => {


  function getName(person){
    return person.firstName + ' ' + person.lastName
  }

  
  let { people, papers, linkedinEvents } = appArgs[0];

  if( process.argv.includes('--update') ){
    return getAuthorsNeedingUpdates(people,papers);

  }


  let getCoauthorHeadlines = personId => {

    let coauthors = getCoauthors(
        people[personId],
        people,
        papers
      )
      //console.log(coauthors);
      let coauthorLinkedinEvents = coauthors.map(person => {
        let coauthId = person._id;
        //console.log(coauthId);
        return linkedinEventsByPersonId[coauthId]
      }).filter(x => x).flat();

      if(coauthorLinkedinEvents.length){
        return coauthorLinkedinEvents.map(x => x.aboutMe).flat().filter(x => x.includes('postdoc') || x.includes('phd') || x.includes('university') || x.includes('research'))
      }
    return [];
    
  }

  let dates = Object.values(papers).map(x => x.publicationDate).filter(x => x?.includes('202'))

  dates.sort((a,b) => (new Date(b)) - (new Date(a)))
  ////console.log(dates);


  let paperList = Object.values(papers).filter(x => x?.publicationDate?.includes('202'))
  paperList.sort((a,b) => (
    (new Date(b.publicationDate)) - (new Date(a.publicationDate))
  ))

  ////console.log(paperList.map(x => x.publicationDate).slice(0,50));




  let lieKeys = new Set();
  Object.values(people).forEach(ev => {
    Object.keys(ev).forEach(key => lieKeys.add(key));
    ////console.log(ev.searchData);
  })

  ////console.log(lieKeys);
  //Object.values(people).map(pp => pp.searchData).filter(x => x).slice(0,10).forEach(//console.log)




  let linkedinEventsByPersonId = {};

  Object.values(linkedinEvents).forEach( ev => {
    if( ev.personId ){
      linkedinEventsByPersonId[ ev.personId ] = [...(linkedinEventsByPersonId[ev.personId]||[]),ev]
    }
  })

  let papersMappedToPeople = paperList.map(paper => {
    let correspondingAuthor = getName(people[paper.correspondingAuthors[0]]);
    let authorsInfo = paper.authors.slice(0,3).map(id => ({
      name:(getName(people[id])),
      added:Boolean(linkedinEventsByPersonId[id]),
      linkedinProfile: Boolean(people[id].linkedinProfile) || Boolean(linkedinEventsByPersonId[id]),
      searchResultsGood:people[id].searchData?.good.length || 0,
      searchResultsBad:people[id].searchData?.bad.length || 0,
      personId:id
    }));

    



    let publicationDate = paper.publicationDate;
    let title = paper.title




    return authorsInfo.map(authInfo => {
      let data = { added: authInfo.added, author:authInfo.name, correspondingAuthor, publicationDate, linkedinProfile:authInfo.linkedinProfile, searchResultsGood:authInfo.searchResultsGood, searchResultsBad:authInfo.searchResultsBad, personId:authInfo.personId };

      return data;
    })
  }).flat();


  let twoGood = papersMappedToPeople.filter(x => x.searchResultsGood > 1).map(x => ({
    ...x,
    searchData:people[x.personId].searchData
  }));//.map(x => people[x.personId].searchData.good)

  
  

  let trimmedDownFalsePositivies = trimFalsePositiveSearchResults(twoGood);




  //return;

  let notAddedOnly = papersMappedToPeople.filter(person => !Boolean(linkedinEventsByPersonId[person.personId]));

  let formattedData = notAddedOnly.map(data => {
    return Object.fromEntries(Object.entries(data).map(x => ([x[0],chalk[data.added?'green':data.searchResultsGood === 1 ? 'yellow' : 'red'](x[1])])));
  })

  let shouldGiveAddObject = process.argv.includes('--add');

  if( !shouldGiveAddObject ){
    printTable(formattedData);
  }

  if( !shouldSearch ){
    //console.log(chalk.bold.blue("\nTo match people to LinkedIn profiles, include, --search as an argument."));



    let goodToAdd = [];
    let maybeRepairable = [];
    let notGoodToAdd = [];
    let searched = 0;
    let numberAdded = 0;
    let goodBadCount = {};

    let noGoodMatches = [];

    let searchedNotAdded = papersMappedToPeople.filter(x => {

      let alreadySearched = Boolean( people[x.personId].searchData );
      let alreadyAdded = Boolean( linkedinEventsByPersonId[x.personId] );

      if( alreadySearched ){ searched++ }
      if( alreadyAdded ){ numberAdded++ }

      let shouldAdd = alreadySearched && !alreadyAdded;

      let goodBadCountKey = x.searchResultsGood+'-'+x.searchResultsBad;
      goodBadCount[ goodBadCountKey ] = (goodBadCount[ goodBadCountKey ]||0)+1;

      if( shouldAdd ){
        if( x.searchResultsGood === 1 ){
          goodToAdd.push(x);
        }else{
          if( x.searchResultsGood === 0 && x.searchResultsBad > 0 ){
            noGoodMatches.push(x);
          }
          notGoodToAdd.push(x);
        }
      }
      return shouldAdd;
    })

    let resultsToSalvage = noGoodMatches.map(x => ({
      ...x, 

      searchData:people[x.personId].searchData,
      coauthorHeadlines:getCoauthorHeadlines(x.personId)
    }));

    /*let coauthors = getCoauthors(
      people[resultsToSalvage[0].personId],people,papers
    );*/

    let salvagedReport = process.argv.includes('--salvage');
        
    let falseNegativesSalvaged = salvageNegatives(resultsToSalvage);
    if( salvagedReport ){
      console.log("Salvaged " + falseNegativesSalvaged.length + "/" + resultsToSalvage.length)
    }

    let toAdd = [goodToAdd,falseNegativesSalvaged].flat()//,trimmedDownFalsePositivies].flat()

    let addableObjects = toAdd.map(person => getAddableObject(person,people));

    let addableMap = Object.fromEntries(addableObjects.map(obj => ([
      obj.href, obj
    ])
    ))

    //console.log(addableObjects.length);
    if(shouldGiveAddObject && !salvagedReport){
      console.log(JSON.stringify(addableMap,null,1))
    }

    let countEntries = Object.entries(goodBadCount).map(ent => ([ent[0].split('-').map(Number), ent[1]])).filter(x => x[0][0] !== 1);
    countEntries.sort((a,b) => {
      if( a[0][0] === b[0][0] ){
        return a[0][1] - b[0][1]
      }
      return a[0][0] - b[0][0];
    });

   if( !shouldGiveAddObject ){


     console.log("Started with negatives: " + resultsToSalvage.length);
    console.log("Salvaged (negatives): " + falseNegativesSalvaged.length);

   
    console.log("Total: " + papersMappedToPeople.length);
    console.log("People searched: " + searched);
    console.log("People already added: " + numberAdded);
    console.log("Searched not added: " + searchedNotAdded.length);
    console.table(countEntries);

    console.log("Good to add: " + toAdd.length);
    console.log("Not good to add: " + notGoodToAdd.length);
   }
    //console.log(searchedNotAdded);

    //console.log(goodToAdd[0]);
    

    return;


  }


  let peopleToMatchWithLinkedIn = papersMappedToPeople.filter(person => {

    //let { searchData } = people[person.personId];

    //let { good, bad } = searchData;
    

    let personWasSearched = person.searchResultsBad > 0 || person.searchResultsGood > 0;

    let personId = person.personId
    ////console.log(idMap)
    let linkedInRequested = Boolean(linkedinEventsByPersonId[personId]);

    let shouldSearch = !(personWasSearched || linkedInRequested);

    return shouldSearch;

  })

  console.log("Total candidates: " + papersMappedToPeople.length);
  console.log("To search       : " + peopleToMatchWithLinkedIn.length);


  ////console.log(people[peopleToMatchWithLinkedIn[0].personId]);
  ////console.log(peopleToMatchWithLinkedIn.map(x => x.author).slice(0,10));



  const searchList = async list => {
    //await axios.get('http://localhost:5555/start');

    let ii =0;
    let total = list.length;
    for(let person of list){

      //console.log(ii + " / " + total);

      let name = await person.author;
      //console.log("Hello " + name + " <-- "+ person.correspondingAuthor);
      let fetchURL = encodeURI('http://localhost:5555/search/'+name)
      if( toSkip.includes(name) ){
        console.log("Skiipping " + name);
        continue;
      }
      await new Promise((resolve,rej) => {

        axios.get(fetchURL).then(res => res.data).then(searchData => {
          ////console.log(searchData);
          let setJson = { _id:person.personId, properties:{ searchData }, type:'people' }
          return setJson
        }).then(setJson => {
          if(setJson){
            axios.post('http://localhost:4444/set',setJson).then(() => {
              resolve();

            })
          }
        })
      })
    }
  }

  console.log({toSearch:peopleToMatchWithLinkedIn.length})

  searchList(peopleToMatchWithLinkedIn.slice(10,15))

})




/*peopleToMatchWithLinkedIn.forEach(async person => {

    let name = await person.author;
    //console.log("Hello " + name);
    let fetchURL = 'http://localhost:5555/search/'+name
    let searchData = await axios.get(fetchURL).then(res => res.data);
    let setJson = { _id:person._id, properties:{ searchData }, type:'person' }
    await axios.post('http://localhost:4444/set',setJson)

  })

////console.log(peopleToMatchWithLinkedIn.map(x => ([x.author,x.correspondingAuthor])));



/*
 * Now to determine which people to search:
 * 1) They shouldn't have been searched before.
 *  --> they don't have a searchData property
 * 2) They should not have been REQUESTED before.
 *  --> their _id doesn't show up in linkedin requests.
 */













////console.log(Object.values(linkedinEvents).slice(0,5))
////console.log(lieKeys);

/*

  people.sort((a,b) => (b.papers.length - a.papers.length));

  let paperStore = appArgs[0].papers;
  let recentPubPeople = people.filter(x => {

    let paperIds = x.papers;
    let papers = paperIds.map(id => paperStore[id]);

    return papers.some(pap => pap && pap?.publicationDate?.includes('202'));

  })

  //console.dir(recentPubPeople.slice(0,30).filter(x => x.firstName).map(x => ([x.firstName + ' ' + x.lastName,x.papers.length, x.papers.map(paperId => ([
    appArgs[0].papers[paperId]?.title,
    appArgs[0].papers[paperId]?.publicationDate,
    paperStore[paperId]?.authors?.slice(0,3).map(id => getName(appArgs[0].people[id]))
  ]))
  ])
  ),{depth:null});

  //console.log(paperStore);
})
*/


