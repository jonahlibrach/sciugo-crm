import time
import json
import importlib
import sys


import selenium
from selenium import webdriver

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains


from pudb import set_trace;
from flask_cors import CORS, cross_origin
#from readout_generator import readout_generator
#from pdf_generator import generate_pdf
from datetime import datetime

#from inventory_history import get_sample_properties
import flask as f
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

app = Flask(__name__, static_folder='build/static', template_folder='build')
cache = {}

@app.route('/search/<name>')
def search(name):
    if 'mobileDriver' not in cache:
        start()
    mobileDriver = cache['mobileDriver']
    if not mobileDriver:
        return RED+BOLD+"You must launch mobile driver with /start\n"+END

    print(name)
    
    import ProfileFinder; importlib.reload( ProfileFinder ); from ProfileFinder import getMatch; match = getMatch(mobileDriver,name)

    return jsonify(match)


@app.route('/start')
def start():
    cache['requests'] += 1
    luse = 'jlibrach@yahoo.ca'
    lpass = '$9*X(>>?~(s4,3,'
    mobile_emulation = { "deviceName": "Nexus 5" }
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_experimental_option("mobileEmulation", mobile_emulation)
    mobileDriver = webdriver.Chrome(options=chrome_options)
    cache['mobileDriver'] = mobileDriver
    mobileDriver.get('http://linkedin.com')
    mobileDriver.find_element_by_id('session_key').send_keys(luse)
    mobileDriver.find_element_by_id('session_password').send_keys(lpass)
    dismiss_button = mobileDriver.find_elements_by_class_name('promo__dismiss')
    if dismiss_button:
        dismiss_button[0].click()
    
    mobileDriver.find_element_by_class_name('sign-in-form__submit-button').click()
    return 'Success.'

@app.route('/startResearchgateDriver')
def startResearchgateDriver():
    cache['requests'] += 1
    luse = 'jaslibra@uwaterloo.ca'
    lpass = 'k4H,P,C*km2e6Jp'
    #mobile_emulation = { "deviceName": "Nexus 5" }
    #chrome_options = webdriver.ChromeOptions()
    #chrome_options.add_experimental_option("mobileEmulation", mobile_emulation)
    researchgateDriver = webdriver.Chrome()#options=chrome_options)
    cache['researchgateDriver'] = researchgateDriver
    researchgateDriver.get('https://www.researchgate.net/login')
    researchgateDriver.find_element_by_id('input-login').send_keys(luse)
    researchgateDriver.find_element_by_id('input-password').send_keys(lpass)
    researchgateDriver.find_element_by_class_name('action-submit').click()
    return 'Success.'

def getResearchGateSearchURL(paperTitle):
    base ='https://www.researchgate.net/search.Search.html?type=publication&query='
    paperParam = paperTitle.replace(' ','%20')
    return base + paperParam

@app.route('/searchResearchgate',methods=['POST'])
def searchResearchgate():
    data = request.get_json()
    paperTitle = data['title']
    if 'researchgateDriver' not in cache:
        startResearchgateDriver()
    researchgateDriver = cache['researchgateDriver']
    researchgateDriver.get(getResearchGateSearchURL(paperTitle))

    getAuthorHrefScript = "return Array.from(document.querySelectorAll('.search-box__result-item')[0].querySelectorAll('.gtm-profile-item')).slice(-1)[0].parentNode.parentNode.href"

    href = researchgateDriver.execute_script(getAuthorHrefScript)

    researchHref = href.split('?')[0]+'/research'
    driver.get(researchHref)

    return href





if __name__ == '__main__':
    cache['requests'] = 0
    app.run(host="127.0.0.1", port=5555, debug=True, threaded=True)
    










