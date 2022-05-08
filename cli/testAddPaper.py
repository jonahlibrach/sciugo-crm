import json
import requests
with open('papersToImport.json') as f:
    data = json.loads(f.read())

for paper in data: 
    res = requests.post("http://localhost:4444/addPaper",json=paper)
#print(res.json())
