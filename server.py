#!/usr/bin/env python3

from pudb import set_trace;
from flask_cors import CORS, cross_origin
#from readout_generator import readout_generator
#from pdf_generator import generate_pdf
from datetime import datetime

#from inventory_history import get_sample_properties
from flask import Response

from flask import abort
from flask import Flask
from flask import escape
from flask import request
from flask import render_template
from flask import send_from_directory
#For testing d3.js tree
from flask import render_template_string

from flask import url_for
from flask import jsonify
#from flask import open_resource 
from flask import current_app
from flask import session
from flask import redirect

from string import Template
from functools import cmp_to_key


import pymongo
from pymongo import MongoClient
from bson.objectid import ObjectId
from bson.errors import InvalidId

#from urllib import urlencode
import urllib3

import json
import os
import glob

import pprint

import traceback



from flask_mail import Mail,Message

PURPLE = '\033[95m'
CYAN = '\033[96m'
DARKCYAN = '\033[36m'
BLUE = '\033[94m'
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
BOLD = '\033[1m'
UNDERLINE = '\033[4m'
END = '\033[0m'


SYNC_KEY = 'syncKey'

MONGO_PORT = '11111'

# set_trace
client = MongoClient('mongodb://localhost:'+MONGO_PORT+'/')
print('Connection successful.')

def make_serializable( record ):
    if type(record) is ObjectId:
        return str(record)
    elif type(record) is list:
        for rr in range(len(record)):
            record[rr] = make_serializable(record[rr
])
    elif type(record) is dict:
        for key, val in record.items():
            if type(val) is ObjectId:
                record[key] = str(val)
            elif type(val) is not str:
                record[key] = make_serializable(val)
    return record

    return jsonify({'success':True})




# create the flask object
app = Flask(__name__, static_folder='build/static', template_folder='build')
CORS(app)

#app = Flask(__name__, static_folder='src', template_folder='public')

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = '*****'
app.config['MAIL_PASSWORD'] = '*****'
app.config['MAIL_DEFAULT_SENDER'] = app.config['MAIL_USERNAME']
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True

app.secret_key='jonahlibrach'
## enough with the secret key
import time
import json

def Lab(jsonData):
    firstLevelKeys = ['name','type','groupType','linkedinPageId','isPotentialClient','website','people']
    requiredKeys = ['name','groupType']
    if some([kk not in jsonData for kk in requiredKeys]):
        missingKeys = [kk for kk in requiredKeys if kk not in jsonData]
        raise "Missing required key from Lab: " + missingKeys[0]
    jsonData['date'] = time.time()
    return jsonData

def Company(jsonData):
    firstLevelKeys = ['type','groupType','linkedinPageId','isPotentialClient']
    firstUpdate = { "date":time.time() }
    data = {}

    for key, val in jsonData.items():
        destination = data if key in firstLevelKeys else firstUpdate
        destination[key] = val
    data['updates'] = [firstUpdate]
    return data




def Person(jsonData):
    if 'firstName' not in jsonData or 'lastName' not in jsonData:
        raise Error("A person needs a first and last name!")

    fromJsonData = ['firstName','lastName']
    firstLevelKeys = ['papers','connectedOnLinkedInTo','groups','linkedinRequestHistory','contactInfo']
    toInsert = {key:[] for key in firstLevelKeys}
    for key in fromJsonData:
        toInsert[key] = jsonData[key]

    return toInsert

def stringNameToObject(name):
    s = name.split(' ')
    return {"firstName":s[0],"lastName":s[-1]}


def getPersonDbId(strName):
    nameObject = stringNameToObject(strName)
    global client;
    result = client.db.people.find_one(nameObject)
    if result:
        return result['_id']
    else:
        toInsert = Person(nameObject)
        _id = client.db.people.insert(toInsert)
        return _id


@app.route('/getPapersWithAuthors')
def getPapersWithAuthors():
    papers = _get('papers')
    people = { str(p['_id']):p for p in _get('people') }
    for ii in range(len(papers)):
        pp = papers[ii]
        pp['authors'] = [ getName( people[ str(person) ] ) for person in pp['authors'] ]

    return jsonify(make_serializable(papers))
    


@app.route('/getPaperTitles')
def getPaperTitles():
    papers = _get('papers')
    return jsonify([paper['title'] for paper in papers if len(paper['title'].strip()) > 10])


