function getName(person){
    return person.firstName + ' ' + person.lastName
  }



module.exports = function(people,papers){

  let peopleList = Object.values(people);
  peopleList.sort((a,b) => b.papers.length - a.papers.length);
  peopleList.map(x => {
    let dates = x.papers.map(id => {
      return papers[id] && papers[id].publicationDate
    }).filter(x => x);
    dates.sort((a,b) => (new Date(b))-(new Date(a)));
    let mostRecentPublication = dates[0] || '';
    if( !mostRecentPublication.includes('202') ){
      console.log(x.papers.length + ' - ' + mostRecentPublication + ' - ' + getName(x))
      console.log('\t' + papers[x.papers[0]].title)
    }
  })
}
