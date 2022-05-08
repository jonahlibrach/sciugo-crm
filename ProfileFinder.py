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
import selenium
from selenium import webdriver

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains

import time
import json
import importlib
import sys

match_terms = ['gene','research','bio','professor','phd','postdoc','cell','prot','drug','scien','onco','pharma']

def getMatch(mobileDriver, queriedName,corresponding=''):
    
    searchName = queriedName.split(' ')
    full = searchName[0] + '+' + searchName[-1]
    print('\n'+PURPLE+BOLD+' '.join(searchName) + BLUE+' ('+corresponding+')'+END)

    mobileDriver.get('https://www.linkedin.com/mwlite/search/results/all?keywords='+full)
    links = mobileDriver.find_elements_by_class_name('primary-details')
    good = []
    no_match = []
    details = []
    bad = []

    for iiLink in range(len(links)):
        link = links[iiLink]
        href = link.get_property('href')
        personInfo = link.find_element_by_class_name('name').find_elements_by_tag_name('span')
        if len(personInfo) != 3:
            details.append(None)
            continue
        name = personInfo[0].get_property('innerText')
        dist = int(personInfo[2].get_property('innerText')[0])
        headline = link.find_element_by_class_name('headline').find_element_by_tag_name('span').get_property('innerText')
        toAppend = {"href":href,"name":name,"headline":headline,"distance":dist}
        term_matches = []
        for term in match_terms:
            if term in headline.lower():
                term_matches.append(term)


        nameNoComma = name.split(',')[0]
        nameNoInitial = ' '.join(list(filter(lambda x: '.' not in x,name.split(' '))))

        firstAndLastInside = searchName[0] in nameNoInitial.lower() or searchName[-1] in nameNoInitial.lower()

        if term_matches and (nameNoInitial.lower() == queriedName.lower() or firstAndLastInside):
            good.append(toAppend)
        elif nameNoInitial.lower().replace('-',' ') == queriedName.replace('-',' '):
            no_match.append(toAppend)
        else:
            bad.append(toAppend)

    for gg in range(len(good)):
        print(str(gg) + ': ' + good[gg]['headline'] + ' || ' + BLUE + good[gg]['name'] + END)

    print('------')

    for gg in range(len(no_match)):
        print(str(gg+len(good)) + ': ' + no_match[gg]['headline'] + ' || ' + BLUE + no_match[gg]['name'] + END)

    for gg in range(len(bad)):
        print('*. : ' + bad[gg]['headline'] + ' || ' + BLUE + bad[gg]['name'] + END)

    return {"good":good,"results":[*good,*no_match],"bad":bad}


def ProfileFinder(mobileDriver, nameList, keepers, skipped, filepath, startingIndex=0):
    for line in nameList[startingIndex:len(nameList)]:
        splitLine = line.split('|')
        name = splitLine[0]
        corresponding = splitLine[1].strip()
        lastNameSearched = name
                
        getMatchResults = getMatch(mobileDriver,name)
        results = getMatchResults['results']
        print("len(results): " + str(len(results)))
        if len(results) == 0:
            x = ''
        
        elif len(results) ==1 or len(getMatchResults['good']) == 1:
            x = '0'
        else:
            x = input()
            x = x.strip()

        if x == 'q':
            break
        elif x == '':
            print("Skipping: " + name)
            skipped.append(name)
            continue
        toExtend = [ results[int(index)] for index in x.split(' ') ]
        print("Adding: " +str(toExtend))
        keepers.extend( toExtend )
        with open(filepath,'w') as f:
            f.write( json.dumps(keepers,indent=1) )


        

