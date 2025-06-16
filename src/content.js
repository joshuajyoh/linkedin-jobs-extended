let currentURL = document.URL;

// Determines whether feature is searched for or not
let featureOptions;

// At start of content script get options values
chrome.storage.sync.get(
    {
        features: {
            yearsOfExperience: true,
            education: true,
            certs: false,
            driversLicense: false,
            coverLetter: false
        }
    },
    (data) => {
        featureOptions = [
            data.features.yearsOfExperience,
            data.features.education,
            data.features.certs,
            data.features.driversLicense,
            data.features.coverLetter
        ];
    }
);

// Run when notified by the service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    setTimeout(() => { run(request.pageType); }, request.delay);
});

// Match when options update
chrome.storage.sync.onChanged.addListener((changes) => {
    featureOptions = [
        changes.features.newValue.yearsOfExperience,
        changes.features.newValue.education,
        changes.features.newValue.certs,
        changes.features.newValue.driversLicense,
        changes.features.newValue.coverLetter
    ];
});

document.addEventListener("click", () => {
    const eventTimeURL = document.URL;

    if (currentURL !== eventTimeURL) {
        currentURL = eventTimeURL;
        tryRun(currentURL);
    }
});

tryRun(currentURL);

async function tryRun(url) {
    const pageType = identifyPageType(url);

    if (pageType !== "invalid")
        await run(pageType);
}

function identifyPageType(url) {
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

    let pageType = "invalid";

    for (let jobPageURL of jobPageURLs) {
        if (jobPageURL.matching.test(url))
            pageType = jobPageURL.pageType;
    }

    return pageType;
}

// Parse the page's job description, find lines relevant to specified
// requirements, and add them to the page's highlights
async function run(pageType) {
    const oldHighlightGroupContainer = document.getElementsByClassName("linkedin-jobs-extended-highlight-group-container")?.[0];

    if (oldHighlightGroupContainer !== undefined)
        oldHighlightGroupContainer.remove();

    const highlightGroupContainer = document.createElement("div");
    
    highlightGroupContainer.className = "linkedin-jobs-extended-highlight-group-container";

    highlightGroupContainer.setAttribute("style", `
        margin-top: 16px;
    `);

    let jobDetailsBlock = document.getElementsByClassName("job-details-preferences-and-skills")[0];

    while (!jobDetailsBlock) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        jobDetailsBlock = document.getElementsByClassName("job-details-preferences-and-skills")[0];
    }

    jobDetailsBlock.insertAdjacentElement("afterend", highlightGroupContainer);

    const jobDescriptionLines = await getJobDescription();

    let noFeaturesFound = true;

    const featureList = [
        {
            name: "yearsOfExperience",
            matching: /.*(\d+-)?\d+(\+| plus)? (years|yrs) (in|of|[^\n]*(experience)).*/gi,
            iconHTML: `<path d="M20 6 9 17 4 12"></path>`
        },
        {
            name: "education",
            matching: /.*(((bachelor|master)('|’)?s? degree)|(degree in)|doctorate|phd|diploma).*/gi,
            iconHTML: `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>`
        },
        {
            name: "certifications",
            matching: /(.*certificate|(.*(relevant|with)\s|^(\w+\s){0,3})certification[^\sauthorities]).*/gi,
            iconHTML: `<circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>`
        },
        {
            name: "driversLicense",
            matching: /.*driver’s license.*/gi,
            iconHTML: `<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>`
        },
        {
            name: "coverLetter",
            matching: /.*cover letter.*/gi,
            iconHTML: `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>`
        }
    ];

    for (let i = 0; i < featureList.length; ++i) {
        if (featureOptions[i]) {
            for (let jobDescriptionLine of jobDescriptionLines) {
                if (addHighlights(jobDescriptionLine, featureList[i]))
                    noFeaturesFound = false;
            }
        }
    }

    if (noFeaturesFound)
        highlightGroupContainer.innerHTML = "LinkedIn Jobs Extended did not find any matches.";
}

// Parse the page's job description and format into a multi-line string
async function getJobDescription() {
    let jobDescHTML = document.getElementsByClassName("jobs-box__html-content")[0].children[1].children[0];

    while (!jobDescHTML) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        jobDescHTML = document.getElementsByClassName("jobs-box__html-content")[0].children[1].children[0];
    }

    let jobDescText = jobDescHTML.innerHTML;

    // Remove markup
    jobDescText = jobDescText.replaceAll(/(<\/?(strong|i|ul|u)>|<(p|li|span)>|<!---->|      )/g, "");
    jobDescText = jobDescText.replaceAll(/<br>|<\/(p|li|(span( class="white-space-pre")?))>/g, "\n");

    // Remove whitespace
    jobDescText = jobDescText.replaceAll(/\u0020\u0020+/g, "\u0020");
    jobDescText = jobDescText.replaceAll(/\n\n+/g, "\n");
    jobDescText = jobDescText.trim();

    // Remove bullet points
    jobDescText = jobDescText.replaceAll(/\n[\-\*\u2022\u00B7]\u0020/g, "\n");

    // Separate sentences
    jobDescText = jobDescText.replaceAll(/\.\u0020/g, "\.\n");
    jobDescText = jobDescText.replaceAll(/!\u0020/g, "!\n");

    // Prevent separating based on periods used for abbreviations

    const abbreviations = [ "Jr", "Sr", "etc" ];

    for (let abbr of abbreviations) {
        jobDescText = jobDescText.replaceAll(new RegExp(`\u0020${abbr}\.\n`, "g"), `\u0020${abbr}\.\u0020`);
    }

    const jobDescLines = jobDescText.split('\n');

    // Format individual lines
    for (let i = 0; i < jobDescLines.length; ++i) {
        let jobLine = jobDescLines[i];

        jobLine = jobLine.trim();

        jobDescLines[i] = jobLine
    }

    return jobDescLines;
}

// Insert additional highlights into the page's HTML
function addHighlights(jobDescriptionLine, feature) {
    // Get statements from the job description relevant to the specified
    // feature
    const statements = jobDescriptionLine.match(feature.matching) ?? [];

    if (statements.length === 0)
        return false;

    const highlightGroupContainer = document.getElementsByClassName("linkedin-jobs-extended-highlight-group-container")[0];

    for (let st of statements) {
        const highlightContainer = document.createElement("div");

        highlightContainer.setAttribute("style", `
            display: flex;
            align-items: center;
            margin-top: 8px;
        `);

        highlightContainer.innerHTML = `
            <div style="display: flex; align-items: center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="20" height="20" focusable="false" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                    ${feature.iconHTML}
                </svg>
            </div>
            <div>${st}</div>
        `;

        highlightGroupContainer.insertAdjacentElement("beforeend", highlightContainer);
    }

    return true;
}
