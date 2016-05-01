// Enable Time Duration?
// Change Icon???
// IconTextBackgroundColor
// Enable Tab+Screen

chrome.storage.sync.get(null, function(items) {
    if (items['resolutions']) {
        document.getElementById('resolutions').value = items['resolutions'];
    } else {
        chrome.storage.sync.set({
            resolutions: 'fit-screen'
        }, function() {
            document.getElementById('resolutions').value = 'Default (29999x8640)';
        });
    }

    if (items['videoBitsPerSecond']) {
        document.getElementById('videoBitsPerSecond').value = items['videoBitsPerSecond'];
    } else {
        chrome.storage.sync.set({
            videoBitsPerSecond: 4000
        }, function() {});
    }

    if (items['audioBitsPerSecond']) {
        document.getElementById('audioBitsPerSecond').value = items['audioBitsPerSecond'];
    } else {
        chrome.storage.sync.set({
            audioBitsPerSecond: 16
        }, function() {});
    }

    if (items['enableTabAudio']) {
        document.getElementById('enableTabAudio').checked = items['enableTabAudio'] === 'true';
    } else {
        chrome.storage.sync.set({
            enableTabAudio: 'false'
        }, function() {});
    }
});

document.getElementById('resolutions').onchange = function() {
    this.disabled = true;
    showSaving();
    chrome.storage.sync.set({
        resolutions: this.value
    }, function() {
        document.getElementById('resolutions').disabled = false;
        hideSaving();
    });
};

document.getElementById('enableTabAudio').onchange = function() {
    this.disabled = true;
    showSaving();
    chrome.storage.sync.set({
        enableTabAudio: this.checked ? 'true' : 'false'
    }, function() {
        document.getElementById('enableTabAudio').disabled = false;
        hideSaving();
    });
};

document.getElementById('videoBitsPerSecond').onblur = function() {
    this.disabled = true;
    showSaving();
    chrome.storage.sync.set({
        videoBitsPerSecond: this.value
    }, function() {
        document.getElementById('videoBitsPerSecond').disabled = false;
        hideSaving();
    });
};

document.getElementById('audioBitsPerSecond').onblur = function() {
    this.disabled = true;
    showSaving();
    chrome.storage.sync.set({
        audioBitsPerSecond: this.value
    }, function() {
        document.getElementById('audioBitsPerSecond').disabled = false;
        hideSaving();
    });
};

function showSaving() {
    document.getElementById('applying-changes').style.display = 'block';
}

function hideSaving() {
    setTimeout(function() {
        document.getElementById('applying-changes').style.display = 'none';
    }, 700);
}
