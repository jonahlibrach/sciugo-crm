let isPerson = x => ['profile','scientific-contribution'].some(word => x.href.includes(word));
let allAuthors = Array.from(document.querySelectorAll('a.research-detail-author')).filter(isPerson).map(x => x.innerText);
let authors = allAuthors.slice(0,-1);
let correspondingAuthors = [{name:allAuthors[allAuthors.length-1]}];
let DOI = Array.from(document.querySelectorAll('a')).filter(x => x.href.includes('doi'))[0].href
let title = document.querySelector('.nova-legacy-e-text.nova-legacy-e-text--size-xl.nova-legacy-e-text--family-sans-serif.nova-legacy-e-text--spacing-xs.nova-legacy-e-text--color-inherit').innerText;

let [publicationDate,journal] = Array.from(document.querySelector('.research-detail-meta').children[0].children[0].children).map(x => x.innerText)

let articleImageNodes = Array.from(Array.from(document.querySelectorAll('.nova-legacy-c-card.nova-legacy-c-card--spacing-xl.nova-legacy-c-card--elevation-1-above')).filter(x => x.innerText.includes('Abstract and figures'))[0].querySelectorAll('img'));

let images = articleImageNodes.map(x => x.src);

console.log({ authors, correspondingAuthors, DOI, title, publicationDate, journal, images });
