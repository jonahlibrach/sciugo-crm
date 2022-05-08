let fs = require('fs');
let args = process.argv;

let axios = require('axios');

const get = col => axios.get('http://localhost:4444/get/'+col);
let types = ['people','papers','linkedinEvents'];
let idTypesToMap = ['people','papers'];
const app = require('./processTodoListData');


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

  app(...appArgs);
})




//console.log(fixedRequestedNames.filter(x => x.toLowerCase().includes('lucy')))


//console.dir(display.slice(-20),{depth:null})



