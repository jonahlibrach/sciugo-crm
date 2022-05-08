const axios = require('axios')
/*
axios.post('http://localhost:4444/add', {
    type:"todo",
    todoType:"lab",
    todo:"Silvio Gutkind",
    notes:"https://gutkindlab.org/",
}).then(() => {
    axios.get('http://localhost:4444/todo').then(data => console.log(data.data));
})
*/


axios.post('http://localhost:4444/add', {
    type:"group",
    basicInfo:{
        name:"Leinco Technologies"
    },
    todoType:"lab",
    todo:"Silvio Gutkind",
    notes:"https://gutkindlab.org/",
}).then(res => {
    console.log(res.data);
    //axios.get('http://localhost:4444/todo').then(data => console.log(data.data));
})

