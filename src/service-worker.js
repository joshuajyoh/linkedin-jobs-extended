let previousURL = "";
let previousURLIsJobPost = false;

let currentURL = "";
let currentURLIsJobPost = false;

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

        currentURL = url;
        currentURLIsJobPost = isJobPost(url);
    }

    if (isJobPost(url) && status === "loading") {
        isLoadingNewJobPost = true;
    } else if (isLoadingNewJobPost && status === "complete") {
        isLoadingNewJobPost = false;

        if (previousURLIsJobPost) {
            chrome.tabs.sendMessage(tabId, { delay: 500 });
        } else {
            chrome.tabs.sendMessage(tabId, { delay: 1000 });
        }
    } else if (url === undefined && status === "loading" && currentURLIsJobPost) {
        isLoadingJobPostRefresh = true;
    } else if (isLoadingJobPostRefresh && status === "complete") {
        isLoadingJobPostRefresh = false;
        chrome.tabs.sendMessage(tabId, { delay: 1000 });
    }
});

function isJobPost(url) {
    if (url === undefined) { return false; }

    for (let exp of jobPostURLRegExs) {
        if (exp.test(url)) {
            return true;
        }
    }

    return false;
}

const jobPostURLRegExs = [
    /https:\/\/www.linkedin.com\/jobs\/search\/\?currentJobId=.*/
];