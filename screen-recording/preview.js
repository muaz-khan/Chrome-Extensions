var video = document.querySelector('video');
var fname = document.querySelector('#file-name');
var fsize = document.querySelector('#file-size');
// var fduration = document.querySelector('#file-duration');
var header = document.querySelector('header');
var title = document.querySelector('title');

DiskStorage.Fetch('latest-file', function(file) {
    if(!file) {
        header.innerHTML = 'You did NOT record anything yet.';
        return;
    }

    video.src = URL.createObjectURL(file);
    fname.innerHTML = fname.download = title.innerHTML = file.name;
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
