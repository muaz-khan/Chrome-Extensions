var recorder;
var isRecording = false;

var resolutions = {
    maxWidth: 29999,
    maxHeight: 8640
};
var aspectRatio = 1.77;
var bitsPerSecond = 0;

var enableTabCaptureAPI = false;

var enableScreen = true;
var enableMicrophone = false;
var enableCamera = false;
var cameraStream = false;

var enableSpeakers = true;

var videoCodec = 'Default';
var videoMaxFrameRates = '';

var alreadyHadGUMError = false;

var isRecordingVOD = false;
var startedVODRecordedAt = (new Date).getTime();
