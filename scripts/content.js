let currentJobID = -1;

setTimeout(run, 2000);
/*setInterval(() => {
    run();
}, 2000);*/

function run() {
    const jobID = getJobID();

    if (jobID === undefined || jobID === currentJobID) { return; }

    currentJobID = jobID;

    const data = getJobDescriptionData();

    addYOEStatements(data);
}

function getJobID() {
    const jobLink = document.getElementsByClassName("jobs-unified-top-card__content--two-pane")[0]?.firstChild?.baseURI;

    if (jobLink === undefined) { return undefined; }

    const start = jobLink.indexOf("currentJobId=") + 13;
    const end = jobLink.indexOf("&", start);

    return jobLink.substring(start, end);
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

function addYOEStatements(data) {
    const statements = getYOEStatements(data);

    const jobHighlights = document.getElementsByClassName("jobs-unified-top-card__content--two-pane")[0].children[2].firstElementChild;

    for (let st of statements) {
        const highlight = document.createElement('li');
        highlight.classList.add("jobs-unified-top-card__job-insight");

        const highlightIcon = document.createElement('div');
        highlightIcon.classList.add("flex-shrink-zero", "mr2", "t-black--light");
        highlightIcon.innerHTML = `<div class="ivm-image-view-model">
        <div class="ivm-view-attr__img-wrapper ivm-view-attr__img-wrapper--use-img-tag display-flex">
        <li-icon aria-hidden="true" type="job" size="large">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-supported-dps="24x24" fill="none" class="mercado-match" width="24" height="24" focusable="false" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6 9 17 4 12"></path>
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
    return data.match(/(\d+-)?\d+\+? years[^\n]*experience[^\n]*/g);
}