// Enable Time Duration?
// Change Icon???
// IconTextBackgroundColor
// Enable Tab+Screen

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
            if(codec !== items['videoCodec']) {
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

    if (items['enableMp3']) {
        document.getElementById('enableMp3').checked = items['enableMp3'] === 'true';
        document.querySelector('input[type=file]').disabled = items['enableMp3'] === 'false';
    } else {
        chrome.storage.sync.set({
            enableMp3: 'false'
        }, function() {
            document.getElementById('enableMp3').removeAttribute('checked');
            document.querySelector('input[type=file]').disabled = true;
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
    if(this.value === 'default') {
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

document.getElementById('enableMp3').onchange = function(event) {
    document.getElementById('enableMp3').disabled = true;

    if(!document.getElementById('mp3-file-name').innerHTML) {
        document.getElementById('mp3-file-name').innerHTML = 'Please select an audio file.';
    }

    showSaving();

    document.querySelector('input[type=file]').disabled = document.getElementById('enableMp3').checked === false;

    chrome.storage.sync.set({
        enableMp3: document.getElementById('enableMp3').checked ? 'true' : 'false'
    }, function() {
        document.getElementById('enableMp3').disabled = false;
        hideSaving();
    });
};

document.querySelector('input[type=file]').onchange = function() {
    var mp3 = this.files[0];
    this.value = '';
    
    if(!mp3) return;

    if(!mp3.type || mp3.type.indexOf('audio/') === -1) {
        document.getElementById('mp3-file-name').innerHTML = mp3.type + ' not allowed.';
        return;
    }

    showSaving();

    document.getElementById('mp3-file-name').innerHTML = mp3.name + ' (Size: ' + bytesToSize(mp3.size) + ')';
    storeMp3IntoIndexedDB(mp3, function() {
        hideSaving();
    });
};

function dataURItoBlob(dataURI) {
    dataURI = dataURI.split('----');
    var name = dataURI[0];
    dataURI = dataURI[1];

    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    var blob = new File([ab], name, {
        type: mimeString
    });
    return blob;

}

function getMp3FromIndexedDB(callback) {
    DiskStorage.dbName = 'mp3_db';
    DiskStorage.dataStoreName = 'mp3';
    DiskStorage.init();

    DiskStorage.Fetch(function(data, type) {
        if(type !== 'audioBlob' || !data || !data.length) return;
        callback(dataURItoBlob(data));
    });
}

function storeMp3IntoIndexedDB(mp3, callback) {
    DiskStorage.dbName = 'mp3_db';
    DiskStorage.dataStoreName = 'mp3';
    DiskStorage.init();

    var reader = new FileReader();
    reader.onload = function(e) {
        DiskStorage.Store({
            audioBlob: mp3.name + '----' + e.target.result
        });
        callback();
    };
    reader.readAsDataURL(mp3);
}

getMp3FromIndexedDB(function(mp3) {
    document.getElementById('mp3-file-name').innerHTML = mp3.name + ' (Size: ' + bytesToSize(mp3.size) + ')';
});
