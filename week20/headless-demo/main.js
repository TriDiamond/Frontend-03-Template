const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.baidu.com/');
  // const a = await page.$('div')
  // console.log(await a.asElement().boxModel())
  const img = await page.$$('a')
  await browser.close();
})();