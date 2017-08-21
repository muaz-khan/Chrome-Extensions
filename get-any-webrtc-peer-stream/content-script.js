var s = document.createElement('script');
s.src = chrome.extension.getURL('RTCPeerConnection-override.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);