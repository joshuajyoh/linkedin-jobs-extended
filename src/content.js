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

// Parse the page's job description, find lines relevant to specified
// requirements, and add them to the page's highlights
function run(pageType) {
    const jobDescription = getJobDescription();

    for (let i = 0; i < featureList.length;++i) {
        if (featureOptions[i]) {
            addHighlights(pageType, jobDescription, featureList[i]);
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
function addHighlights(pageType, jobDescription, feature) {
    // Get statements from the job description relevant to the specified
    // feature
    const statements = jobDescription.match(feature.matching) ?? [];

    let jobHighlights;
    switch (pageType) {
        case "search":
        case "recommended":
            jobHighlights = document.getElementsByClassName("jobs-unified-top-card__content--two-pane")[0].children[2].firstElementChild;
            break;
        case "view":
            jobHighlights = document.getElementsByClassName("jobs-unified-top-card")[0].children[0].children[0].children[3].firstElementChild;
            break;
        default:
            throw new Error("Unknown page type");
    }

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
        name: "certifications",
        matching: /[^\.\n]*(certified|certification)[^\n]*/gi,
        iconHTML: `<circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>`
    },
    {
        name: "driversLicense",
        matching: /[^\.\n]*driver’s license[^\n]*/gi,
        iconHTML: `<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>`
    },
    {
        name: "coverLetter",
        matching: /[^\.\n]*cover letter[^\.\n]*/gi,
        iconHTML: `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>`
    }
];