import { useState } from 'react';

function getName(person){
  return person.firstName + ' ' + person.lastName;
}

function countTable(list){
  let table = {};
  list.forEach(item => table[item] = (table[item]||0)+1)
  return table;
}

export default function PapersTab({papers,people}){

  const [selected,setSelected] = useState();

  if( people.length === 0 ){
    return <div>Downloading people...</div>
  }else if( papers.length === 0 ){
    return <div>Downloading papers...</div>
  }

  let paperIdToPaper = Object.fromEntries(papers.map(obj => [obj._id,obj]))

  let authIdToPerson = Object.fromEntries(people.map(person => [person._id,person]))
  let correspondingAuthors = Array.from(new Set(papers.map(pap => pap.correspondingAuthors).flat()))//
  let mappedCAuths = correspondingAuthors.map(id => (authIdToPerson[id]));


  let articleUrls = papers.map(x => x.articleUrl).sort();
  console.log(articleUrls);

 
  let patterns = [
    ["www.nature.com","Nature"]
    ["j.chembiol","Cell Chemical Biology"],
    ["j.celrep","Cell Reports"],
    ["www.pnas","PNAS"],
    ["/pnas","PNAS"],
    ["/jbc","Journal of Biological Chemistry"]
  ]
  

  


  const getAuthorPaperConnections = authorId => {
    let person = authIdToPerson[authorId];
    if( !person ){
      console.log({people});
      console.log(authorId);
    }
    let papers = person.papers;
    let authorIds = papers.map(p => p.authors).flat();
    return (authorIds.map(id => <div>{id}</div>))

    /*
    let paper = paperIdToPaper[paperId];
    if( paper === undefined ){
      return {"error":"Cannot find paper with _id: " + paperId};
    }
    let authors = paper.authors.map(authId => authIdToPerson[authId]).filter(x => x);
    //let names = authors.map(getName)

    return authors;
    */

  }

  let previewNum = 20;

  return (
    <div style={{width:'100%'}}>
      {mappedCAuths.sort((a,b) => b.papers.length - a.papers.length).slice(0,200).map(author => {
        if( author.firstName.length === 0 ){ return null; }

        return (
          <div class="row">
            <div onClick={() => setSelected(author._id)} class={"todo-nav "+(selected===author._id?"selected":"")} style={{padding:10,width:'25%'}}>
              <div class="row">
                <div>{getName(author)}</div>
                <div style={{marginLeft:10,marginRight:10}} >{author.papers.length}</div>
                <div>
                  <ul>
                    {author.papers.map(pp => <li>{pp + " " + JSON.stringify(paperIdToPaper[pp]?.articleUrl)}</li>)}
                  </ul>
                </div>
                <div style={{fontSize:12}}>{JSON.stringify(author.papers)}</div>
              </div>
              {false && JSON.stringify(author)}
            </div>
            {getAuthorPaperConnections(author._id)}

            {selected && selected===author._id &&(
              author.papers.map(getAuthorPaperConnections).flat().map(name => <div><pre>{JSON.stringify(name,null,1)}</pre></div>) )}
          </div>

        )
      })}
    </div>
  )
}
