// Notify the content script any time a tab's URL changes, and the resulting
// URL is for a LinkedIn job posting
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const url = changeInfo.url;

    if (url === undefined) { return; }

    if (/https:\/\/www.linkedin.com\/jobs\/search\/\?currentJobId=.*/.test(url)) {
        chrome.tabs.sendMessage(tabId, { msg: "Run" });
    }
});