import { useState } from 'react';
import Navbar from './Navbar';

const types = {
  company:"Company",
  lab:"Lab",
  person:"User",
  recruit:"Recruit Candidate",
  recruitIdea:"Recruiting Idea"
}

export default function(){

  const [selectedForm, setSelectedForm] = useState("company");
  const [todo, setTodo] = useState("");
  const [notes, setNotes] = useState("");

  return (
    
    <div style={{borderRadius:10,padding:15,background:'#fafafa'}}>

      <h3>Add Todo</h3>
          <Navbar
            selected={selectedForm}
        onChange={type => setSelectedForm(type)}
      options={types}/>
      <div class="med-margin"><b>Todo:</b><input value={todo} onChange={e => setTodo(e.target.value)} class="fair-margin"/></div>
      
      <div class="med-margin"><b>Notes:</b></div>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} cols={40} rows={5} class="med-margin"></textarea>

      <div>
        <button onClick={() => {
          alert(JSON.stringify({
            type:'todo',
            todoType:selectedForm,
            todo,
            notes,
          }))
        }}
        class="fair-margin">Add</button>
      </div>
    </div>

  )


}
