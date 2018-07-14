var video = document.querySelector('video');
var fname = document.querySelector('#file-name');
var fsize = document.querySelector('#file-size');
// var fduration = document.querySelector('#file-duration');
var header = document.querySelector('header');
var title = document.querySelector('title');
var header = document.querySelector('header');

var browserCache = document.querySelector('#browser-cache');

function setVideoWidth() {
    video.style.cursor = 'pointer';
    video.style.marginTop = header.clientHeight;
    video.style.height = innerHeight - header.clientHeight;
}

window.onresize = setVideoWidth;

var file;

function onGettingFile(f, item) {
    file = f;

    if (!file) {
        if (item && item.name) {
            header.querySelector('p').innerHTML = item.display + ' has no video data.';
            header.querySelector('span').innerHTML = '';
        } else {
            header.querySelector('p').innerHTML = 'You did NOT record anything yet.';
            header.querySelector('span').innerHTML = '';
        }
        return;
    }

    file.item = item;

    video.src = URL.createObjectURL(file);
    fname.download = file.name;
    title.innerHTML = item.display;
    fname.innerHTML = '<img src="images/download-icon.png" style="height: 32px; vertical-align: middle;margin-right: 5px;">' + item.display;
    fname.href = video.src;
    fsize.innerHTML = bytesToSize(file.size);
    // fduration.innerHTML = file.duration || '00:00';

    setVideoWidth();
    video.onclick = function() {
        video.onclick = null;
        video.style.cursor = '';
        video.play();
    };

    var html = 'This file is in your <b>browser cache</b>. Click above link to <b>download</b> ie. save-to-disk.';
    if (item.php && item.youtube) {
        html = 'Click to download file from <a href="' + item.php + '" target="_blank">Private Server</a> or <a href="' + item.youtube + '" target="_blank">YouTube</a>';
    } else if (item.php) {
        html = 'Click to download file from: <a href="' + item.php + '" target="_blank">' + item.php + '</a>';
    } else if (item.youtube) {
        html = 'Click to download file from: <a href="' + item.youtube + '" target="_blank">' + item.youtube + '</a>';
    }
    browserCache.innerHTML = html;

    localStorage.setItem('selected-file', file.name);
}

var recentFile = localStorage.getItem('selected-file');
DiskStorage.GetLastSelectedFile(recentFile, function(file) {
    if (!file) {
        onGettingFile(file);
        return;
    }

    DiskStorage.GetFilesList(function(list) {
        if (!recentFile) {
            onGettingFile(file, list[0]);
            return;
        }

        var found;
        list.forEach(function(item) {
            if (typeof item === 'string') {
                if (item === recentFile) {
                    found = {
                        name: item,
                        display: item,
                        php: '',
                        youtube: ''
                    };
                }
            } else if (item.name === recentFile) {
                found = item;
            }
        });

        if (!found) {
            onGettingFile(file, list[0]);
            return;
        }

        onGettingFile(file, found);
    });
});

var btnUploadDropDown = document.querySelector('#btn-upload-dropdown');
document.querySelector('#btn-upload').onclick = function(e) {
    e.stopPropagation();

    if (!file) {
        alert('You have no recordings.');
        return;
    }

    if (btnUploadDropDown.className === 'visible') {
        btnUploadDropDown.className = '';
    } else {
        btnUploadDropDown.className = 'visible';
    }
};

var btnRecordingsListDropDown = document.querySelector('#btn-recordings-list-dropdown');
document.querySelector('#btn-recordings-list').onclick = function(e) {
    e.stopPropagation();

    if (btnRecordingsListDropDown.className === 'visible') {
        btnRecordingsListDropDown.className = '';
        btnRecordingsListDropDown.innerHTML = '';
    } else {
        btnRecordingsListDropDown.className = 'visible';

        btnRecordingsListDropDown.innerHTML = '';
        DiskStorage.GetFilesList(function(list) {
            if (!list.length) {
                btnRecordingsListDropDown.className = '';
                alert('You have no recordings.');
                return;
            }

            list.forEach(function(item) {
                var div = document.createElement('div');
                div.innerHTML = '<img src="images/cross-icon.png" class="cross-icon"><img src="images/edit-icon.png" class="edit-icon">' + item.display;
                btnRecordingsListDropDown.appendChild(div);

                div.querySelector('.cross-icon').onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!window.confirm('Are you sure you want to permanently delete the selected recording?')) {
                        return;
                    }

                    DiskStorage.RemoveFile(item.name, function() {
                        if (div.previousSibling) {
                            div.previousSibling.click();
                        } else if (div.nextSibling) {
                            div.nextSibling.click();
                        } else {
                            location.reload();
                        }

                        div.parentNode.removeChild(div);
                    });
                };

                div.querySelector('.edit-icon').onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    var newFileName = prompt('Please enter new file name', item.display);

                    DiskStorage.UpdateFileInfo(item.name, {
                        display: newFileName
                    }, function() {
                        item.display = newFileName;

                        onGettingFile(file, item);
                        document.body.onclick();
                    });
                };

                div.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    DiskStorage.Fetch(item.name, function(file) {
                        onGettingFile(file, item);
                    });

                    document.body.onclick();
                };

                if (file && file.item && file.item.name === item.name) {
                    div.className = 'btn-upload-dropdown-selected';
                }
            });
        });
    }
};

document.body.onclick = function() {
    if (btnUploadDropDown.className === 'visible') {
        btnUploadDropDown.className = '';
    }

    if (btnRecordingsListDropDown.className === 'visible') {
        btnRecordingsListDropDown.className = '';
    }
};
