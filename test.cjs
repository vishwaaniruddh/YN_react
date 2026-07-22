const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  
  // Wait a moment for Framer motion
  await new Promise(r => setTimeout(r, 2000));
  
  const titleStyle = await page.evaluate(() => {
    const el = document.querySelector('.hero__title');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return {
      text: el.innerText,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      opacity: style.opacity,
      visibility: style.visibility,
      display: style.display,
      color: style.color,
      zIndex: style.zIndex
    };
  });
  
  const labelStyle = await page.evaluate(() => {
    const el = document.querySelector('.hero__label');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return {
      text: el.innerText,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      opacity: style.opacity,
      visibility: style.visibility,
      display: style.display
    };
  });
  
  console.log('TITLE:', titleStyle);
  console.log('LABEL:', labelStyle);
  
  await browser.close();
})();
