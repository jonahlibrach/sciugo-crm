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

sys.path.insert(1,'/Users/jonahlibrach/Documents/founder/signinLinkedin')
from signinLinkedin import signIn

luse = 'sciugo.recruiting@gmail.com'
lpass = 'jonahadamjonah'

luse = 'jlibrach@yahoo.ca'
lpass = '$9*X(>>?~(s4,3,'

luse = 'jaslibra@uwaterloo.ca'
lpass = 'sciugo44'

driver = webdriver.Chrome()

signIn(driver,luse,lpass)

driver.get("file:///Users/jonahlibrach/crm/cstData.html")



