let previousURL = "";
let previousURLIsJobPost = false;
let previousURLJobPostType = undefined;

let currentURL = "";
let currentURLIsJobPost = false;
let currentURLJobPostType = undefined;

let isLoadingNewJobPost = false;
let isLoadingJobPostRefresh = false;

// Notify the content script any time a tab's URL changes, and the resulting
// URL is for a LinkedIn job post
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const url = changeInfo.url;
    const status = changeInfo.status;

    if (url !== undefined) {
        previousURL = currentURL;
        previousURLIsJobPost = currentURLIsJobPost;
        previousURLJobPostType = currentURLJobPostType;

        currentURL = url;

        const urlData = classifyURL(url);
        currentURLIsJobPost = urlData.isJobPost;
        currentURLJobPostType = urlData.pageType;
    }

    if (classifyURL(url).isJobPost && status === "loading") {
        isLoadingNewJobPost = true;
    } else if (isLoadingNewJobPost && status === "complete") {
        isLoadingNewJobPost = false;

        if (previousURLJobPostType === currentURLJobPostType) {
            chrome.tabs.sendMessage(tabId, {
                delay: 500,
                pageType: currentURLJobPostType
            });
        } else {
            chrome.tabs.sendMessage(tabId, {
                delay: 1000,
                pageType: currentURLJobPostType
            });
        }
    } else if (url === undefined && status === "loading" && currentURLIsJobPost) {
        isLoadingJobPostRefresh = true;
    } else if (isLoadingJobPostRefresh && status === "complete") {
        isLoadingJobPostRefresh = false;
        chrome.tabs.sendMessage(tabId, {
            delay: 1000,
            pageType: currentURLJobPostType
        });
    }
});

const jobPageURLs = [
    {
        pageType: "search",
        matching: /https:\/\/www.linkedin.com\/jobs\/search\/\?currentJobId=.*/
    },
    {
        pageType: "view",
        matching: /https:\/\/www.linkedin.com\/jobs\/view\/\d+\/*/
    },
    {
        pageType: "recommended",
        matching: /https:\/\/www.linkedin.com\/jobs\/collections\/recommended\/\?currentJobId=.*/
    }
];

function classifyURL(url) {
    if (url === undefined) {
        return {
            isJobPost: false
        };
    }

    for (let jobPageURL of jobPageURLs) {
        if (jobPageURL.matching.test(url)) {
            return {
                isJobPost: true,
                pageType: jobPageURL.pageType
            };
        }
    }

    return {
        isJobPost: false
    };
}