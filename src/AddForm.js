import { useState } from 'react';

import schemas from './schemas';

/*
 Labs, People, PIs
*/

const options = {
  userGroup:"User Group (e.g, Company, Lab)",
  user:"User",
  recruitGroup:"Company to Recruit from",
  recruitPerson:"Person to Recruit",
  consortium:"Consortium",
  conference:"Conference"
}


export default function(){

  const [selectedForm, setSelectedForm] = useState("userGroup");

  return (
    <select onChange={e => setSelectedForm(e.target.value)} value={selectedForm}>{Object.entries(options).map(entry => {
      return <option value={entry[0]}>{entry[1]}</option>
    })}
    </select>

  )




}
