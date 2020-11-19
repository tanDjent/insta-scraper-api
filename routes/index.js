var express = require('express');
var router = express.Router();
const puppeteer =require('puppeteer');
var situation=200;
async function autoScroll(page){
  await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
          var totalHeight = 0;
          var distance = 100;
          var timer = setInterval(() => {
              var scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if(totalHeight >= scrollHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 100);
      });
  });
}
const scrapeImages=async (username)=>{
  const browser= await puppeteer.launch();
  const page =await browser.newPage();
  await page.goto('https://www.instagram.com/');
  await page.waitForSelector('input[name="username"]');
  await page.type('input[name="username"]', 'abcd');
  await page.type('input[name="password"]', 'abcd');
  await page.click('button[type="submit"]');
 
  await page.waitForSelector('img[alt="abcd\'s profile picture"]');
  await page.goto(`https://www.instagram.com/${username}`);

  await page.waitForSelector('h2 ',{visible:true,
  });
  const h2Text= await page.evaluate(()=>{
      return document.querySelector('h2').innerHTML;
  })
  console.log(h2Text);

  if(h2Text==="Sorry, this page isn't available."){
      const data="Sorry, this user isn't available: "+username;
      situation=404;     
      await browser.close();
      console.log(data);
      return data
  }

  await page.waitForSelector('img ',{visible:true,
  });
  await autoScroll(page);

  await page.screenshot({path:'./public/images/screenshot.png',
  fullPage:true,
  omitBackground:true});
  const data = await page.evaluate( () => {

      const images = document.querySelectorAll('img');

      const urls = Array.from(images).map(v => v.src);

      return urls
  });
  

  await browser.close();

  situation=200;
  console.log(data);
  return data;

}
/* GET home page. */
router.route('/:username')
.get(async (req,res,next)=>{
  const imgurls=JSON.stringify(await scrapeImages(req.params.username));
  res.statusCode=situation;
  res.end(imgurls);
})
.put((req,res,next)=>{
    res.statusCode=403;
    res.end('PUT operation not supported');
})
.post((req,res,next)=>{
    res.statusCode=403;
    res.end('POST operation not supported');
})
.delete((req,res,next)=>{
    res.statusCode=403;
    res.end('DELETE operation not supported');
})
module.exports = router;
