let fs = require('fs');

let data = String(fs.readFileSync(process.argv[2]));
//.split('\n')

//console.log(data)
let lines = data.split('\n')
let keys = lines[0].split(",").map(x => x.slice(1,-1))

let keysToKeep = {
  "Url":"articleUrl",
  "Date":"publicationDate",
  "Author":"authors",
  "Title":"title",
  "DOI":"DOI"

}

let parsedLines = lines.map(x => {
  let breaks = [0];
  let open = false;
  Array.from(x).forEach((char,ii) => {
    if(char === '"'){ open ^= true }
    else if(char === ',' && !open){
      breaks.push(ii+1)
    }
  })
  
  let strings = [];
  breaks.forEach((b,ii) => {
    strings.push( x.slice(b,breaks[ii+1]) )
  })

  let object = Object.fromEntries(
    strings.map((str,ii) => [keys[ii],str.slice(1,-2)]).filter(
      entry => entry[0] in keysToKeep
    ).map(entry => {
      return [ keysToKeep[entry[0]], entry[1] ]
    })
  )

  object.authors = object.authors.split(';').map(auth => {
    let names = auth.split(',').map(x => x.trim())
    return [names[names.length-1],...names.slice(0,-1)].join(' ')
  })

  object.correspondingAuthors = [{
    name:object.authors[object.authors.length-1]
  }]

  return object;


})

console.log(JSON.stringify(parsedLines));

