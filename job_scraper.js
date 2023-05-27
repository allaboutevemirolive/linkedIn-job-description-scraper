const { chromium } = require('playwright');
const fs = require('fs');
const { htmlToText } = require('html-to-text');

(async () => {
    try {
        const baseLink = 'https://www.linkedin.com/jobs/view/';
        const scrapedData = fs.readFileSync('1scraped_data.txt', 'utf8').trim().split('\n');

        const browser = await chromium.launch();
        const context = await browser.newContext();

        for (const number of scrapedData) {
            const link = baseLink + number;

            const page = await context.newPage();
            await page.goto(link, { referer: page.url() });

            await page.waitForSelector('button[aria-label="Show more, visually expands previously read content above"]');
            await page.click('button[aria-label="Show more, visually expands previously read content above"]');
            await page.waitForTimeout(2000);

            const jobTitleElement = await page.$('.top-card-layout__title');
            const jobTitle = jobTitleElement ? await jobTitleElement.innerText() : '';

            const companyTitleElement = await page.$('.topcard__org-name-link');
            const companyTitle = companyTitleElement ? await companyTitleElement.innerText() : '';

            const jobDescriptionElement = await page.$('.show-more-less-html__markup');
            const jobDescriptionHTML = jobDescriptionElement ? await jobDescriptionElement.innerHTML() : '';

            const options = {
                wordwrap: false, // Preserve line breaks
            };
            const jobDescriptionText = htmlToText(jobDescriptionHTML, options);

            const jobName = jobTitle.toLowerCase().replace(/\s/g, '_');
            const companyName = companyTitle.toLowerCase().replace(/\s/g, '_');

            const symbolsRegex = /[/\\:*?"<>|]/g;

            const purgeFileName = companyName + '_' + jobName;
            const filename = purgeFileName.replace(symbolsRegex, '') + '.txt';

            const content = `Website: ${page.url()}\n\n${jobTitle}\n\n${jobDescriptionText}`;

            fs.writeFile(filename, content, (err) => {
                if (err) {
                    throw err; // Throw the error to be caught in the catch block
                } else {
                    console.log(`Job details saved to ${filename}`);
                }
            });

            await page.waitForTimeout(3000);
            await page.close(); // Close the current page instead of creating a new one
        }

        await browser.close();
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();
