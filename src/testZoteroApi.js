const { default: api } = require('zotero-api-client');
let fs = require('fs');

async function go(){
  let keyInfo = JSON.parse(fs.readFileSync('/Users/jonahlibrach/crm/keys/zotero.json'));
  let userId = keyInfo.user_id;
  let key = keyInfo.key;
  console.log(key);
  const myapi = await api(key).library('user',keyInfo.user_id);
  const itemsResponse = await myapi.collections().get();
  console.log(itemsResponse.getData());
  //console.log(await myapi.items().top());
  //console.log(myapi);
  //const response = .items().get();
  //const items = response.getData();
  //console.log(items.map(i => i.title));
}

go();
