import requests
import json

data = json.loads(open('testLab.json').read())
requests.post("http://localhost:4444/add",json=data)
