(function () {
    if (window.hasRun) {
        console.log("already running");
        browser.runtime.sendMessage({
            command: 'scipt loaded'
        });
        return;
    }
    window.hasRun = true;

    browser.runtime.onMessage.addListener(message => {
        document.dispatchEvent(new CustomEvent(message.command, { detail: JSON.stringify(message) }));
    });

    var redirects = ['send info', 'changeVideoClient'];
    redirects.forEach(redirect => {
        document.addEventListener(redirect, e => {
            var data = JSON.parse(e.detail);
            data.command = redirect;
            browser.runtime.sendMessage(data);
        });
    });

    var s = document.createElement('script');
    s.src = browser.runtime.getURL('/js/script.js');
    s.onload = function () {
        this.remove();
        browser.runtime.sendMessage({
            command: 'scipt loaded'
        });
    };
    (document.head || document.documentElement).appendChild(s);
})();