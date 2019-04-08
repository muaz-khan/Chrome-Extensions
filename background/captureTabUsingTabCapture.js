var tabId;
var tabTitle;
var tabListener;
var tabCaptureListener;

function captureTabUsingTabCapture(resolutions) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(arrayOfTabs) {
        var activeTab = arrayOfTabs[0];
        var activeTabId = activeTab.id; // or do whatever you need

        var constraints = {};

        if (!!enableVideo) {
            constraints = {
                video: true,
                videoConstraints: {
                    mandatory: {
                        chromeMediaSource: 'tab',
                        maxWidth: resolutions.maxWidth,
                        maxHeight: resolutions.maxHeight,
                        minWidth: resolutions.minWidth,
                        minHeight: resolutions.minHeight,
                        minAspectRatio: getAspectRatio(resolutions.maxWidth, resolutions.maxHeight),
                        maxAspectRatio: getAspectRatio(resolutions.maxWidth, resolutions.maxHeight),
                        minFrameRate: 64,
                        maxFrameRate: 128
                    }
                }
            };
        }

        if (!!enableSpeakers) {
            constraints.audio = true;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, function (results) {
            const tab = results.pop();
            tabId = tab ? tab.id : null;
            tabTitle = tab ? tab.title : "";

            sendTabTitle();
        });

        if (tabCaptureListener) {
            chrome.tabCapture.onStatusChanged.removeListener(tabCaptureListener);
            tabCaptureListener = null;
        }
        tabCaptureListener = chrome.tabCapture.onStatusChanged.addListener(function(event) {
            if (event.tabId != tabId) {
                return;
            }

            switch (event.status) {
                case "active":
                    // begin watching tab title
                    if (tabListener) {
                        chrome.tabs.onUpdated.removeListener(tabListener);
                    }

                    tabListener = chrome.tabs.onUpdated.addListener(function (changeTabId, changeInfo) {
                        if (changeTabId != tabId) {
                            return;
                        }
                        if (changeInfo.title && changeInfo.title != tabTitle) {
                            tabTitle = changeInfo.title || tabTitle;
                            sendTabTitle();
                        }
                    });
                    break;
                case "stopped":
                case "error":
                    // end watching tab title, reset state
                    chrome.tabs.onUpdated.removeListener(tabListener);
                    tabListener = null;
                    tabId = null;
                    tabTitle = "";
                    break;
                case "pending":
                default:
                    break;
            }
        });

        chrome.tabCapture.capture(constraints, function(stream) {
            gotTabCaptureStream(stream, constraints);
        });
    });
}

function sendTabTitle() {
    if (connection) {
        // connection.send({ openChat: true });
        connection.send({ newChatMessage: tabTitle });
    }
}