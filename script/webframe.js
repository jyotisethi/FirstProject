var baseTitle = document.title;

if (isPostMessageEnabled()) {
    addMessageListener(commonFrameMessageHandler);
}

// start custom: HTML5 History
$(document).ready(function() {
  window.historySupported = (window.history && window.history.replaceState) && window.location.origin !== 'file://';
});
// end custom: HTML5 History

/**
* @param {Object} event
**/
function commonFrameMessageHandler(event) {
    var message = getMessage(event.data);

    switch (message.messageType) {
        case "loaded":
            contentLoaded(message.messageData);
            // Forward message to webnav
            try {
                document.getElementById('webnavbar').contentWindow.postMessage(message.messageType + "|" + message.messageData, "*");
            } catch (ex) {

            }
            break;
        case "updatePageTitle":
            updatePageTitle(message.messageData);
            break;
    }
}

/**
* @param {string} pageTitle
**/
function contentLoaded(url) {
    updateLocation(url);

    if (typeof contentLoadedImplementation == 'function') {
        contentLoadedImplementation();
    }
}

function updateLocation(url) {

    var pageName = url.substring(url.lastIndexOf('/') + 1);
    // start custom: HTML5 History
    if(window.historySupported) {
      if(pageName !== window.location.href.substring(window.location.href.lastIndexOf('/') + 1)) {
        window.history.replaceState('', '', pageName);
      }
    }
    // end custom: HTML5 History
    else if ('#' + pageName != document.location.hash) {
        if (window.history.replaceState) {
            window.history.replaceState('', '', '#' + pageName);
        } else {
            window.location.replace('#' + pageName);
        }
    }

}

/**
* @param {string} pageTitle
**/
function updatePageTitle(pageTitle) {

    document.title = baseTitle + ' - ' + pageTitle;

}

function getCurrentPageName() {

    if(window.historySupported) { // start custom: HTML5 History
      return window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
    } // end custom: HTML5 History
    else if (window.location.hash != "") {
        return window.location.hash.substring(1);
    }
    else {
        return getDefaultTopic();
    }

}
if (isPostMessageEnabled()) {
    addMessageListener(frameMessageHandler);
}

/**
* @param {!Object} event
**/
function frameMessageHandler(event) {
    var message = getMessage(event.data);

    switch (message.messageType) {
        case "navigate":

            if ($('#webcontent').attr('src') != message.messageData
                || (window.location.hash.length > 0 && window.location.hash.substring(1) != message.messageData)
                || (window.location.search.length > 0 && window.location.search.substring(1) != message.messageData)
                || (window.location.hash.length == 0 && window.location.search.length == 0)) {
                $('#webcontent').attr('src', message.messageData);
            }
            break;
    }
}

function constructLayout() {

    $('body').layout({
        resizeWhileDragging: true,
        west__size: 270,
        maskIframesOnResize: true,
        north: {
    		size: 70,						
    		enableCursorHotkey: false,
    	    closable: false,
    	    resizable: false,
    	    spacing_open: 0,
    	    spacing_closed: 0
    	}
    });

}
window['constructLayout'] = constructLayout;

function contentLoadedImplementation() {

    setTimeout(function () {
        document.getElementById('webnavbar').contentWindow.postMessage('syncToC|' + getCurrentPageName(), '*');
    }, 500);

}
window['contentLoadedImplementation'] = contentLoadedImplementation;

function onDesktopWebFrameLoadComplete() {

    constructLayout();
    // Call contentLoadedImplementation now as the function won't be defined in the message handler until the specific
    // script has finished loading
    contentLoadedImplementation();
    setTimeout(function () {
        $('html').removeClass('loading');
        $('html').addClass('loaded');
    }, 1);

}
window['onDesktopWebFrameLoadComplete'] = onDesktopWebFrameLoadComplete;