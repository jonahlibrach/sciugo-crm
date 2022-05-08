const readline = require("readline");
const chalk = require('chalk');
const axios = require('axios');
const linkAuthorToLinkedinProfile = require('./linkAuthorToLinkedinProfile');
const fs = require('fs');
let newTo



function app(store,{people,papers,linkedinEvents}){

  //console.log(store);

  const getName = person => person.firstName + ' ' + person.lastName;

  function getAddableObject(info,profileLinkGetter){
    let _id = info._id;
    if(!_id){ throw Error("Can't get addable object without '_id', received: " +JSON.stringify(info)) }

    let person = store.people[_id];

    let personPapers = person.papers.map(paperId => {
        let paper = store.papers[paperId]
        if( !paper ){ return; }
        let corAuths = paper.correspondingAuthors.map( authId => store.people[authId] )
        let corAuthNames = corAuths.map( auth => auth.firstName + ' ' + auth.lastName );
        let date = paper.publicationDate;
        return ({ date, corAuthNames })
      })

    personPapers.sort((a,b) => !a.date ? 1 : a.date.localeCompare(b.date))

    let profileLink = profileLinkGetter ? profileLinkGetter(info) : info.profileLink;
    if(!profileLink){
      throw Error("Can't create addable object because couldn't get a final profileLink (person = " + JSON.stringify(info)+" )");
    }

    return ({
      personId:person._id,
      firstName:person.firstName, 
      profileLink,
      name:person.firstName + ' ' + person.lastName,
      paper:personPapers[0],
      date:personPapers[0].date,
      correspondingAuthorName:personPapers[0].corAuthNames[0],
      alreadySeen:false,
      requested:false,
      ...info
    })



  }

  //const newToAdd = Object.fromEntries(JSON.parse(fs.readFileSync('NEW_TO_ADD.json')).map(p => [p.profileLink,getAddableObject(p)]))

  //console.log(JSON.stringify(newToAdd,null,1));

  //return;


  let addablePeople = people.filter(person => person.searchData && person.searchData.good.length === 1) //person.searchData.bad.length > 0 && (person.searchData.good.length === 1 || person.searchData.good.length > 1))

  // && person.searchData.good[0].distance > 1)

  //we've taken the first person of the GOOD which have more than one in good


  let toAdd = addablePeople.filter(p => [p.firstName,p.lastName].every(name => (name.indexOf('ng') !== name.length-2) && name.length >= 4))//.map(x => ({name:x.firstName+' '+x.lastName, options:x.searchData.good}))//.forEach(x => console.log(JSON.stringify(x,null,1)))
  console.log(toAdd.length);

  console.log(JSON.stringify(toAdd.map(x => ({name:x.firstName+' '+x.lastName,good:x.searchData.good[0]})),null,1))
//    bad:x.searchData.bad,_id:x._id})),null,1));

  

  process.exit(0);

  let mappedPeople = toAdd.map(person => {
    let name = person.firstName + ' ' + person.lastName;
    
  }).filter(x => x.paper.date);

  

  mappedPeople.sort((a,b) => !a.paper.date ? 1 : a.paper.date.localeCompare(b.paper.date));
  let reversed = mappedPeople.reverse().filter(x => x.date && x.date.localeCompare('2016') > 0);

  //console.log(JSON.stringify(reversed,null,1))

  //console.log(mappedPeople.length);

  let map = {};
  reversed.forEach(person => map[person.profileLink] = person)

  //console.log(reversed.length);
  console.log(JSON.stringify(map, null, 1));


  process.exit(0);



  let correspondingAuthors = Array.from(new Set(papers.map(pap => pap.correspondingAuthors).flat()))



  let paperCount = {};
  let correspondingAuthorsIds = papers.map(pap => pap.correspondingAuthors).flat()


  correspondingAuthorsIds.forEach(id => {
    paperCount[id] = (paperCount[id]||0)+1;
  })


  let paperCountEntries = Object.entries(paperCount)
  paperCountEntries.sort((a,b) => a[1] - b[1])

  let badWords = ['md','phd','dr']
  let fixedRequestedNames = linkedinEvents.map(x => x.name).filter(x => x).map(x => x.replace(/[.,]/g,'').split(' ').filter(x => !(x.includes('/') || badWords.includes(x.toLowerCase())))).map(x => x.join(' '))

  let peopleListNames = people.map(x => x.firstName+' '+x.lastName)

  //console.log(peopleListNames)

  let undefinedPaperIds = [];

  let display = correspondingAuthors.map(authId => {

    let auth = store.people[authId];
    if( !auth ){ return "ERROR AUTH ID ("+authId+")"; }

    let correspondingAuthorName = auth.firstName + ' ' + auth.lastName;
    let paperAuthors = auth.papers.map(paperId => store.papers[paperId]).filter(x => x).map(pap => pap.authors).flat()
    let uniqueAuthorIds = Array.from(new Set(paperAuthors))

    let allCoauthors = uniqueAuthorIds.map(_id => store.people[_id]);

    let coauthNames = allCoauthors.map(getName);

    let coauthRequested = coauthNames.filter(name => fixedRequestedNames.includes(name)).length;
    let coauthRequests = coauthRequested + '/' + coauthNames.length

    let paperIds = auth.papers;
    let authPapers = [];
    paperIds.forEach(id => {
      if(store.papers[id]){
        authPapers.push(store.papers[id])
      }else{
        undefinedPaperIds.push(id);
      }
    });

    let firstAuthorPaperPairs = authPapers.map(paper => {
      let paperAuthors = paper.authors.slice(0,3)
      let authorList = paperAuthors.map(authId => store.people[authId])
      let firstStarIndex = paper.title.indexOf('*');
      return authorList.map((auth,ii) => ({
        authorOrder:ii+1,
        name:getName(auth),
        personId:auth._id,
        /*linkedin:(auth.linkedinProfile ? true : false),*/
        date:paper.publicationDate,
        paperTitle:paper.title.slice(0,firstStarIndex),
      }))
    }).flat();

    let paperTitles = authPapers.map(x => x.title);

    let bigRec = {correspondingAuthorName,papersCounted:paperCount[authId]}

    let records = firstAuthorPaperPairs.map( obj => ({
      ...obj,
      ...bigRec
    }));

    return records;
  })

  let flatDisplay = display.flat();

  flatDisplay.sort((a,b) => b.papersCounted - a.papersCounted);
  console.log(JSON.stringify(flatDisplay,null,1));


  /*
  flatDisplay.slice(0,3).forEach((person) => {

    let name = await person.name;
    console.log("Hello " + name);
    let fetchURL = 'http://localhost:5555/search/'+name
    let searchData = await axios.get(fetchURL).then(res => res.data);
    let setJson = { _id:person._id, properties:{ searchData }, type:'person' }
    await axios.post('http://localhost:4444/set',setJson)
  })*/

  process.exit(0);






  //process.exit(0);


  /*
   *  Mark the number of: | co-authors requested | co-authors connected | co-authors signed-up |
   */



  console.table(flatDisplay)


  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function enterNumber(res){
    let num = Number(res);
    if(num === 'q'){
      process.exit(0)

    }else if( num && !isNaN(num) && num >= 0 && num < flatDisplay.length ){

      let {name,_id} = flatDisplay[num];
      console.log("Searching for: " + name +', _id = ' + _id);
      let fetchURL = 'http://localhost:5555/search/'+name
      console.log("Fetching '"+fetchURL+"'");
      axios.get(fetchURL).then(res => {
        let data = res.data;
        //console.log(data);
        linkAuthorToLinkedinProfile(data,_id,rl);

        rl.question("Enter a number.\n",enterNumber);
        
      })
        //rl.close();

    }else{
      rl.question("Index out of range. Try again.",enterNumber);
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
    //process.exit(0);
  });
}

module.exports = app;
