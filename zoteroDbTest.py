con = sqlite3.connect('/Users/jonahlibrach/Zotero/zotero.sqlite')

cur = con.cursor()

cols = [ii for ii in cur.execute('select * from collections where colletion;')]

colId = 38

itemIds = '(select itemId from collectionItems where collectionId = '+str(colId)+')'

key='8SIPTBWR'

colItems = [ii for ii in cur.execute()]

tables = [tt for tt in cur.execute("SELECT name FROM sqlite_master WHERE type='table';")]

for tt in tables:
    tCols = [data[0] for data in cur.execute('select * from '+tt[0]).description ]
    print(tt[0]+'\t'+str(tCols))

authorsResult = cur.execute('select * from itemCreators INNER JOIN creators on creators.creatorID = itemCreators.creatorID where itemId in '+itemIds)

[desc[0] for desc in authors.description]

for a in [a for a in authors][:20]:
    print(a)

items = {}
authors = [a for a in authorsResult]
for a in authors:
    if a[0] in items:
        items[a[0]].append([a[5],a[6]])
    else:
        items[a[0]] = [[a[5],a[6]]]

lastAuthors = [ val[-1] for key,val in items.items()]
'\n'.join([' '.join(la) for la in lastAuthors])

colItems

for ii in cols:
    print(ii)


