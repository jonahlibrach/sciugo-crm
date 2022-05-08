window.inCache = {};
Array.from(document.querySelectorAll('.person-info-box')).forEach( x => {
    x.parentNode.removeChild(x);
})
if( window.mousewatch ){ document.removeEventListener('mousemove',window.mousewatch) }
window.mousewatch = e => {
    if(!e.shiftKey){ return; }

    //console.log(e.composedPath())
    let hrefEle = e.composedPath().find(ele => ele?.href?.includes('/in/'));
    if( hrefEle ){
        console.log(hrefEle.href);

        let {href} = hrefEle;
        let inLink = href.split('/').filter(x => x).slice(-1)[0];

        let divAlreadyExists = false;
        Array.from(
            document.querySelectorAll('.person-info-box')
        ).forEach(div => {
            if( div.id === inLink ){
                divAlreadyExists = true;
                div.style.display = 'flex';
            }else{
                div.style.display = 'none';
            }
        })
        if(divAlreadyExists){
            console.log("Div already exists!");
            return;
        }

        new Promise((res,rej) => {

            if(inLink in window.inCache){
                res(window.inCache[inLink])
            }else{
                fetch('http://localhost:4444/getByLinkedinPage/'+inLink).then(dat => dat.json()).then(data => { window.inCache[inLink] = data; res(data) }).catch(err => window.inCache[inLink] = {error:err})
            }
        }).then(data => {

            let newDiv = document.createElement("DIV");

            let buttonDiv = document.createElement("DIV");
            newDiv.appendChild(buttonDiv);

            let button = document.createElement("BUTTON");
            button.addEventListener('click',e => {
                e.preventDefault();
                e.stopPropagation();
                Array.from(document.getElementsByClassName('person-info-box')).forEach(box => box.style.display = 'none');
                //newDiv.style.display = 'none';
            })

            button.innerText = 'Close';
            buttonDiv.appendChild(button);

            newDiv.id = inLink;
            newDiv.className='person-info-box';
            let style = { display:'flex', 'flex-direction':'column-reverse', background:'lime', position:'fixed', bottom:'0px', left:'0px',
                //width:'100px', height:'100px', 
                'z-index':1000 }
            Object.entries(style).forEach(([key,value]) => newDiv.style[key] = value);
            //newDiv.style = style;
            console.log(newDiv);
            console.log(data);
            for(let paper of data){
                let innerDiv = document.createElement("DIV");
                innerDiv.style['font-size'] = '9px';
                let titleDiv = document.createElement("DIV")

                let imageDiv = document.createElement("DIV")

                titleDiv.innerText = paper.title;

                imageDiv.style['display'] = 'flex';
                imageDiv.style['flex-direction'] = 'row';


                paper.images.forEach(src => {
                    let imgChild = document.createElement("IMG");
                    imgChild.style.width='75px';
                    imgChild.src = src;
                    imgChild.style.margin='10px';
                    imageDiv.appendChild(imgChild);
                })

                innerDiv.appendChild(titleDiv);
                innerDiv.appendChild(imageDiv);

                newDiv.appendChild(innerDiv);
            }

            document.body.appendChild(newDiv);
            

        })



    }

}; 

document.addEventListener('mousemove',window.mousewatch)
