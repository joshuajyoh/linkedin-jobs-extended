const jobData = new Map();
let numRefreshes = 0;

setTimeout(() => {
    refreshJobData();
    setInterval(() => {
        refreshJobData();
    }, 5000);
}, 1000);

async function refreshJobData() {

    const jobSearchResults = document.getElementsByClassName("job-card-container");

    for (let jobSearchItem of jobSearchResults) {
        const jobID = jobSearchItem.getAttribute("data-job-id");

        if (jobData.has(jobID)) {
            jobData.get(jobID).refreshSet = numRefreshes;
            continue;
        }

        updateJobCard(jobSearchItem);

        jobData.set(jobID, {
            refreshSet: numRefreshes
        });
    }

    ++numRefreshes;
}

async function updateJobCard(card) {
    const jobLink = card.getElementsByClassName("job-card-container__link")[0].getAttribute("href");

    const jobDescription = await getJobDescription(jobLink);

    const info = card.getElementsByClassName("artdeco-entity-lockup__content")[0];

    updateYOE(jobDescription, info);
}

async function getJobDescription(jobLink) {
    const res = await fetch(jobLink);
    const text = await res.text();

    let description = decode(text);
    description = description.substring(description.indexOf('companyDetails'));
    description = description.substring(description.indexOf('"text":') + 7);
    description = description.substring(0, description.indexOf(`,"$type"`));

    return description;
}

function updateYOE(description, info) {
    const matches = description.match(/()?\d\+? years[^\.]+experience[^\.\n]+/g);

    if (matches === null || matches.length === 0) { return; }

    for (let i = 0; i < matches.length; ++i) {
        const index = matches[i].search(/[a-z][A-Z]/);
        if (index !== -1) {
            matches[i] = matches[i].substring(0, index + 1);
        }
    }

    for (let match of matches) {
        const yearsOfExperience = document.createElement("div");
        yearsOfExperience.classList.add("linkedin-jobs-extended__subtitle", "artdeco-entity-lockup__subtitle");
        yearsOfExperience.textContent = `• ${match}`;

        info.insertAdjacentElement("beforeEnd", yearsOfExperience);
    }
}