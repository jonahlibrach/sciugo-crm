$$('.nova-legacy-v-publication-item__stack nova-legacy-v-publication-item__stack--gutter-m'.replace(' ','.')).map((x,ii) => {
    let title = x.children[0].children[0].children[0].innerText;
    let authors = Array.from(x.children[2].children[0].children).map(x => x.innerText)
    let date = x.children[1]
    let time = times[ii].innerText
    return { title, authors, time  }
})
