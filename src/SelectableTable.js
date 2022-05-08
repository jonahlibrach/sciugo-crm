import React, { useState,useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
//display the table
//dispatch selection events
//so you can postition antibodies 
//and samples onto the lanes
import Getters from './Getters'

import SelectableRow from './SelectableRow';



function TableHead({columns,flatHeader,inputs,columnValueSets,rowsChoosable,groupSeparators,filters,setFilters,sortOrder,setSortOrder}){

  let thDivStyle={};
  let thStyle = {};
  let thSpanStyle = {};

  if( flatHeader !== true ){
	thDivStyle = {
	  width:'30px',
	  transform:'rotate(315deg) translate(3px,0)'
	}
	thStyle = {
	  whiteSpace:'nowrap',
	  height:'100px',
	}

	thSpanStyle = {
	  padding:'2px 10px',
	  borderBottom:'1px solid #ccc',
	  borderBottom:'1px solid #ccc'
	}


  }

  



  let headers;
  if( inputs !== undefined ){
	headers = [ ...columns, 
	  ...inputs.map(input=><>
		<div class="sg-row">
		<div class="clickable-text">
		<UploadIcon/>
		</div>

		<input 
		style={{marginLeft:'10px'}}
		size="6"
		value={input.value}
		onClick={e=>e.stopPropagation()}
		onChange={e=>input.onSetValue(e.target.value)}/></div>
		<div>{input.title}</div></>
	  ) ]
  }else{
	headers = columns;
  }

  const HeaderSpan = ({fieldData,filterInfo,columnIndex}) => {
	const [showPopover,setShowPopover] = useState(false);

	const overlayTriggerRef = useRef(null);

	if( !filterInfo.map ){

	}

	const onFilterChange = item => e => {

	  let newFilters = produce(filters,draft => {

		if( e.target.checked === true ){
		  draft[columnIndex] = [...draft[columnIndex],item]
		}else if( e.target.checked === false ){
		  draft[columnIndex] = draft[columnIndex].filter( data => data!==item );
		}

	  })

	  setFilters(newFilters);
	}

	const onSortClick = () => {
	  setSortOrder(produce(sortOrder,draft=>{
		let sortPositionOfColumn = draft.indexOf(columnIndex);

		if( sortPositionOfColumn !== -1 ){
		  draft.splice(sortPositionOfColumn,1);
		}else{
		  draft.push(columnIndex);
		}

	  }))
	}

	let thisColumnsFilters = filters[columnIndex];



	const popover = (

	<Popover show={true}>

	<Popover.Content>

	<div class="bold align-center">{fieldData}</div>

	  <div class="dropdown-divider"></div>

	<div onClick={e=>e.preventDefault()}>
	  <div>
		<input type="checkbox"/>
		<span class="small-margin"  >Show All</span>
	  </div>

	  <div class="dropdown-divider"></div>

	  {filterInfo.map(
		item => (

		  <div>
			<input 
			 
			  onClick={e=>e.preventDefault()}
			  checked={filters[columnIndex].includes(item)} onChange={e=>{
			  console.log(e);
			  onFilterChange(item)(e)}} 
			type="checkbox"/>
			<span class="small-margin"  >{item}</span>
		  </div>

		)
	  )}
	</div>

	
	</Popover.Content>
	</Popover>
  )

	let sortPriority = sortOrder.indexOf(columnIndex);
	let sortPriorityOutput = sortPriority === -1 ? null : sortPriority + 1; 



	return (
	  <div style={{border:(flatHeader===true?0:'1px solid white')}}>

	  <OverlayTrigger trigger="click" ref={overlayTriggerRef} placement="top" rootClose overlay={popover}>
	  <span 
	  onContextMenu={e => {
		e.preventDefault();
		onSortClick();
	  }}
	  onMouseEnter={() => {
		console.log(Array.from(filterInfo))
	  }}
	  class="table-column-header" style={thSpanStyle}>
	  {fieldData}

	  {sortPriorityOutput && <span style={{border:'1px solid #bbbbbb',
		  position:'absolute',width:'20px',height:'20px',
		  background:'#cccccc',
		  left:'150%',top:'-150%',transform:'rotate(45deg)',borderRadius:'20px',textAlign:'center'}}>
	  {sortPriorityOutput}
	  </span>}

	  </span>
	  
	  </OverlayTrigger>


	  </div>

	)
  }

  return (
    <tr>
	
	{rowsChoosable && (<td class="blank-style">
	  <input type="checkbox"/>
	  </td>)}
    {headers.map(
      (fieldData,iiCol) => <th
	  scope="col" 
	  style={thStyle}
	  class={"small-font "+(groupSeparators && groupSeparators.includes(iiCol) ? " selectable-table-group-end " : "")}>
	  <div style={thDivStyle}>
	  <HeaderSpan
	  fieldData={fieldData}
	  filterInfo={(Array.from(columnValueSets[iiCol]||[]))}
	  columnIndex={iiCol}
	  />
	  </div>
	  </th>
    )}
	
    </tr>
  );
}



const getColumnValueSets = rows => {

  let columnSetList = Array(rows[0].length).fill("").map(_=>(new Set()));

  rows.forEach( row => {
	if( !row.forEach ){
	}
	row.forEach( (col, iiCol) => {
	  columnSetList[iiCol].add(col)
	})
  })


  return columnSetList;

}

function computeIndexMap(rows, sortOrder,filters){



  let rowsWithIndex = rows.map((row,index) => ({row,index}));

  let filteredRows = rowsWithIndex.filter( rowObject => {
	return filters.every( (listOfAllowedValues,index) => {
	  if( listOfAllowedValues.length === 0 ){
		return true; 
	  }
	  return listOfAllowedValues.includes(rowObject.row[ index ])
	})
  })

  let sortedRows = filteredRows.sort((a,b) => {
	for(let column of sortOrder){
	  let aVal = a.row[column];
	  let bVal = b.row[column];

	  let typeOrder = ['number','string','object'];

	  let aType = typeof(aVal)
	  let bType = typeof(bVal)

	  let aTypeIndex = typeOrder.indexOf(aType);

	  let typeComp = aTypeIndex - typeOrder.indexOf(bType);

	  if( typeComp ){ 
		return typeComp;
	  }else if( aTypeIndex === 2 ){
		return 0;
	  }


	  let compare = aVal.localeCompare(bVal);
	  if( compare ){ 
		return compare;
	  }
	}
  })


  return sortedRows;


}

function SelectableTable({ 
  header, rows,
  tableName, onRowSelect, selectedRowSelector,
  fontSizePixels, shouldDispatch,
  flatHeader,
  inputs,
  alternatingColors,
  cellClass,
  classes,
  debugProp,
  rowsChoosable,
  groupSeparators
}){


  const [multiselectActive,setMultiselectActive] = React.useState(false);

  const [sortOrder,setSortOrder] = React.useState([]);

  const [ givingPulldowns, setGivingPulldowns ] = React.useState(false);
  
  const keyDownHandler = e => {

	if( e.key === 'Shift' ){
	  setMultiselectActive(true);
	}
  }

  const keyUpHandler = e => {
	if( e.key === 'Shift' ){
	  setMultiselectActive(false);
	}
  }

  React.useEffect(() => {
	
	window.addEventListener('keydown',keyDownHandler);
	window.addEventListener('keyup',keyUpHandler);

	return () => {
	  window.removeEventListener('keydown',keyDownHandler);
	  window.removeEventListener('keyup',keyUpHandler);

	}
  })

  let headerValues = useSelector(state=>{
    return header || Getters.getTableColumns( state, tableName )
  })

  let tableRows = useSelector(state=>{
	let grabbedRows = rows || Getters.getTableRows( state, tableName )
    return grabbedRows;
  })

  if( givingPulldowns ){
	tableRows = tableRows.map( row => {
	  return [
		[...row,"UBA"],
		[...row,"Actin"],
		[...row,"None"]
	  ]
	}).flat();

	headerValues = [...headerValues,"Pulldown"]
  }



  

  const columnValueSets = 
	(tableRows.length > 0 && getColumnValueSets(tableRows)) || [];


  const defaultFilters = headerValues.map(_=>[]);
  
  const [filters,setFilters] = React.useState(defaultFilters);

  if( headerValues.length !== filters.length ){
	setFilters(headerValues.map(_=>[]))
  }


  /*
   *
   * IMPLEMENT SORTING AND FILTERING FOR SELECTABLE TABLE
   *
   */

  const indexMap = computeIndexMap(tableRows, sortOrder, filters);

  let body = indexMap.map( (rr,ii) => {
    return (
      <SelectableRow
      row={rr.row}
      index={givingPulldowns ? (Math.floor(rr.index/3)) : rr.index}
      onSelect={onRowSelect}
      selectedRowSelector={selectedRowSelector||(()=>{})}
      tableName={tableName}
	  fontSizePixels={fontSizePixels}
	  shouldDispatch={shouldDispatch}
	  inputs={inputs}
	  multiselectActive={multiselectActive}
	  cellClass={cellClass}
	  classes={classes}
	  rowsChoosable={rowsChoosable}
	  groupSeparators={groupSeparators}
      />
    )
  })

  let rowPattern = (alternatingColors !== false && "table-striped") || "";

  let passedClasses = (classes && classes.join(' ')) || "";

  

  return (
    <div style={{position:'relative',maxHeight:'500px'}} class="scrollY">

	{false && <div onClick={() => setGivingPulldowns(true)} style={{position:'absolute', top:'0px',right:'0px',width:'10px',height:'10px',border:'1px solid blue'}}></div>}
    <table 
	class={"table "+rowPattern+" table-sm table-hover " + passedClasses }>
    <thead>
    <TableHead columns={headerValues} inputs={inputs} flatHeader={flatHeader} columnValueSets={columnValueSets} rowsChoosable={rowsChoosable} groupSeparators={groupSeparators}
	sortOrder={sortOrder}
	filters={filters}
	setFilters={setFilters}
	setSortOrder={setSortOrder}
	/>
    </thead>
    <tbody>
    {body}
    </tbody>
    </table>
    </div>
  )

}

export default SelectableTable;

