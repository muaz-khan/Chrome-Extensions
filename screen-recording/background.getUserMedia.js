function captureCamera(callback) {
    navigator.webkitGetUserMedia({
        video: enableCamera === true,
        audio: enableMicrophone === true
    }, function(stream) {
        initVideoPlayer(stream);

        callback(stream);
    }, function(error) {
        chrome.tabs.create({
            url: 'camera-mic.html'
        });
        setDefaults();
    });
}
