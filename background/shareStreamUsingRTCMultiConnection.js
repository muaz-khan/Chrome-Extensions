function shareStreamUsingRTCMultiConnection(stream) {
    // www.RTCMultiConnection.org/docs/
    connection = new RTCMultiConnection();
    connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
    connection.autoCloseEntireSession = true;

    // this must match the viewer page
    connection.socketMessageEvent = 'desktopCapture';
    
    connection.password = null;
    if (room_password && room_password.length) {
        connection.password = room_password;
    }

    connection.enableLogs = false;
    connection.session = {
        audio: true,
        video: true,
        data: true,
        oneway: true
    };

    connection.candidates = {
        stun: true,
        turn: true
    };

    connection.iceProtocols = {
        tcp: true,
        udp: true
    };

    connection.optionalArgument = {
        optional: [],
        mandatory: {}
    };

    connection.channel = connection.sessionid = connection.userid;

    if (room_id && room_id.length) {
        connection.channel = connection.sessionid = connection.userid = room_id;
    }

    connection.autoReDialOnFailure = true;
    connection.getExternalIceServers = false;

    connection.iceServers = IceServersHandler.getIceServers();

    function setBandwidth(sdp, value) {
        sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
        sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + value + '\r\n');
        return sdp;
    }

    connection.processSdp = function(sdp) {
        if (bandwidth) {
            try {
                bandwidth = parseInt(bandwidth);
            } catch (e) {
                bandwidth = null;
            }

            if (bandwidth && bandwidth != NaN && bandwidth != 'NaN' && typeof bandwidth == 'number') {
                sdp = setBandwidth(sdp, bandwidth);
                sdp = BandwidthHandler.setVideoBitrates(sdp, {
                    min: bandwidth,
                    max: bandwidth
                });
            }
        }

        if (!!codecs && codecs !== 'default') {
            sdp = CodecsHandler.preferCodec(sdp, codecs);
        }
        return sdp;
    };

    // www.rtcmulticonnection.org/docs/sdpConstraints/
    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false
    };

    connection.onstream = connection.onstreamended = function(event) {
        try {
            event.mediaElement.pause();
            delete event.mediaElement;
        } catch (e) {}
    };

    // www.RTCMultiConnection.org/docs/dontCaptureUserMedia/
    connection.dontCaptureUserMedia = true;

    // www.RTCMultiConnection.org/docs/attachStreams/
    connection.attachStreams.push(stream);

    var text = '-';
    (function looper() {
        if (!connection) {
            setBadgeText('');
            return;
        }

        if (connection.isInitiator) {
            setBadgeText('0');
            return;
        }

        text += ' -';
        if (text.length > 6) {
            text = '-';
        }

        setBadgeText(text);
        setTimeout(looper, 500);
    })();

    // www.RTCMultiConnection.org/docs/open/
    connection.socketCustomEvent = connection.sessionid;

    function roomOpenCallback(isRoomOpened, roomid, error) {
        if(error) {
            alert(error);
        }

        // any key-values set here should be reset in setDefaults.js
        chrome.storage.sync.set({
            sessionId: connection.sessionid
        });

        chrome.browserAction.enable();
        setBadgeText(0);

        if (room_url_box === true) {
            var resultingURL = 'https://2n.fm/?s=' + connection.sessionid;

            // resultingURL = 'http://localhost:9001/?s=' + connection.sessionid;

            if (room_password && room_password.length) {
                resultingURL += '&p=' + room_password;
            }

            if (bandwidth) {
                resultingURL += '&bandwidth=' + bandwidth;
            }
            if (!!codecs && codecs !== 'default') {
                resultingURL += '&codecs=' + codecs;
            }

            var popup_width = 600;
            var popup_height = 170;

            chrome.windows.create({
                url: "data:text/html,<title>Unique Room URL</title><h1 style='text-align:center'>Copy following URL:</h1><input type='text' value='" + resultingURL + "' style='text-align:center;width:100%;font-size:1.2em;'><p style='text-align:center'>Share this link with anyone you would like to share your cast with.</p>",
                type: 'popup',
                width: popup_width,
                height: popup_height,
                top: parseInt((screen.height / 2) - (popup_height / 2)),
                left: parseInt((screen.width / 2) - (popup_width / 2)),
                focused: true
            }, function(win) {
                popup_id = win.id;
            });
        }

        connection.socket.on(connection.socketCustomEvent, function(message) {
            if (message.receivedYourScreen) {
                setBadgeText(connection.isInitiator ? connection.getAllParticipants().length : '');
            }
        });
    }

    connection.onSocketDisconnect = function(event) {
        // alert('Connection to the server is closed.');
        if(connection.getAllParticipants().length > 0) return;
        
        setDefaults();
        chrome.runtime.reload();
    };

    connection.onSocketError = function(event) {
        alert('Unable to connect to the server. Please try again.');
        
        setTimeout(function() {
            setDefaults();
            chrome.runtime.reload();
        }, 1000);
    };

    connection.onopen = function(event) {
        // 
    };

    connection.onmessage = function(event) {
        if(event.data.newChatMessage) {
            runtimePort.postMessage({
                messageFromContentScript1234: true,
                newChatMessage: event.data.newChatMessage
            });

            connection.send({
                receivedChatMessage: true,
                checkmark_id: event.data.checkmark_id
            });
        }

        if(event.data.receivedChatMessage) {
            runtimePort.postMessage({
                messageFromContentScript1234: true,
                receivedChatMessage: true,
                checkmark_id: event.data.checkmark_id
            });
        }
    };

    connection.open(connection.sessionid, roomOpenCallback);

    var oldLength = 0;
    connection.onleave = connection.onPeerStateChanged = function() {
        var participantsCount = connection.getAllParticipants().length;
        if (oldLength != participantsCount) {
            sendTabTitle();
        }
        setBadgeText(connection.isInitiator ? participantsCount : '');
    };
}
