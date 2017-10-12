const puppeteer = require('puppeteer');

async function launch() {
    // Launch browser instance
    const browser = await puppeteer.launch();
    
    // Open new page
    const page = await browser.newPage();
    
    // Go to medium.com page
    await page.goto('https://medium.com');

    await browser.close();
}

launch();