@app.route('/requestMade',methods=['POST'])
def requestMade():
    global client;
    data = request.json
    data['date'] = time.time()
    client.db.linkedinEvents.insert_one(data)
    return jsonify({'success':True})


@app.route('/addPaper',methods=['POST'])
def addPaper():

    # need a comment for the api requirement
        # title
        # publicationDate
        # DOI
        # authors
        # correspondingAuthors

    global client;
    paperInfo = request.json

    print(paperInfo)

    # check if paper is already inserted
    paperRecordInDb = client.db.papers.find_one({"title":paperInfo['title']})

    paperId = None if not paperRecordInDb else paperRecordInDb['_id']

    if 'authors' not in paperInfo:
        return {"error":"Cannot add paper without authors."}

    authors = paperInfo['authors']
    authorDbIds = [ getPersonDbId(name) for name in authors ]

    paperKeys = ['articleUrl','title','DOI','publicationDate']
    extraPaperKeys = ['images','journal']

    correspondingAuthorEmails = {}
    for auth in paperInfo['correspondingAuthors']:
        print("auth: " + str(auth))
        authorIndex = authors.index(auth['name'])
        if 'email' in auth:
            email = auth['email']
            authDbId = authorDbIds[authorIndex]
            correspondingAuthorEmails[authDbId] = email

    correspondingAuthorsIds = list(correspondingAuthorEmails.keys())

    # create paper
    paper = {key:paperInfo[key] for key in paperKeys}
    for key in extraPaperKeys:
        if key in paperInfo:
            paper[key] = paperInfo[key]

    paper['authors'] = authorDbIds


    ## corresponding authors
    paper['correspondingAuthors'] = correspondingAuthorsIds if correspondingAuthorsIds else [authorDbIds[-1]]

    group = [{ "groupType":"paper", **paper }]


    if not paperId:
        paperId = client.db.papers.insert_many(group)[0]['_id']
    else:
        client.db.papers.update_one({"_id":paperId},{"$set":paper})
    print(PURPLE+"PAPER ID"+END)
    print(paperId)

    # add paper to each person
    # and add contact info to correponding authors
    
    for _id in authorDbIds:
        updateCmd = {"$addToSet":{"papers":paperId}}
        if _id in correspondingAuthorEmails:
            updateCmd['$addToSet']['contactInfo'] = {"email":correspondingAuthorEmails[_id]}
        client.db.people.update_one({ "_id":_id },updateCmd)

    referer = request.headers.get("Referer")
    print("Referrer: " + referer)

    if 'researchgate' in referer:
        return jsonify({"message":"Paper added.","type":"success"})

    return jsonify(make_serializable([
        [authors[ii],authorDbIds[ii]] for ii in range(len(authors))
    ]))


@app.route('/test')
def test():
    global client;
    print("Request receieved.")
    return jsonify({"message":"CRM server is running.",'success':True})



def getAllLinkedinPageIds():
    global client;
    results = [ res['linkedinPageId'] for res in client.db.group.find({},{"linkedinPageId":1}) ]
    return results

@app.route('/getByLinkedinPage/<linkedinProfileKey>')
def getByLinkedinPage(linkedinProfileKey):
    liEvents = _get("linkedinEvents")
    print(len(liEvents))

    #return "jonah"
    person = [p for p in liEvents if 'profileLink' in p and linkedinProfileKey in p['profileLink']]

    #return jsonify(make_serializable(person))
    
    if not person:
        return None
    else:
        personId = ObjectId(person[0]['personId'])
        person = client.db.people.find_one({"_id":personId})

        papers = [ObjectId(pId) for pId in person['papers']]
        print(papers)
        
        paperRecords = [pape for pape in client.db.papers.find({"_id":{"$in":papers}})]



        for ii in range(len(paperRecords)):
            rec = paperRecords[ii]
            authorIds = [ObjectId(authId) for authId in rec['authors']]
            authorRecs = client.db.people.find({"_id":{"$in":authorIds}})
            names = [ auth['firstName'] + ' ' + auth['lastName'] for auth in authorRecs ]
            rec['authors'] = names


        return jsonify(make_serializable(paperRecords))




    return True

@app.route('/getAllLinkedinPageIds')
def GET_ALL_LINKEDIN_PAGE_IDS():
    return jsonify(getAllLinkedinPageIds())

def _get(table):
    global client;
    res = [r for r in client.db[table].find({})]
    return res

