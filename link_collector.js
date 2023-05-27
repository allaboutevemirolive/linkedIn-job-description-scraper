const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
    const pathToExtension = path.join(__dirname, './uBlock0.chromium');
    const userDataDir = '/tmp/test-user-data-dir';
    const browserContext = await chromium.launchPersistentContext(userDataDir, {
        // headless: false,
        args: [
            `--disable-extensions-except=${pathToExtension}`,
            `--load-extension=${pathToExtension}`,
        ],
    });

    const page = await browserContext.newPage();

    const baseLink = 'https://www.linkedin.com/jobs/search/?currentJobId=3612327676&f_TPR=r86400&geoId=106808692&keywords=Java&location=Malaysia&start=';

    const scrapedData = [];

    for (let i = 0; i <= 300; i += 25) {
        const link = `${baseLink}${i}`;
        await page.goto(link);

        const jobIds = await page.$$eval('[data-occludable-job-id]', (elements) =>
            elements.map((element) => element.getAttribute('data-occludable-job-id'))
        );

        scrapedData.push(...jobIds);
        console.log(`Scraped ${jobIds.length} job IDs from ${link}`);
    }

    const data = scrapedData.join('\n'); // Join job IDs with newlines

    fs.writeFileSync('scraped_data.txt', data); // Write data to file

    console.log('Scraped data saved to scraped_data.txt');

    await browserContext.close();
})();
