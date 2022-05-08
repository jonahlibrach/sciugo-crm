let getAddableObject = (person, people) => {

  //console.log(person);
  let personId = person.personId || person._id;
  let searchResults = people[ personId ].searchData;

  let profileLink = null;
  let headline = null;

  if( person.salvagedNegatives && person.salvagedNegatives.length > 0 ){

    profileLink = person.salvagedNegatives[0].href;
    headline = person.salvagedNegatives[0].headline;

  }else if( person.trimmedPositives ){
    profileLink = person.trimmedPositives[0].href;
    headline = person.trimmedPositives[0].headline;

  }else if( person.searchResultsGood !== 1 ){
    throw Error("Cannot add someone where the linkedin profile is undecided. '"+person.author+"' person has '" + person.searchResultsGood + "' possible profiles to add.");
  }else{

    let linkedinProfile = searchResults.good[0];
    profileLink = linkedinProfile.href
    headline = linkedinProfile.headline;
  }

  if( !profileLink ){
    throw Error("Have a record without a profile link!");
  }

  
  //console.log(linkedinProfile);

  let addableObject = {
    personId,
    name:(person.author),
    profileLink,
    href:profileLink,
    headline,
    firstName:(person.author.split(' ')[0]),
    correspondingAuthorName:person.correspondingAuthor,
    alreadySeen:false,
    requested:false,
  }

  let neededKeys = ['personId','profileLink','firstName','correspondingAuthorName'];
  if( neededKeys.some(key => !addableObject[key]) ){
    throw Error("Missing a key in the addable object!");
  }

  //console.log(person);
  //console.log(addableObject);

  return addableObject;



}

module.exports = getAddableObject;

    /*
    "https://www.linkedin.com/mwlite/in/angella-mercer-41098513a": {
    "personId": "6140ec906d5022bf43d0df60",
    "firstName": "Angella",
    "profileLink": "https://www.linkedin.com/mwlite/in/angella-mercer-41098513a",
    "name": "Angella Mercer",
    "paper": {
      "corAuthNames": [
        "Thomas Pulinilkunnil"
      ]
    },
    "correspondingAuthorName": "Thomas Pulinilkunnil",
    "alreadySeen": true,
    "requested": true,
    "href": "https://www.linkedin.com/mwlite/in/angella-mercer-41098513a",
    "longAbout": "",
    "aboutMe": "laboratory technician at dalhousie medicine new brunswick",
    "route": "MVZJPYM",
    "message": "\"Hey Angella, are you still working with Thomas Pulinilkunnil's group?\"",
    "myAccountEmail": "sciugo.recruiting@gmail.com"
  }*/
