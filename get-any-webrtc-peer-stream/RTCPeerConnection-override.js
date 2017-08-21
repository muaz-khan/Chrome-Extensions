var nativePeer;

(function looper() {
    var RTC = window.RTCPeerConnection || window.webkitRTCPeerConnection;

    if (typeof RTC.prototype.addTrack !== 'undefined' && isFuncNative(RTC.prototype.addTrack)) {
        RTC.prototype._addTrack = RTC.prototype.addTrack;
        RTC.prototype.addTrack = function(track, stream) {
            nativePeer = this;
            nativePeer.streamEvent = 'track';
            this._addTrack(track, stream);
        };
    } else if (typeof RTC.prototype.addStream !== 'undefined' && isFuncNative(RTC.prototype.addStream)) {
        RTC.prototype._addStream = RTC.prototype.addStream;
        RTC.prototype.addStream = function(stream) {
            nativePeer = this;
            nativePeer.streamEvent = 'addstream';
            this._addStream(stream);
        };
    }

    if (typeof nativePeer === 'undefined' || typeof nativePeer.streamEvent === 'undefined') {
        // console.error('looper');
        setTimeout(looper, 1); // recheck
        return;
    }

    var dontDuplicate = {};
    nativePeer.addEventListener(nativePeer.streamEvent, function(event) {
        if (nativePeer.streamEvent === 'track') {
            event.stream = event.streams[0];
        }

        if(dontDuplicate[event.stream.id]) return;
        dontDuplicate[event.stream.id] = true;

        alert('Got WebRTC remote stream: ' + event.stream.id);
    }, false);
})();

function isFuncNative(f) {
    return !!f && (typeof f).toLowerCase() == 'function' &&
        (f === Function.prototype ||
            /^\s*function\s*(\b[a-z$_][a-z0-9$_]*\b)*\s*\((|([a-z$_][a-z0-9$_]*)(\s*,[a-z$_][a-z0-9$_]*)*)\)\s*{\s*\[native code\]\s*}\s*$/i.test(String(f)));
}
