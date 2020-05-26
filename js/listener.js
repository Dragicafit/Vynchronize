(function () {
    if (window.hasRun) {
        console.log("already running");
        chrome.runtime.sendMessage({
            command: 'scipt loaded'
        });
        return;
    }
    window.hasRun = true;

    chrome.runtime.onMessage.addListener(message => {
        document.dispatchEvent(new CustomEvent(message.command, { detail: JSON.stringify(message) }));
    });

    var redirects = ['send info', 'changeVideoClient'];
    redirects.forEach(redirect => {
        document.addEventListener(redirect, e => {
            var data = JSON.parse(e.detail);
            data.command = redirect;
            chrome.runtime.sendMessage(data);
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