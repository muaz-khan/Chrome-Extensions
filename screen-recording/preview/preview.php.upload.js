document.querySelector('#btn-php-upload').onclick = function() {
    if (!file) {
        header.innerHTML = 'You did NOT record anything yet.';
        return;
    }

    this.disabled = true;
    header.innerHTML = 'Upload started...';

    uploadToPHPServer(file, function(progress, videoURL) {
        if(progress === 'ended' || videoURL) {
            showPHPURL(videoURL);
            document.title = 'Upload successful';
            return;
        }

        if(progress != 'Upload started...') {
            header.innerHTML = 'Upload Progress: ' + progress + '%';
        }
        else {
            header.innerHTML = progress;
        }
        
        document.title = progress + '% uploaded';

        if (progress >= 99 || videoURL || progress === 'progress-ended') {
            header.innerHTML = 'Uploaded to Server. Retrieving the private video URL...';
        }
    });
};

function showPHPURL(videoURL) {
    var html = '<p>Uploaded: <a href="' + videoURL + '" target="_blank">' + videoURL.replace('/RecordRTC/uploads/', '/') + '</a></p>';
    html += '<span style="font-size: 17px;">This video URL is valid <b style="color: red;">till one week</b>. It will be automatically removed from the server after one week.</span>';

    DiskStorage.UpdateFileInfo(file.name, {
        php: videoURL
    }, function() {
        header.innerHTML = html;
    });
}

function uploadToPHPServer(blob, callback) {
    // create FormData
    var formData = new FormData();

    var fName = blob.name;
    if(fName.indexOf('RecordRTC-') !== 0) {
        fName = 'RecordRTC-' + fName;
    }

    formData.append('video-filename', fName);
    formData.append('video-blob', blob);

    callback('Uploading recorded-file to server.');

    makeXMLHttpRequest('https://webrtcweb.com/RecordRTC/', formData, function(progress) {
        if (progress !== 'upload-ended') {
            callback(progress);
            return;
        }

        var initialURL = 'https://webrtcweb.com/RecordRTC/uploads/';

        callback('ended', initialURL + fName);
    });
}

function makeXMLHttpRequest(url, data, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            callback('upload-ended');
        }
    };

    request.upload.onloadstart = function() {
        callback('Upload started...');
    };

    request.upload.onprogress = function(event) {
        callback(Math.round(event.loaded / event.total * 100));
    };

    request.upload.onload = function() {
        callback('progress-about-to-end');
    };

    request.upload.onload = function() {
        callback('progress-ended');
    };

    request.upload.onerror = function(error) {
        callback('Failed to upload to server');
    };

    request.upload.onabort = function(error) {
        callback('Upload aborted.');
    };

    request.open('POST', url);
    request.send(data);
}
