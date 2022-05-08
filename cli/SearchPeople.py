import json
import requests

#with open('peopleSummary.json') as f:
#    data = json.loads(f.read())
#    data = list(filter(lambda x: x['name'].strip(),data))


peopleList = requests.get('http://localhost:4444/topAuthors').json()
print(peopleList)
SearchedIds = set()
for person in peopleList:
    if 'searchData' in person:
        SearchedIds.add(person['_id'])


namesToSkip = ['Maggie Sun','Yu Kim']

#print(data[0]['name'])
#print(data[0])

for iiPerson in range(len(peopleList)):
    print(str(iiPerson) + "/" + str(len(peopleList)))
    person = peopleList[iiPerson]
    name = person['firstName'] + ' ' + person['lastName']
    if person['_id'] in SearchedIds or name in namesToSkip:
        print("Skipping " + name)
        continue
    print(name)
    res = requests.get('http://localhost:5555/search/'+name).json()
    postData = {"_id":person['_id'], "properties":{ "searchData":res }, "type":"people" }
    requests.post('http://localhost:4444/set',json=postData)
    SearchedIds.add(person['_id'])



