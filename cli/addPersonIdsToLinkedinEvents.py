import requests
import json
from bson.objectid import ObjectId

people = list(json.loads( open( 'toFix.json' ).read() ).values())

import pymongo
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:11111/')

for pp in people:
    ##print(pp)
    res = [ r for r in client.db.linkedinEvents.find({"name":pp['name']})]
    if len(res) == 1:
        _id = res[0]['_id']
        client.db.linkedinEvents.update_one({"_id":ObjectId(_id)},{"$set":{"personId":pp['personId']}})
        #print(_id)







