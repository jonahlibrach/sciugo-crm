queryLinkHead="http://www.google.com/search?ie=ISO-8859-1&hl=en-CA&source=hp&q="
queryLinkTail="&btnG=Google+Search&iflsig=ALs-wAMAAAAAYS188eaXMcjJ6LYTyQdxf2ZAbkQQlyzP&gbv=1"

cat LabomeCompanies | tail +2 | while read line; do
  template=$(echo $line | tr ' ' '+')"+lab+members"
  query=$queryLinkHead$template$queryLinkTail
  linkedinQuery=$queryLinkHead$(echo $line | tr ' ' '+linkedin')$queryLinkTail
  #echo $linkedinQuery

  linkList=$(w3m -dump_source "$query" | gunzip -f | LC_ALL=C tr '[<>]' '\n' | LC_ALL=C grep '^a' | grep -o 'https:[^&]*' | grep linkedin | head -1);
  #linkedinList=$(w3m -dump_source "$linkedinQuery" | LC_ALL=C tr '[<>]' '\n' | LC_ALL=C | grep 'linkedin')
  #echo $(echo $linkedinList | tr ' ' '\n')
  #otherLinks=$(echo -e $linkList | tr ' ' '\n' | grep -v linkedin | grep -v google | xargs | tr ' ' ',' | awk '{ print("[\""$0"\"]") }' | sed 's/,/","/g')
  echo -e $line"\t"$linkList
done
