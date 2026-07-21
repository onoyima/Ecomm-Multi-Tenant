import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
  });

  try {
    await page.goto('http://localhost:5001', { waitUntil: 'networkidle2', timeout: 10000 });
    console.log('Navigation complete');
  } catch (e) {
    console.log('Navigation failed:', e.message);
  }

  await browser.close();
})();
