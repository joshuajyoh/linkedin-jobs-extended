chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const url = changeInfo.url;

    if (url === undefined) { return; }

    if (/https:\/\/www.linkedin.com\/jobs\/search\/\?currentJobId=.*/.test(url)) {
        chrome.tabs.sendMessage(tabId, { url: url });
    }
});