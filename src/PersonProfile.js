import { usePresentSelector } from './utils';

import { useSelector } from 'react-redux';

export default function PersonProfile({personId}){

  let person = useSelector(state => state.people[personId]);

  return (
    <div style={{display:'flex'}}>
      <div style={{width:'50%'}}>
        {Object.entries(person).map(([key,value]) => {
          return <Field {
            ...{
              type:'people',
              _id:personId,
              key,
              value
            }}/>
        })}
      </div>
      <div style={{width:'50%'}}>
        <div><b>Notes</b></div>
        <textarea value={person.notes}
        style={{margin:20, height:300, width:'100%'}}/>
      </div>
    </div>
  )



}
