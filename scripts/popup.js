document.addEventListener("DOMContentLoaded", () => {
    run();
});

function run() {
    document.getElementById("options-button").addEventListener("click", () => {
        chrome.runtime.openOptionsPage();
    });

    document.getElementById("about-button").addEventListener("click", () => {
        window.open("https://github.com/joshuajyoh/linkedin-job-highlights#readme");
    });
}