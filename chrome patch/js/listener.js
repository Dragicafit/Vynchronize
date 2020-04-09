(function () {
    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again,
     * it will do nothing next time.
     */
    if (window.hasRun) {
        console.log("already running");
        chrome.runtime.sendMessage({
            command: 'scipt loaded'
        });
        return;
    }
    window.hasRun = true;

    /**
     * Listen for messages from the background script.
     * Call "beastify()" or "reset()".
    */
    chrome.runtime.onMessage.addListener(message => {
        document.dispatchEvent(new CustomEvent(message.command, { detail: JSON.stringify(message) }));
    });

    document.addEventListener('send info', e => {
        var data = JSON.parse(e.detail);
        chrome.runtime.sendMessage({
            command: 'send info',
            username: data.username,
            roomnum: data.roomnum
        });
    });

    document.addEventListener('changeVideoClient', e => {
        var data = JSON.parse(e.detail);
        chrome.runtime.sendMessage({
            command: 'changeVideoClient',
            videoId: data.videoId,
            location: data.location,
            username: data.username,
            roomnum: data.roomnum
        });
    });

    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('/js/script.js');
    s.onload = function () {
        this.remove();
        chrome.runtime.sendMessage({
            command: 'scipt loaded'
        });
    };
    (document.head || document.documentElement).appendChild(s);
})();