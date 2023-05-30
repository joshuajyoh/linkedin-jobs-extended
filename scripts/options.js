// Load options at DOM load
document.addEventListener("DOMContentLoaded", () => {
    load();
});

// Save options any time they are changed
document.addEventListener("change", () => {
    save();
});

// Save options to sync storage
function save() {
    const data = {
        features: {
            yearsOfExperience: document.getElementById("switchYOE").checked,
            education: document.getElementById("switchEducation").checked,
            driversLicense: document.getElementById("switchDLicense").checked
        }
    };

    chrome.storage.sync.set(data,
    () => {
        
    });
}

// Load options from sync storage
function load() {
    chrome.storage.sync.get({
        features: {
            yearsOfExperience: true,
            education: true,
            driversLicense: false
        }
    },
    (data) => {
        document.getElementById("switchYOE").checked = data.features.yearsOfExperience;
        document.getElementById("switchEducation").checked = data.features.education;
        document.getElementById("switchDLicense").checked = data.features.driversLicense;
    });
}