chrome.storage.sync.get(null, function(items) {
    if (items['resolutions']) {
        document.getElementById('resolutions').value = items['resolutions'];
    } else {
        chrome.storage.sync.set({
            resolutions: 'Default (29999x8640)'
        }, function() {
            document.getElementById('resolutions').value = 'Default (29999x8640)';
        });
    }

    if (items['videoCodec']) {
        querySelectorAll('#videoCodec input').forEach(function(input) {
            var codec = input.parentNode.textContent;
            if (codec !== items['videoCodec']) {
                input.checked = false;
                return;
            }
            input.checked = true;
        });
    } else {
        chrome.storage.sync.set({
            videoCodec: 'Default'
        }, function() {
            querySelectorAll('#videoCodec input')[0].checked = true;
        });
    }

    if (items['videoMaxFrameRates'] && items['videoMaxFrameRates'] !== 'None' && items['videoMaxFrameRates'].length) {
        document.getElementById('videoMaxFrameRates').value = items['videoMaxFrameRates'];
    } else {
        chrome.storage.sync.set({
            videoMaxFrameRates: ''
        }, function() {
            document.getElementById('videoMaxFrameRates').value = 'None';
        });
    }

    if (items['bitsPerSecond']) {
        document.getElementById('bitsPerSecond').value = items['bitsPerSecond'];
    } else {
        chrome.storage.sync.set({
            bitsPerSecond: ''
        }, function() {
            document.getElementById('bitsPerSecond').value = 'default';
        });
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

function querySelectorAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
}

querySelectorAll('#videoCodec input').forEach(function(input) {
    input.onchange = function() {
        querySelectorAll('#videoCodec input').forEach(function(input) {
            input.checked = false;
        });

        this.checked = true;

        var codec = this.parentNode.textContent;

        showSaving();
        chrome.storage.sync.set({
            videoCodec: codec
        }, function() {
            hideSaving();
        });
    };
});

document.getElementById('videoMaxFrameRates').onchange = function() {
    this.disabled = true;

    showSaving();
    chrome.storage.sync.set({
        videoMaxFrameRates: this.value === 'None' ? '' : this.value
    }, function() {
        document.getElementById('videoMaxFrameRates').disabled = false;
        hideSaving();
    });
};

document.getElementById('bitsPerSecond').onchange = function() {
    if (this.value === 'default') {
        return;
    }

    this.disabled = true;
    showSaving();
    chrome.storage.sync.set({
        bitsPerSecond: this.value
    }, function() {
        document.getElementById('bitsPerSecond').disabled = false;
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
