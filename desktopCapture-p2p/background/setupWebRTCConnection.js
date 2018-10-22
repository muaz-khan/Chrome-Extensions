function setupWebRTCConnection(stream) {
    if (streaming_method === 'RTCMultiConnection') {
        shareStreamUsingRTCMultiConnection(stream);
    }

    if (streaming_method === 'AntMediaServer') {
        shareStreamUsingAntMediaServer(stream);
    }
}
