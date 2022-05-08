import { useState } from 'react';
import AddTodoFrom from './AddTodoForm';

export default function TodosTab(){

  const [ showAdd, setShowAdd ] = useState(false);

  let addToggle = "Add Todo ("+(showAdd?"hide":"show")+")";
  return (
    <>

      <h3>Todos</h3>
      <div class="row">
        <div>

    {showAdd && (
          <AddTodoFrom/>
      )}

          <button onClick={()=>setShowAdd(!showAdd)}>{addToggle}</button>
          <button style={{marginLeft:10}}>Refresh</button>

    
        </div>
      </div>


    </>

  )}
