const express = require('express')
const puppeteer = require('puppeteer');
const fs = require('fs');
//const getCommandObject = require('./getTestCommandObject');

//const chalk = require('chalk');
//const runTest = require('./puppet');

//const v4 = require('uuid').v4;

//const sharp = require('sharp');

const app = express()
const port = 3030;
let browser;

const screenshotDOMElement = async function(page,opts = {}) {
  const padding = 'padding' in opts ? opts.padding : 0;
  const path = 'path' in opts ? opts.path : null;
  const selector = opts.selector;

  if (!selector)
    throw Error('Please provide a selector.');

  const rect = await page.evaluate(selector => {
    const element = document.querySelector(selector);
    if (!element)
      return null;
    const {x, y, width, height} = element.getBoundingClientRect();
    return {left: x, top: y, width, height, id: element.id};
  }, selector);

  if (!rect)
    throw Error(`Could not find element that matches selector: ${selector}`);

  return await page.screenshot({
    path,
    clip: {
      x: rect.left - padding,
      y: rect.top - padding,
      width: Math.round(rect.width) + padding * 2,
      height: Math.round(rect.height) + padding * 2
    }
  });
}


const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
})

function delay(time) {
  return new Promise(function(resolve) { 
    setTimeout(resolve, time)
  });
}

function getFirst(list){
  if( list.length === 0 ){
    throw {error:'empty'}
  }else{
    return list[0];
  }
}

const newActions = {
  click: list => getFirst(list).click(),
  count: list => list.length,
}

async function doAction(action,page,args){

  let selector = args[0];
  let remainingArgs = args.slice(1);

  console.log("action:");
  console.log(action);

  let result = page.evaluate((selector,action,remainingArgs) => {

    let results;
    if( '.#'.includes(selector[0]) ){
      results = Array.from(document.querySelectorAll(selector));
    }else{
      results = Array.from(document.querySelectorAll('*')).filter(res => res.innerText === selector);
    }
    
    return window.newActions[action](results,...remainingArgs);

  },selector,action,remainingArgs)

  return result;
  

}


const actions = {
  count: async (page,selector) => {
    //console.log(chalk.blue(selector));
    let results;
    if( '.#'.includes(selector[0]) ){
      console.log(chalk.bold("Regular selector!"));
      results = await page.$$(selector);
    }else{

      console.log(chalk.bold("ADVANCED selector!"));

      let bigQuery = await page.$$eval('*',options => options.map(opt => opt.textContent));
      let filtered = bigQuery.filter(xx => xx === selector);
      results = filtered;
    }

    return await results.length;

  },


  click: async (page,selector) => {
    let element = await selectElement(page,selector);
    //await page.evaluate(el => el.click(),element);
    //await page.click(selector)
  },
  type:  async (page,value) => await page.keyboard.type(value),
  print: async (page,selector) => {
    let item = await page.$(selector);
    let value = await page.evaluate(el => el.textContent,item)
    let result = await value;
    return await result;
    //console.log(await "Result: " + result);
  },
  scaledScreenshotCompare: async (page,a,b) => {
    let pathA = a.path || v4();
    let pathB = b.path || v4();
    let selectorA = a.selector || a;
    let selectorB = b.selector || b;

    let itemA = await page.$(selectorA);
    let itemB = await page.$(selectorB);
    
    await actions.screenshot(page,selectorA,pathA);
    await actions.screenshot(page,selectorB,pathB);




  },
  imageEquality: async (page,selector,file) => {
    //console.log(file);
    let item = await page.$(selector);
    if( !item ){
      throw Error(chalk.red.bold(selector) + " was not found.");

    }
    let src = await page.evaluate(el => {
      return el.src;
    },item);

    let base64 = await page.evaluate(src => {

      const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      })

      return fetch(src).then(res => res.blob()).then(toBase64);


    }, src)
    //console.log(chalk.blue(src));
    //console.log(chalk.magenta(base64.slice(0,100)));

    //await fs.writeFileSync('my_image.png',base64);

    return base64 === file;
  },

  screenshot: async(page, selector, path) => {
    await screenshotDOMElement(page,{
      path,
      selector,
      padding:0
    })

  }
}

