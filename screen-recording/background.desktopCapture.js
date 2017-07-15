function captureDesktop() {
    if (isRecordingVOD) {
        stopVODRecording();
        return;
    }

    if (recorder && recorder.stream && recorder.stream.onended) {
        recorder.stream.onended();
        return;
    }

    chrome.browserAction.setIcon({
        path: 'images/main-icon.png'
    });

    if (enableTabCaptureAPI) {
        captureTabUsingTabCapture();
        return;
    }

    var screenSources = ['window', 'screen', 'audio'];

    if (enableSpeakers === false) {
        screenSources = ['window', 'screen'];
    }

    try {
        chrome.desktopCapture.chooseDesktopMedia(screenSources, onAccessApproved);
    } catch (e) {
        getUserMediaError();
    }
}

function onAccessApproved(chromeMediaSourceId, opts) {
    if (!chromeMediaSourceId || !chromeMediaSourceId.toString().length) {
        setDefaults();
        chrome.runtime.reload();
        return;
    }

    var constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: chromeMediaSourceId
            },
            optional: []
        }
    };

    if (aspectRatio) {
        constraints.video.mandatory.minAspectRatio = aspectRatio;
    }

    if (videoMaxFrameRates && videoMaxFrameRates.toString().length) {
        videoMaxFrameRates = parseInt(videoMaxFrameRates);

        // 30 fps seems max-limit in Chrome?
        if (videoMaxFrameRates /* && videoMaxFrameRates <= 30 */ ) {
            constraints.video.maxFrameRate = videoMaxFrameRates;
        }
    }

    if (resolutions.maxWidth && resolutions.maxHeight) {
        constraints.video.mandatory.maxWidth = resolutions.maxWidth;
        constraints.video.mandatory.maxHeight = resolutions.maxHeight;
    }

    if (opts.canRequestAudioTrack === true) {
        constraints.audio = {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: chromeMediaSourceId
            },
            optional: []
        };
    }

    navigator.webkitGetUserMedia(constraints, function(stream) {
        initVideoPlayer(stream);
        gotStream(stream);
    }, getUserMediaError);
}
