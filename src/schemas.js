const schemas = {
  person:{
    name:"string",
    emails:"list:email",
    phones:"list:tel",
    linkedin:"string",
    parentGroupId:"string"
  },
  userGroup:{
    people:"list:person",
    parent:"?userGroup"
  }

}


export default schemas;
