let G = {};

G.stringQuery = function(state,q){
}

G.query = function(state,q){

  if( typeof(q) === 'string' ){

    return G.stringQuery(state,q);

  }
  
}
