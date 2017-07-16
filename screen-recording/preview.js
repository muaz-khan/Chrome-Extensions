var video = document.querySelector('video');
var fname = document.querySelector('#file-name');
var fsize = document.querySelector('#file-size');
// var fduration = document.querySelector('#file-duration');
var header = document.querySelector('header');

DiskStorage.Fetch('latest-file', function(file) {
    if(!file) {
        header.innerHTML = 'You did NOT record anything yet.';
        return;
    }

    video.src = URL.createObjectURL(file);
    fname.innerHTML = fname.download = file.name;
    fname.href = video.src;
    fsize.innerHTML = bytesToSize(file.size);
    // fduration.innerHTML = file.duration || '00:00';

    video.style.cursor = 'pointer';
    video.style.height = innerHeight - header.clientHeight;
    video.onclick = function() {
        video.onclick = null;
        video.style.cursor = '';
        video.play();
    };
});

function bytesToSize(bytes) {
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
        return '0 Bytes';
    }
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}
