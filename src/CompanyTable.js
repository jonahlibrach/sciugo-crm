import { useState } from 'react';


let acceptableDefaults = {
  onLinkedIn: "0 - not found",
  'Company size':"0 - not found"
}

let columns = ['name','Reported Size', 'linkedinMembers','followers','Headquarters','Founded']
let type = [String,String,Number,Number,String,Number];

let paths = [['basicInfo','name'],['linkedinAbout','Company size','range'],['linkedinAbout','Company size','onLinkedIn'],['linkedinBasicInfo','followers'],['linkedinAbout','Headquarters'],['linkedinAbout','Founded']]

function getData(object,path){
  return _getData(object,path,object,path);
}

function _getData(object,path,originalObject,originalPath){ 
  if( path.length > 0 ){
    let subObject = object[path[0]];
    if(!subObject){
      //alert("Can't find '" + path[0] + "' in " + JSON.stringify(object)+"\nORIGINAL PATH: " + JSON.stringify(originalPath) + "\nORIGINAL OBJECT: " + JSON.stringify(originalObject))
      return acceptableDefaults[path[0]]
    }
    let data = _getData(object[path[0]],path.slice(1),originalObject,originalPath)
    return data;
  }else{
    return object;
  }
}

function companyData(company){ 
  return company.updates.slice(-1)[0] 
}

export default function CompanyTable({companies, nameFilter}){


  let [sortBy, setSortBy] = useState(null);
  let [sortDir, setSortDir] = useState(1);

  let sortedCompanies = companies;
  if( sortBy !== null ){
    sortedCompanies.sort( (a,b) => {
      let adata = getData(companyData(a),paths[sortBy])
      let bdata = getData(companyData(b),paths[sortBy]);
      if( type[sortBy] === String ){
        return sortDir * bdata.localeCompare(adata);
      }else if( type[sortBy] === Number ){
        let anum = Number(String(adata).replace(',',''));
        let bnum = Number(String(bdata).replace(',',''));
        return (bnum - anum) * sortDir;
      }else{
        throw Error("Unexpected data type!");
      }
      
    })
  }

  const maxWidth = 100;
  const fontSize = 10;

  const [selectedCompanyId,setSelectedCompanyId] = useState();



  return (
    <table>
      <thead>
        <tr>{columns.map((col,iiCol) => {
          return <td 
            onClick={() => { if(iiCol!==sortBy){ setSortBy(iiCol); setSortDir(1) }else{ setSortDir(-1 * sortDir) }}}
            style={{fontSize, overflow:'wrap',fontWeight:'bold', padding:10, background:(iiCol === sortBy)?'#f6f6f6':'unset'}}>{col}</td>
        })}</tr>
      </thead>
      {companies.filter(cc => cc.updates.slice(-1)[0].linkedinAbout).map( cc => {
        let data = cc.updates.slice(-1)[0];
        let isSelected = cc.linkedinPageId === selectedCompanyId;
        let background = isSelected ? '#fcfcfc' : 'unset';

        let splitText = data.linkedinAbout.overview.split(' ');
        let keyTerms = ['research','antibod']
        let formattedOverview = splitText.map(x => keyTerms.some(term => x.toLocaleLowerCase().includes(term)) ? <b>{x+" "}</b> : <span>{x+" "}</span>);

      
        return <>
          <tr onClick={() => setSelectedCompanyId(isSelected?null:cc.linkedinPageId)} style={{borderTop:'1px solid black'}}>
            {paths.map(path => <td style={{
              fontSize:10,
              background,
              borderTop:'1px solid black',maxWidth,padding:10}}>{getData(data,path)}</td>)}
          </tr>
          {isSelected && <tr>
            <td style={{padding:10, fontSize, background:'#fcfcfc'}} colSpan={columns.length}>
              <p><a target="_blank" href={data.basicInfo.website}>Website</a></p>
              <p style={{fontSize,lineHeight:1.5}}>{formattedOverview}</p>
            </td>

          </tr>}
        </>
      })}
    </table>
  )


}
