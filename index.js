const puppeteer = require('puppeteer');

(async function() {
    // Launch browser instance
    const browser = await puppeteer.launch();
    
    // Open new page
    const page = await browser.newPage();
    
    // Go to medium.com page
    await page.goto('https://medium.com', { waitUntil: 'networkidle' });
    
    const mediumHomeInformation = await page.evaluate(() => {
        // The content of this function is executed inside the browser,
        // so we need to declare utility functions inside this code block

        function getURLfromBackgroundImage(backgroundImageString) {
            return backgroundImageString.replace(/^url\(['"](.+)['"]\)/, '$1');
        }

        function extractHomeFeedSections() {
            const homeSections = document.querySelectorAll('.js-homeStream > .streamItem');
            return Array.from(homeSections).map(section => section.children[0]);
        }
        
        function extractSectionName(section) {
            return section.querySelector('header a').innerText;
        }
        
        function extractPostsInformation(section) {
            const posts = section.querySelectorAll('.js-trackedPost');

            return Array.from(posts).map(post => {
                const postIdElement = post.getAttribute('data-post-id');
                const postLinkElement = post.querySelector('a[href]').getAttribute('href');
                const postTitleElement = post.querySelector('h3');
                const postDescriptionElement = post.querySelector('h4');
                const postAuthorElement = post.querySelector('.postMetaInline-authorLockup > a');
                const postImageElement = post.querySelector('.u-block.u-backgroundSizeCover');

                return {
                    id: postIdElement,
                    link: postLinkElement,
                    title: postTitleElement && postTitleElement.innerText,
                    description: postDescriptionElement && postDescriptionElement.innerText,
                    author: postAuthorElement && postAuthorElement.innerText,
                    image: postImageElement && getURLfromBackgroundImage(postImageElement.style['background-image']),
                }
            });
        }

        const sections = extractHomeFeedSections();

        return sections.map(section => {
            const sectionName = extractSectionName(section);
            const sectionPosts = extractPostsInformation(section) || [];

            return {
                name: sectionName,
                posts: sectionPosts
            };
        });
    });

    console.log(mediumHomeInformation);

    await browser.close();
})();