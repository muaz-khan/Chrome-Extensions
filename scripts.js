(function() {
  var params = {},
      r = /([^&=]+)=?([^&]*)/g,
      DEFAULTS = { s: '2nfm', bandwidth: 8192 };

  function d(s) {
      return decodeURIComponent(s.replace(/\+/g, ' '));
  }

  var match, search = window.location.search;
  while (match = r.exec(search.substring(1)))
      params[d(match[1])] = d(match[2]);

  window.params = Object.assign({}, DEFAULTS, params);
})();

var infoBar = document.getElementById('info-bar');
var body = document.getElementsByTagName("BODY")[0];

// http://www.rtcmulticonnection.org/docs/constructor/
var connection = new RTCMultiConnection(params.s);
connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
connection.autoCloseEntireSession = true;

// this must match the extension page
connection.socketMessageEvent = 'desktopCapture';

connection.enableLogs = true;
connection.session = {
  audio: true,
  video: true,
  data: true,
  oneway: true
};

// www.rtcmulticonnection.org/docs/sdpConstraints/
connection.sdpConstraints.mandatory = {
  OfferToReceiveAudio: true,
  OfferToReceiveVideo: true
};

connection.getExternalIceServers = false;
connection.iceServers = IceServersHandler.getIceServers();

function setBandwidth(sdp) {
  sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
  sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:10000\r\n');
  return sdp;
}

