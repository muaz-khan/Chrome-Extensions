function gotTabCaptureStream(stream, constraints) {
    if (!stream) {
        if (constraints.audio === true) {
            enableSpeakers = false;
            captureTabUsingTabCapture(constraints.videoConstraints.mandatory);
            return;
        }
        return alert('still no tabCapture stream');
        chrome.runtime.reload();
        return;
    }

    var newStream = new MediaStream();

    stream.getTracks().forEach(function(track) {
        newStream.addTrack(track);
    });

    initVideoPlayer(newStream);

    gotStream(newStream);
}