@app.route('/get/<table>')
def get(table):
        return jsonify(make_serializable(_get(table)))

@app.route('/people')
def people():
    global client;
    res = [r for r in client.db.people.find({},{'_id':0})]
    return jsonify(make_serializable(res))

@app.route('/group')
def group():
    global client;
    res = [r for r in client.db.group.find({},{'_id':0})]
    return jsonify(make_serializable(res))

@app.route('/topCorrespondingAuthors')
def topCorrespondingAuthors():
    papers = _get('papers')

    counts = {}
    for pp in papers:
        for cAuth in pp['correspondingAuthors']:
            counts[str(cAuth)] = 1 if str(cAuth) not in counts else counts[str(cAuth)]+1


def getName(person):
    return person['firstName'] + ' ' + person['lastName']


@app.route('/topAuthors')
def topAuthors():
    global client;
    paperCounts = []
    for ii in range(0,100):
        paperCounts.append([])
    people = _get('people')
    print("There are : " + str(len(people)) + " people.")
    for pp in people:
        #theirPapers = [p for p in client.db.papers.find({"_id":{"$in":pp['papers']}},{"authors":1})]
        #coauthorIds = []
        #for pap in theirPapers:
        #    coauthorIds.extend(pap['authors'])
        #authors = [getName(auth) for auth in client.db.people.find({"_id":{"$in":coauthorIds}})]
        paperCounts[len(pp['papers'])].append(getName(pp))#,len(pp['papers']),authors])

    res = []
    for ii in range(3,len(paperCounts)):
        if paperCounts[ii]:
            res.append(paperCounts[ii])

    return jsonify(make_serializable(res[::-1]))



def insertPeopleIntoDatabase(data):
    print(PURPLE+BOLD + "Number of people to process: " + str(len(data['people'])) + END)
    print(data.keys())
    linkedinPageId = data['linkedinPageId']

    peopleData = data['people']


    profileSplits = [ person['profileLink'].split('/') for person in peopleData ]
    linkedinProfileIds = [ split[split.index('in')+1] for split in profileSplits ]

    print(linkedinProfileIds[:10])

    # insert people that aren't in the database
        # 
    # add person uuid to company persons

    companyPeopleIds = client.db.group.find_one({"linkedinPageId":linkedinPageId},{"_id":1,"people":1,"linkedinPageId":1})
    print(companyPeopleIds)
    

@app.route('/set',methods=['POST'])
def setRecord():
    global client;
    data = request.json
    print(data)
    recordType = data['type']
    properties = data['properties']
    _id = data['_id']
    client.db[recordType].update_one({"_id":ObjectId(_id)},{"$set":properties})
    return jsonify({'success':True})



@app.route('/add',methods=['POST'])
def add():
    global client;
    print("Request receieved.")
    data = request.json

    toInsert = None
    datatype = data['type']
    if datatype == 'group' and data['groupType'] == 'company':
        recordIds = [ res['_id'] for res in client.db.group.find({"linkedinPageId":data['linkedinPageId']},{'_id':1}) ]
        #print(PURPLE + BOLD + "Record Ids: " + str(recordIds) + END)

        if 'people' in data:
            insertPeopleIntoDatabase(data)

        if len(recordIds) > 1:
            return jsonify({"type":"error","message":"This company exists twice in the database."})
        elif len(recordIds) == 0:
            toInsert = Company(data)
            client.db.group.insert_one(toInsert)

            isPotentialClient = data['isPotentialClient']

            description = 'potential client' if isPotentialClient else 'company (not current focus)'

            return jsonify({"type":"success", "message":"Inserted 1 new "+description+"."})
        else:
            _id = recordIds[0]
            theUpdate = Company(data)['updates'][0]
            client.db.group.update_one({'_id':_id},{'$push':{ 'updates':theUpdate }})
            return jsonify({"type":"success", "message":"Updated data on 1 company."})
    elif datatype == 'group' and data['groupType'] == 'publication':
        pass
    elif datatype == 'group' and data['groupType'] == 'lab':
        return jsonify({"type":"error","message":"Lab group not yet implemented"})

    elif datatype == 'person':
        requiredFields = ['name']
        return jsonify({"type":"error","message":"Can only handle (group,company), but got type = " + str(datatype)})



    return jsonify({"message":"Test success."});


if __name__ == '__main__':
    app.run(host="127.0.0.1",
            port=4444,
            debug=True, 
            threaded=True)