connection.processSdp = function(sdp) {
  var bandwidth = params.bandwidth;
  var codecs = params.codecs;
  
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

connection.optionalArgument = {
  optional: [],
  mandatory: {}
};

connection.onstatechange = function(state) {
  infoBar.innerHTML = state.name + ': ' + state.reason;

  if(state.name == 'request-rejected' && params.p) {
      infoBar.innerHTML = 'Password (' + params.p + ') did not match with broadcaster, that is why your participation request has been rejected.<br>Please contact him and ask for valid password.';
  }

  if(state.name === 'room-not-available') {
      infoBar.innerHTML = 'Screen share session is closed or paused. You will join automatically when share session is resumed.';
  }
};

connection.onstreamid = function(event) {
  infoBar.innerHTML = 'Remote peer is about to send his screen.';
};

var video = document.getElementById('video');
var audio = document.getElementById('audio');
connection.onstream = function(e) {
  video.srcObject = null;
  audio.srcObject = null;
  if (e.stream.isVideo) {
    video.srcObject = e.stream;
    audio.setAttribute('hidden', '');
    video.removeAttribute('hidden');
  } else {
    audio.srcObject = e.stream;
    video.setAttribute('hidden', '');
    audio.removeAttribute('hidden');
  }
  body.classList.remove("not-active");
  body.classList.add("active");
};

// if user left
connection.onleave = connection.onstreamended = connection.onSessionClosed = function(e) {
  if(e.userid !== params.s) return;

  video.srcObject = null;
  
  infoBar.innerHTML = 'Screen sharing has been closed.';
  body.classList.remove("active");
  body.classList.add("not-active");
  statsBar.setAttribute('hidden', '');
  connection.close();
  connection.closeSocket();
  connection.userid = connection.token();

  location.reload();
};

connection.onJoinWithPassword = function(remoteUserId) {
  if(!params.p) {
      params.p = prompt(remoteUserId + ' is password protected. Please enter the pasword:');
  }

  connection.password = params.p;
  connection.join(remoteUserId);
};

connection.onInvalidPassword = function(remoteUserId, oldPassword) {
  var password = prompt(remoteUserId + ' is password protected. Your entered wrong password (' + oldPassword + '). Please enter valid pasword:');
  connection.password = password;
  connection.join(remoteUserId);
};

connection.onPasswordMaxTriesOver = function(remoteUserId) {
  alert(remoteUserId + ' is password protected. Your max password tries exceeded the limit.');
};

connection.onSocketDisconnect = function(event) {
  // alert('Connection to the server is closed.');
  if(connection.getAllParticipants().length > 0) return;
  location.reload();
};

connection.onSocketError = function(event) {
  alert('Unable to connect to the server. Please try again.');
      
  setTimeout(function() {
      location.reload();
  }, 1000);
};

connection.onopen = function(event) {
  // 
};

var chatContainer = document.getElementById('chat-container');
connection.onmessage = function(event) {
  if(event.data.openChat === true) {
    chatContainer.removeAttribute('hidden');
  }

  if(event.data.closeChat === true) {
    chatContainer.setAttribute('hidden', '');
  }

  if(event.data.newChatMessage) {
    // there is a possibility that broadcaster did not send "openChat:true" signal
    // chatContainer.removeAttribute('hidden');

    appendChatMessage('Broadcaster', event.data.newChatMessage);
    updateTitle(event.data.newChatMessage);
    connection.send({
        receivedChatMessage: true,
        checkmark_id: event.data.checkmark_id
    });
  }

  if(event.data.receivedChatMessage) {
    if(document.getElementById(event.data.checkmark_id)) {
        document.getElementById(event.data.checkmark_id).style.display = '';
    }
  }
};

var txtChatMessage = document.getElementById('txt-chat-message');
var chatMessages = document.getElementById('chat-messages');

txtChatMessage.onkeyup = function(e) {
  if(e.keyCode === 13) {
    var checkmark_id = (Math.random()*100).toString().replace('.', '');
    appendChatMessage('You', this.value, checkmark_id);
    connection.send({
        newChatMessage: this.value
    });
    this.value = '';
  }
};

function appendChatMessage(name, message, checkmark_id) {
  var div = document.createElement('div');
  if(checkmark_id) {
      div.innerHTML = '<p><span class="name">' + name + ': <img class="checkmark" id="' + checkmark_id + '" title="Received" src="images/checkmark.png"></span></p><p>' + message + '</p>';
  }
  else {
      div.innerHTML = '<p><span class="name">' + name + ':</span></p><p>' + message + '</p>';
  }
  chatMessages.appendChild(div);

  chatMessages.scrollTop = chatMessages.clientHeight;
  chatMessages.scrollTop = chatMessages.scrollHeight - chatMessages.scrollTop;
}

var tabTitle = document.getElementById('tab-title');
function updateTitle(message) {
  tabTitle.innerHTML = message;
}

connection.socketCustomEvent = params.s;

function checkPresence() {
  infoBar.innerHTML = 'Checking room: ' + params.s;

  connection.checkPresence(params.s, function(isRoomExist, roomid, extra) {
      if (isRoomExist === false) {
          infoBar.innerHTML = 'Room does not exist: ' + params.s;

          setTimeout(function() {
              infoBar.innerHTML = 'Checking room: ' + params.s;
              setTimeout(checkPresence, 1000);
          }, 4000);
          return;
      }

      infoBar.innerHTML = 'Joining room: ' + params.s;

      connection.password = null;
      if (params.p) {
          connection.password = params.p;
      }

      connection.join(params.s);
  });
}

if(params.s) {
  checkPresence();
}

var dontDuplicate = {};
connection.onPeerStateChanged = function(event) {
  if(!connection.getRemoteStreams(params.s).length) {
      if(event.signalingState === 'have-remote-offer') {
          infoBar.innerHTML = 'Received WebRTC offer from: ' + params.s;
      }

      else if(event.iceGatheringState === 'complete' && event.iceConnectionState === 'connected') {
          infoBar.innerHTML = 'WebRTC handshake is completed. Waiting for remote video from: ' + params.s;
      }
  }

  if(event.iceConnectionState === 'connected' && event.signalingState === 'stable') {
      if(dontDuplicate[event.userid]) return;
      dontDuplicate[event.userid] = true;

      var peer = connection.peers[event.userid].peer;

      getStats(peer, function(stats) {
          onGettingWebRCStats(stats, event.userid);

          if(video.paused) {
              video.play();
          }
      }, 1000);

      // statsBar.removeAttribute('hidden');
  }
};

var statsBar = document.getElementById('stats-bar');
var statsBarHTML = document.getElementById('stats-bar-html');
var NO_MORE = false;

document.getElementById('show-stats-bar').onclick = function() {
  statsBar.removeAttribute('hidden');
  NO_MORE = false;
};

document.getElementById('hide-stats-bar').onclick = function() {
  statsBar.setAttribute('hidden', '');
  NO_MORE = true;
};

function onGettingWebRCStats(stats, userid) {
  if(!connection.peers[userid] || NO_MORE) {
      stats.nomore();
      return;
  }

  var html = 'Video: ' + stats.video.recv.codecs;
  html += '<br>';
  html += 'Resolution: ' + stats.resolutions.recv.width + 'x' + stats.resolutions.recv.height;
  html += '<br>';
  html += 'Audio: ' + stats.audio.recv.codecs;
  html += '<br>';
  html += 'Data: ' + bytesToSize(stats.audio.bytesReceived + stats.video.bytesReceived);
  // html += '<br>';
  // html += 'Speed: ' + bytesToSize(stats.bandwidth.speed || 0);
  statsBarHTML.innerHTML = html;
}

function bytesToSize(bytes) {
  var k = 1000;
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) {
      return '0 Bytes';
  }
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

window.addEventListener('offline', function() {
  infoBar.innerHTML = 'You seem to be offline.';
}, false);

window.addEventListener('online', function() {
  infoBar.innerHTML = 'You are back online. Reloading the page...';
  location.reload();
}, false);