let axios = require('axios');

let title = encodeURI('KIT-Dependent and KIT-Independent Genomic Heterogeneity of Resistance in Gastrointestinal Stromal Tumors — TORC1/2 Inhibition as Salvage Strategy').replace('/','%2F');

console.log(title);

axios.post('http://localhost:5555/searchResearchgate',{title}).then(dat => console.log(dat.data))
//'+title).then(href=>console.log(href));
