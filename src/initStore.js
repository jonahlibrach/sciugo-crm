import { createStore, applyMiddleware } from 'redux';

import { batchGroupBy } from './batchGroupBy';

import undoable, { combineFilters, includeAction, excludeAction } from 'redux-undo';

import Reducer from './Reducer';

import C from './Constants';
import thunk from 'redux-thunk';

import { composeWithDevTools } from 'remote-redux-devtools';

import analyticsMiddleware from './analyticsMiddleware';



export default function initStore({
  initialState,
  remoteDevTools
}){

  let middlewares;
  if(typeof(window)==='undefined'){
    middlewares=[thunk];
  }else{
    middlewares=[analyticsMiddleware,thunk];
  }

  /*if( !remoteDevTools ){
    return createStore(
      Reducer,
      applyMiddleware(...middlewares)
    )
  }*/

  const composeEnhancers = composeWithDevTools({
    realtime:true, port:8000, trace: true
  });

  let lastStoreCreationArg = remoteDevTools?
    composeEnhancers( applyMiddleware( ...middlewares ) ) : applyMiddleware(...middlewares)
    


 

  const store = createStore(
    undoable(Reducer,{
      
      undoType:'UNDO',
      redoType:'REDO',
      clearHistoryType:'CLEAR_HISTORY',

      groupBy:batchGroupBy.init([]),
      filter:excludeAction([
        C.SELECT_CELLS,
        C.POP_MESSAGE,
        C.REPORT_MESSAGE
      ])
    }), 
    initialState,
    lastStoreCreationArg
  )

  //let state = store.getState();

  //debugger;


  return store;


}
