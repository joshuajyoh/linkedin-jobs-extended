// At start of content script get options values
console.log("HI");
chrome.storage.sync.get(
    {
        features: {
            yearsOfExperience: true,
            education: true,
            driversLicense: false
        }
    },
    (data) => {
        featureOptions = [
            data.features.yearsOfExperience,
            data.features.education,
            data.features.driversLicense
        ];
    }
);

// Run when notified by the service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    setTimeout(run, request.delay);
});

// Match when options update
chrome.storage.sync.onChanged.addListener((changes) => {
    featureOptions = [
        changes.features.newValue.yearsOfExperience,
        changes.features.newValue.education,
        changes.features.newValue.driversLicense
    ];
});

// Parse the page's job description, find lines relevant to specified
// requirements, and add them to the page's highlights
function run() {
    const jobDescription = getJobDescription();

    for (let i = 0; i < featureList.length;++i) {
        if (featureOptions[i]) {
            addHighlights(jobDescription, featureList[i]);
        }
    }
}

// Parse the page's job description and format into a multi-line string
function getJobDescription() {
    const jobDescHTML = document.getElementsByClassName("jobs-description-content__text")[0]?.lastElementChild;

    let jobDescText = jobDescHTML.innerHTML;

    // Manage element tags
    jobDescText = jobDescText.replaceAll(/(<\/?(strong|i|ul|u)>|<(p|li)>)/g, "");
    jobDescText = jobDescText.replaceAll(/(<br>|<\/(p|li)>)/g, "\n");

    // Manage whitespace
    jobDescText = jobDescText.replaceAll(/\n\n+/g, "\n");
    jobDescText = jobDescText.trim();

    return jobDescText;
}

// Insert additional highlights into the page's HTML
function addHighlights(jobDescription, feature) {
    // Get statements from the job description relevant to the specified
    // feature
    const statements = jobDescription.match(feature.matching) ?? [];

    const jobHighlights = document.getElementsByClassName("jobs-unified-top-card__content--two-pane")[0].children[2].firstElementChild;

    for (let st of statements) {
        // Create parent highlight block
        const highlight = document.createElement('li');
        highlight.classList.add("jobs-unified-top-card__job-insight");

        // Create highlight icon
        const highlightIcon = document.createElement('div');
        highlightIcon.classList.add("flex-shrink-zero", "mr2", "t-black--light");
        highlightIcon.innerHTML = `<div class="ivm-image-view-model">
        <div class="ivm-view-attr__img-wrapper ivm-view-attr__img-wrapper--use-img-tag display-flex">
        <li-icon aria-hidden="true" type="job" size="large">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-supported-dps="24x24" fill="none" class="mercado-match" width="24" height="24" focusable="false" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${feature.iconHTML}
        </svg>
        </li-icon>
        </div>
        </div>`;

        // Create highlight text
        const highlightText = document.createElement("span");
        highlightText.textContent = st;

        // Insert into page
        highlight.insertAdjacentElement("beforeend", highlightIcon);
        highlight.insertAdjacentElement("beforeend", highlightText);
        jobHighlights.insertAdjacentElement('beforeend', highlight);
    }
}

// Determines whether feature is searched for or not
let featureOptions = [];

const featureList = [
    {
        name: "yearsOfExperience",
        matching: /[^\n]*(\d+-)?\d+(\+| plus)? years?[^\n]*experience[^\n]*/gi,
        iconHTML: `<path d="M20 6 9 17 4 12"></path>`
    },
    {
        name: "education",
        matching: /[^\.\n]*((bachelor|master)('|’)?s degree|degree in|doctorate|phd)[^\n]*/gi,
        iconHTML: `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>`
    },
    {
        name: "driversLicense",
        matching: /[^\.\n]*driver’s license[^\n]*/gi,
        iconHTML: `<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>`
    }
];