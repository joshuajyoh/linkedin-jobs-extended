let url = document.url;

setTimeout(run, 1000);

// Rerun anytime the url changes (within the specified match)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const urlNew = request.url;

    if (url !== urlNew) {
        url = urlNew;
        setTimeout(run, 1000);
    }
});

function run() {
    const data = getJobDescriptionData();

    addHighlights(getYOEStatements(data), yoeIcon);
    addHighlights(getDriversLicenseStatements(data), driversLicenseIcon);
}

function getJobDescriptionData() {
    const jobDescHTML = document.getElementsByClassName("jobs-description-content__text")[0]?.lastElementChild;

    let jobDescText = jobDescHTML.innerHTML;

    jobDescText = jobDescText.replaceAll(/<\/?(strong|i)>/g, "");
    jobDescText = jobDescText.replaceAll(/<br>/g, "\n");
    jobDescText = jobDescText.replaceAll(/<\/?ul>/g, "");
    jobDescText = jobDescText.replaceAll(/<(p|li)>/g, "");
    jobDescText = jobDescText.replaceAll(/<\/(p|li)>/g, "\n");
    jobDescText = jobDescText.replaceAll(/\n\n+/g, "\n");
    jobDescText = jobDescText.trim();

    return jobDescText;
}

function addHighlights(statements, iconHTML) {
    const jobHighlights = document.getElementsByClassName("jobs-unified-top-card__content--two-pane")[0].children[2].firstElementChild;

    for (let st of statements) {
        const highlight = document.createElement('li');
        highlight.classList.add("jobs-unified-top-card__job-insight");

        const highlightIcon = document.createElement('div');
        highlightIcon.classList.add("flex-shrink-zero", "mr2", "t-black--light");
        highlightIcon.innerHTML = `<div class="ivm-image-view-model">
        <div class="ivm-view-attr__img-wrapper ivm-view-attr__img-wrapper--use-img-tag display-flex">
        <li-icon aria-hidden="true" type="job" size="large">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-supported-dps="24x24" fill="none" class="mercado-match" width="24" height="24" focusable="false" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${iconHTML}
        </svg>
        </li-icon>
        </div>
        </div>`;

        const highlightText = document.createElement("span");
        highlightText.textContent = st;

        highlight.insertAdjacentElement("beforeend", highlightIcon);
        highlight.insertAdjacentElement("beforeend", highlightText);
        jobHighlights.insertAdjacentElement('beforeend', highlight);
    }
}

function getYOEStatements(data) {
    return data.match(/(\d+-)?\d+\+? years[^\n]*experience[^\n]*/g) ?? [];
}

function getDriversLicenseStatements(data) {
    return data.match(/[^\.\n]*driver’s license[^\n]*/g) ?? [];
}

const yoeIcon = `<path d="M20 6 9 17 4 12"></path>`;
const driversLicenseIcon = `<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>`;