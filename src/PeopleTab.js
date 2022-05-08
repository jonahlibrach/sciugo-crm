import PeopleTable from './PeopleTable';

export default function PeopleTab({people}){

  if( ! people ){
    return (
      <div>Loading...</div>
    )
  }
  
  return (
    <div>
      <PeopleTable data={people}/>
    </div>
  )
}
