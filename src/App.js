import React from 'react';
//import { Provider } from 'react-redux'
import { useEffect, useState } from 'react';

import logo from './logo.svg';
import './App.css';

import Navbar from './Navbar';

import TodosTab from './TodosTab';
import CompanyTab from './CompanyTab';
import PeopleTab from './PeopleTab';
import PapersTab from './PapersTab';
const tabs = ["people","companies","todos","recruiting"]

function App() {


  const [ activeTab, setActiveTab ] = useState("papers");
  const [ connected, setConnected ] = useState(false);

  const [ people, setPeople ] = useState([]);
  const [ papers, setPapers ] = useState([]);
  const [ companies, setCompanies ] = useState([]);
  
  const [ client, setClient ] = useState(null);

  


  

  

  
  let title = "Sciugo CRM";

  

  useEffect(() => {
    async function getData(){
      fetch('http://localhost:4444/get/group').then(res => res.json()).then(json => json.filter(cc => cc.isPotentialClient !== false)).then(setCompanies)

      fetch('http://localhost:4444/get/people').then(res => res.json()).then(setPeople)

      fetch('http://localhost:4444/get/papers').then(res => res.json()).then(setPapers)

    }
    getData();
  },[])

  let content = ({

    people:<PeopleTab {...{people}}/>,
    companies:<CompanyTab {...{companies}}/>,
    todos:<TodosTab/>,
    papers:<PapersTab {...{papers,people}}/>
  })



  

  return (
    <>
      
          <div class="fair-margin">

            <Navbar {...{onChange:setActiveTab,selected:activeTab,
              options:Object.fromEntries(Object.keys(content).map(t => { return [t,t] }))
            }}/>


      <p>{"Connected: " + connected}</p>

            {content[activeTab]}

      
      


          </div>


    </>
  )

  
}

export default App;
