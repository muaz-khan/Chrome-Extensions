﻿var runtimePort = chrome.runtime.connect({
  name: location.href.replace(/\/|:|#|\?|\$|\^|%|\.|`|~|!|\+|@|\[|\||]|\|*. /g, '').split('\n').join('').split('\r').join('')
});

runtimePort.onMessage.addListener(function(message) {
  if (!message || !message.messageFromContentScript1234) {
    return;
  }
});

// document.getElementById('full-screen').onclick = function() {
//   chrome.storage.sync.set({
//     enableTabCaptureAPI: 'false',
//     enableMicrophone: 'false',
//     enableCamera: 'false',
//     enableScreen: 'true', // TRUE
//     isSharingOn: 'true', // TRUE
//     enableVideo: 'true', // TRUE
//     enableSpeakers: 'false' // FALSE
//   }, function() {
//     runtimePort.postMessage({
//       messageFromContentScript1234: true,
//       startSharing: true
//     });
//     window.close();
//   });
// };

document.getElementById('full-screen-audio').onclick = function() {
  chrome.storage.sync.set({
    enableTabCaptureAPI: 'false',
    enableMicrophone: 'false',
    enableCamera: 'false',
    enableScreen: 'false', // TRUE
    isSharingOn: 'true', // TRUE
    enableVideo: 'true', // TRUE
    enableSpeakers: 'true' // TRUE
  }, function() {
    runtimePort.postMessage({
      messageFromContentScript1234: true,
      startSharing: true
    });
    window.close();
  });
};

// document.getElementById('full-screen-audio-microphone').onclick = function() {
//   chrome.storage.sync.set({
//     enableTabCaptureAPI: 'false',
//     enableMicrophone: 'true', // TRUE
//     enableCamera: 'false',
//     enableScreen: 'true', // TRUE
//     isSharingOn: 'true', // TRUE
//     enableVideo: 'true', // TRUE
//     enableSpeakers: 'true' // TRUE
//   }, function() {
//     runtimePort.postMessage({
//       messageFromContentScript1234: true,
//       startSharing: true
//     });
//     window.close();
//   });
// };

// document.getElementById('full-screen-audio-microphone-camera').onclick = function() {
//   chrome.storage.sync.set({
//     enableTabCaptureAPI: 'false',
//     enableMicrophone: 'true', // TRUE
//     enableCamera: 'true',
//     enableScreen: 'true', // TRUE
//     isSharingOn: 'true', // TRUE
//     enableVideo: 'true', // TRUE
//     enableSpeakers: 'true' // TRUE
//   }, function() {
//     runtimePort.postMessage({
//       messageFromContentScript1234: true,
//       startSharing: true
//     });
//     window.close();
//   });
// };

document.getElementById('selected-tab').onclick = function() {
  chrome.storage.sync.set({
    enableTabCaptureAPI: 'true', // TRUE
    enableMicrophone: 'false',
    enableCamera: 'false',
    enableScreen: 'false',
    isSharingOn: 'true', // TRUE
    enableVideo: 'true', // TRUE
    enableSpeakers: 'true'
  }, function() {
    runtimePort.postMessage({
      messageFromContentScript1234: true,
      startSharing: true
    });
    window.close();
  });
};

document.getElementById('selected-tab-audio').onclick = function() {
  chrome.storage.sync.set({
    enableTabCaptureAPI: 'true', // TRUE
    enableMicrophone: 'false',
    enableCamera: 'false',
    enableScreen: 'false',
    isSharingOn: 'true', // TRUE
    enableVideo: 'false', // TRUE
    enableSpeakers: 'true'
  }, function() {
    runtimePort.postMessage({
      messageFromContentScript1234: true,
      startSharing: true
    });
    window.close();
  });
};

// document.getElementById('microphone-screen').onclick = function() {
//   chrome.storage.sync.set({
//     enableTabCaptureAPI: 'false',
//     enableMicrophone: 'true', // TRUE
//     enableCamera: 'false',
//     enableScreen: 'true', // TRUE
//     isSharingOn: 'true', // TRUE
//     enableSpeakers: 'false'
//   }, function() {
//     runtimePort.postMessage({
//       messageFromContentScript1234: true,
//       startSharing: true
//     });
//     window.close();
//   });
// };

// document.getElementById('microphone-screen-camera').onclick = function() {
//   chrome.storage.sync.set({
//     enableTabCaptureAPI: 'false',
//     enableMicrophone: 'true', // TRUE
//     enableCamera: 'true', // TRUE
//     enableScreen: 'true', // TRUE
//     isSharingOn: 'true', // TRUE
//     enableSpeakers: 'false'
//   }, function() {
//     runtimePort.postMessage({
//       messageFromContentScript1234: true,
//       startSharing: true
//     });
//     window.close();
//   });
// };

// document.getElementById('microphone-webcam').onclick = function() {
//   chrome.storage.sync.set({
//     enableTabCaptureAPI: 'false',
//     enableMicrophone: 'true', // TRUE
//     enableCamera: 'true', // TRUE
//     enableScreen: 'false', // FALSE
//     isSharingOn: 'true', // TRUE
//     enableSpeakers: 'false'
//   }, function() {
//     runtimePort.postMessage({
//       messageFromContentScript1234: true,
//       startSharing: true
//     });
//     window.close();
//   });
// };

document.getElementById('options-button').onclick = function(e) {
  e.preventDefault();
  location.href = this.href;
};

function querySelectorAll(selector, element) {
  element = element || document;
  return Array.prototype.slice.call(element.querySelectorAll(selector));
}

chrome.storage.sync.get(['isSharingOn', 'room_id', 'sessionId', 'room_password'], function(obj) {
  var isSharingOn = obj.isSharingOn === 'true';
  
  document.getElementById('stream-section').style.display = isSharingOn ? 'none' : 'block';
  document.getElementById('stop-section').style.display = isSharingOn ? 'block' : 'none';

  if (isSharingOn) {
    document.getElementById('room-id-label').hidden = true;
    var linkToSession = document.getElementById('link-to-session');
    linkToSession.innerHTML = '2n.fm/?s=' + obj.sessionId
    linkToSession.href = 'https://' + linkToSession.innerHTML;
    // if setDefaults hasn't been called yet, key-values are undefined, otherwise empty string
    linkToSession.href += (obj.room_password || '') == '' ? '' : '&p=' + obj.room_password;
    linkToSession.hidden = false;

    // auto-stop-sharing
    // document.getElementById('stop-sharing').click();
  } else {
    // if setDefaults hasn't been called yet, key-values are undefined, otherwise empty string
    document.getElementById('room-id').value = obj.room_id || '';
  }
});

document.getElementById('stop-sharing').onclick = function() {
  chrome.storage.sync.set({
    isSharingOn: 'false'
  }, function() {
    runtimePort.postMessage({
      messageFromContentScript1234: true,
      stopSharing: true
    });
    window.close();
  });
};

document.getElementById('room-id').onchange = function (event) {
  event && event.stopPropagation();
  this.disabled = true;

  try {
    chrome.storage.sync.set({ room_id: this.value }, () => {
      this.disabled = false;
    })
  }
  catch(e) {
    location.reload();
  }
};

// document.getElementById('enable-chat').onclick = function() {
//   var popup_width = 312;
//   var popup_height = 400;

//   runtimePort.postMessage({
//     messageFromContentScript1234: true,
//     openChat: true
//   });

//   window.open('chat.html','Chat','width='+popup_width+',height='+popup_height+',toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=0,top='+(screen.height - popup_height)+',left=' + (screen.width - popup_width - 30));
//   window.close();
// };