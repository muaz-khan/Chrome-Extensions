var runtimePort;

chrome.runtime.onConnect.addListener(function(port) {
    runtimePort = port;

    runtimePort.onMessage.addListener(function(message) {
        if (!message || !message.messageFromContentScript1234) {
            return;
        }

        if (message.startRecording) {
            if (!!isRecordingVOD) {
                stopVODRecording();
                return;
            }

            getUserConfigs();
            return;
        }

        if (message.stopRecording) {
            if (recorder && recorder.stream) {
                recorder.stream.stop();
            }
            return;
        }
    });
});
