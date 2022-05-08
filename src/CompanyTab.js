import { useState } from 'react';
import CompanyTable from './CompanyTable';

export default function CompanyTab({companies}){

  const [nameFilter, setNameFilter] = useState();
  const [ showCompanies, setShowCompanies ] = useState(true);
  return (
    <>
      <h3>
        <button onClick={() => setShowCompanies(!showCompanies)}>{showCompanies ? "Hide" : "Show"}</button>
        <span>{"Companies ("+companies.length+")"}</span> <input style={{margin:10}} placeholder={"Search companies..."}/></h3>
      {showCompanies && <CompanyTable {...{companies, nameFilter}}/>}
    </>
  )


}
