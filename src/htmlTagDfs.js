// let dfs = (node) => { return { tag:node.tagName, children: node.children && Array.from(node.children).map(dfs)||[] } }; console.log(JSON.stringify(dfs(document.body),null));
/*
let dfs = (node) => { return { tag:node.tagName, innerText:node.innerText.trim(), children: node.children && Array.from(node.children).filter(node => node.tagName !== 'SCRIPT').map(dfs)||[] } } console.log(JSON.stringify(dfs(document.body),null));

*/

/*

Ideas for extracting names from 

*/

let fs = require('fs');

let paths = ['tree.json','silvio.json','cuervo.json']
let tree = JSON.parse(fs.readFileSync(paths[paths.length-1]));



let getAllChildren = (tree,countHolder,parentId) => {
  let treeId = countHolder[0];
  let children = [{...tree, innerText:tree.innerText && tree.innerText.trim(), treeId:countHolder[0], parentId}];
  countHolder[0]++;

  tree.children.forEach(child => {
    children.push(...getAllChildren(child, countHolder, treeId).flat());
  })
  return children;
}

let allChildren = getAllChildren(tree,[0],-1);


const TAGS_TO_KEEP = new Set(['P','DIV','LI'])

const nodeIsLikelyName = tree => {
  let innerTextWordCount = tree.innerText && tree.innerText.trim().split(' ').length;
  return tree.children.length ===0 && (2 <= innerTextWordCount && innerTextWordCount <= 5);
};

const treeFilter = tree => {

  return tree.children.length > 0;
}

const removeTreeProperty = (...properties) => tree => {
  let newTree = {
    ...tree,
    children:tree.children.map(removeTreeProperty(properties))
  };
  properties.forEach(property => delete newTree[property]);
  return newTree;
}

const doesTreeLikelyHaveName = tree => {
  return nodeIsLikelyName(tree) || tree.children.some(nodeIsLikelyName);
}



let structureMap = {};

let treeInfo = [];

allChildren.forEach((tree,treeId) => {
  let structure = JSON.stringify(removeTreeProperty('href','innerText','treeId','parentId')(tree));
  let hasName = doesTreeLikelyHaveName(tree);

  let structureId = structureMap[structure];

  if( structureId === undefined ){
    let structureCount = Object.values(structureMap).length;
    structureId = structureCount;
    structureMap[structure] = structureId;
  }

  treeInfo.push({
    structureId,
    hasName,
    treeId
  })


})

let allStructureIds  = treeInfo.map(info => info.structureId);
let numStructures = Math.max(...allStructureIds);

let summaryArray = Array(numStructures+1).fill(0).map(_ => ({ nameCount:0, treeIds:[] }));

treeInfo.forEach( info => {
  let {structureId, hasName, treeId} = info;
  let thisStructureInfo = summaryArray[structureId];
  thisStructureInfo.nameCount += Number(hasName);
  thisStructureInfo.treeIds.push(treeId);
})

let withNames = summaryArray.filter(xx => xx.nameCount > 0 && xx.treeIds.length > 2).map( out => ({...out, percentage:out.nameCount/out.treeIds.length}));

//console.log(withNames);

let withTrees = withNames.filter(x => x.percentage > 0.9).map( structureGroup => ({...structureGroup,treeIds:structureGroup.treeIds.map(id => JSON.stringify(allChildren[id]))}));

/*
 * We keep track of the different children who accessed their parent on the way up.
 * For each child, we continue going up as long as the parent has not been accessed by this child before.
 * 
 * This gives us the parent with the heaviest traffic.
*/
const getMostFrequentCommonAncestor = ({treeIds}) => {
  let visited = {};
  treeIds.forEach(id => {
    let curId = id;
    //console.log("Cur id  = " + curId)
    while(curId !== -1){
      let thisTreeInfo = allChildren[curId];
      let parentId = allChildren[curId].parentId;
      //console.log("\tThis tree info (id = " + curId+"): " + JSON.stringify(thisTreeInfo.parentId));
      let parentVisists = visited[parentId];
      if( parentVisists === undefined ){
        visited[parentId] = new Set([curId])
      }else{
        if( parentVisists.has( curId ) ){ break; }
      }
      visited[parentId].add(curId); 
      curId = parentId; 
    }
  });

  let mostVisisted = Object.entries(visited).reduce((most,next) => {
    if( next[1].size > most[1].size ){
      return next;
    }
    return most;
  },Object.entries(visited)[0])
  //console.log(mostVisisted);
  //console.log(Object.entries(visited));
  return mostVisisted;

}


let mostFrequentCommonAncestors = withNames.map(getMostFrequentCommonAncestor).reduce((most,next) => 
  next[1].size > most[1].size ? next : most
);

//console.log(mostFrequentCommonAncestors);

let peopleNodes = Array.from(mostFrequentCommonAncestors[1]).map(id => allChildren[id])

let getLeafNodes = tree => {
  let toReturn = tree.children.length === 0 ? [tree.innerText] : tree.children.map(getLeafNodes).flat();
  let extraData = ['src','href'];
  extraData.forEach(property => tree[property] && toReturn.push(tree[property]));
  return toReturn;
}

let leafTextOfPeopleNodes = peopleNodes.map(getLeafNodes);
console.log(leafTextOfPeopleNodes);

let leafNodes = getLeafNodes(peopleNodes[0]);
//console.log(leafNodes);

//peopleNodes.forEach(node => console.log(JSON.stringify(node)));
//console.log(peopleNodes);

//console.log(summaryArray);
//console.log(treeInfo);




let strungUp = allChildren.map(removeTreeProperty('innerText'))/*.filter(isLikelyName)*/.map(JSON.stringify);

//console.log(strungUp);

let treeStringCounts = {};

strungUp.forEach(string => treeStringCounts[string] = (treeStringCounts[string]||0) + 1);



let candidateTrees = Object.fromEntries(Object.entries(treeStringCounts).filter(entry => entry[1] > 1));

let counts = Object.values(candidateTrees);
//console.log(candidateTrees);

//console.log(counts);