async function google(query){

  let pages = await browser.pages();
  let page = await pages[0];
  await page.goto('http://google.com/');
  await page.$eval('INPUT', (input,query) =>{ input.value = query}, query)

  pages = await browser.pages();
  page = await pages[0];

  //await page.waitForSelector('h3');
  await Promise.all([
    page.$$eval('INPUT', inputs => inputs.filter(x => x.value === 'Google Search')[0].click()),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
  
  let results = await page.$$eval('h3', results => results.filter( x => x.parentNode.tagName === 'A' ).map( x => ({ link:x.parentNode.href, result:x.innerText}) ));

  console.log("Results are: \n");

  console.log(await results);


}



const runTest = async (testData) => {


  const pages = await browser.pages();
  let page = await pages[0];
  await page.goto('http://localhost:3000/')
  await page.setViewport({
    width:1440,
    height:877
  })

  for( let ii in testData ){

    let line = await testData[ii];
    let [action,...args] = await line.args;



    //console.log(await [action,args])
    let expectedOutput = await line.output && JSON.parse(line.output);
    if( !(action in actions) ){
      throw Error(chalk.red.bold("'"+action + "' is not a registered UI test action."));
    }
    //let actionResult = await actions[action](page,...args);
    // can't do this if it's "type" action
   

    page.evaluate(() => {
      window.getFirst = list => {
        if( list.length === 0 ){
          throw {error:'empty'}
        }else{
          return list[0];
        }
      }
      window.newActions = {
        click: list => getFirst(list).click(),
        count: list => list.length,
      }
    })

    console.log("--"+action+"--");
    let actionResult = await doAction(action,page,args);

    if( expectedOutput && actionResult !== expectedOutput ){
      return { 
        testResult:false, 
        line,
        expected:expectedOutput,
        received:actionResult
      }
    }
  }

  return { result: true }

}

const loadTest = async (test) => {

  let rawTestData = await fs.readFileSync('ui/'+test,'utf-8');
  let lines = await rawTestData.split('\n');
  let rawTestObjects = await lines.map(getCommandObject);
  let filteredTestObjects = await rawTestObjects.filter(
    obj => ![undefined,'#'].includes(obj.args[0][0])
  )

  return await filteredTestObjects;

}

const evaluateTest = async (path) => {
  let loadedTest = await loadTest(path);
  let testResult = await runTest(loadedTest);
  return { test:path, testResult }
}

const logTestResult = async ({test,testResult}) => {
  let verdict = await testResult.result ? 'Passed' : 'Failed';
  console.log(verdict + ' ' + test);
}

app.get('/:test', async (req, res) => {

  let test = await req.params.test;
  let result = evaluateTest(test)
    .then( result => {
      logTestResult(result);
      res.send(JSON.stringify(result));
    })
    .catch(error => {
      console.error(error);
      res.send("ERROR");
    });


})



async function findContactInfo(url){
  let homepage = await url.split('/').slice(0,3).join('/');

  const pages = await browser.pages();
  let page = await pages[0];
  await page.goto(homepage);
  await page.evaluate(() => window.scrollTo(0,document.body.scrollHeight));

  let info = await page.$$eval('*',results => {

    let numbers = [];
    let contactUs = [];
    results.forEach(el => {

      if(!el.innerText){
        return;
      }

      let lowered = el.innerText.toLowerCase();
      if( lowered.includes('contact') && lowered.href ){
        contactUs.push(el);
      }

      let numberCount = el.innerText.length >= 50 ? 0 : Array.from(el.innerText).reduce((a,b) => {
        return a + Number(b.trim() !== '' && !isNaN(b))
      },0)

      if(numberCount >= 10){
        numbers.push(el);
      }

    })

    return Promise.resolve({
      contactUs:contactUs.map(x => x.href),
      numbers:numbers.map(x => x.innerText)
    })

  })

  return info;

}

app.listen(port, async () => {
  browser = await puppeteer.launch({
    headless:true,
  });

  for(let ii = 0; ii < testData.length; ii++){ 
    let info = await findContactInfo(testData[ii].link);
  console.log(info);


  }

  
  

  
  console.log(`Puppeteer ready at http://localhost:${port}`)

  //await google("western blotting service");


  //let result = await evaluateTest('imageSetSettings.uin');
  //await logTestResult(result);
})

let testData = [
  {
    link: 'https://www.bosterbio.com/services/assay-services/western-blotting-service',
    result: 'Western Blot Service | Proteomics CRO Laboratory - Boster Bio'
  },
  {
    link: 'https://www.biocompare.com/26118-Western-Blot-Services/',
    result: 'Western Blot Services | Biocompare'
  },
  {
    link: 'https://www.raybiotech.com/auto-western-service/',
    result: 'Auto-Western Blotting Service - RayBiotech'
  },
  {
    link: 'https://www.westernblotservice.com/',
    result: 'Western Blot Service: Western Blot and Protein Expression ...'
  },
  {
    link: 'https://www.thermofisher.com/ca/en/home/life-science/protein-biology/protein-biology-learning-center/protein-biology-resource-library/pierce-protein-methods/overview-western-blotting.html',
    result: 'Overview of Western Blotting | Thermo Fisher Scientific - US'
  },
  {
    link: 'https://www.creative-proteomics.com/services/western-blot-electrical-transfer.htm',
    result: 'Western Blot and Electrical Transfer - Creative Proteomics'
  },
  {
    link: 'https://www.karebaybio.com/services/custom-immunoassay-services/immuno_western.html',
    result: 'Western Blot Analysis, Western Blot Services | Karebay'
  },
  {
    link: 'https://advansta.com/products/Protein-characterization-services/',
    result: 'Advansta Protein Characterization Services: Western blotting ::...'
  },
  {
    link: 'https://www.sydlabs.com/western-blot-services-p18.htm',
    result: 'Western Blot Services - Syd Labs'
  },
  {
    link: 'https://www.nature.com/scitable/definition/western-blot-288',
    result: ''
  },
  {
    link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3456489/',
    result: ''
  },
  {
    link: 'https://microbeonline.com/western-blot-technique-principle-procedures-advantages-and-disadvantages/',
    result: ''
  },
  {
    link: 'https://www.biorbyt.com/support/applications/troubleshooting/wb',
    result: ''
  },
  {
    link: 'https://www.topogen.com/p/western-blotting-services.html',
    result: 'Western Blotting Services: Topo I,IIa,IIb Protein Levels ...'
  }
]
