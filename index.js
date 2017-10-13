const puppeteer = require('puppeteer');

(async function() {
    // Launch browser instance
    const browser = await puppeteer.launch();
    
    // Open new page
    const page = await browser.newPage();
    
    // Go to medium.com page
    await page.goto('https://medium.com', { waitUntil: 'networkidle' });
    
    const mediumStoriesGroupedByCategory = await page.evaluate(() => {
        // The content of this function is executed inside the browser,
        // so we need to declare utility functions inside this code block.
        // Otherwise, they'll be undefined when executing the code.

        function getURLfromBackgroundImage(backgroundImageString) {
            return backgroundImageString.replace(/^url\(['"](.+)['"]\)/, '$1');
        }

        function extractHomeFeedSections() {
            return Array.from(document.querySelectorAll('.js-homeStream > .streamItem > section'));
        }
        
        function extractSectionName(section) {
            return section.querySelector('header a').innerText;
        }
        
        function extractStoriesInformation(section) {
            const stories = Array.from(section.querySelectorAll('.js-trackedPost'));

            return stories.map(story => {
                const storyId = story.getAttribute('data-post-id');
                const storyLink = story.querySelector('a[href]').getAttribute('href');
                const storyDate = story.querySelector('time').getAttribute('datetime');
                const storyTitleElement = story.querySelector('h3');
                const storyDescriptionElement = story.querySelector('h4');
                const storyAuthorElement = story.querySelector('.postMetaInline-authorLockup > a');
                const storyImageElement = story.querySelector('.u-block.u-backgroundSizeCover');

                return {
                    id: storyId,
                    link: storyLink,
                    date: storyDate,
                    title: storyTitleElement && storyTitleElement.innerText,
                    description: storyDescriptionElement && storyDescriptionElement.innerText,
                    author: storyAuthorElement && storyAuthorElement.innerText,
                    image: storyImageElement && getURLfromBackgroundImage(storyImageElement.style['background-image']),
                }
            });
        }

        const sections = extractHomeFeedSections();

        return sections.map(section => {
            const sectionName = extractSectionName(section);
            const sectionStories = extractStoriesInformation(section) || [];

            return {
                name: sectionName,
                stories: sectionStories
            };
        });
    });

    console.log(JSON.stringify(mediumStoriesGroupedByCategory, null, 2));

    await browser.close();
})();