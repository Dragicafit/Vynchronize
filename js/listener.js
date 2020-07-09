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
        message.direction = "from-content-WWF";
        window.postMessage(message, "https://www.wakanim.tv");
    });

    window.addEventListener("message", event => {
        if (event.source !== window || !event.data || event.data.direction !== "from-script-WWF")
            return;
        browser.runtime.sendMessage(event.data);
    });

    let s = document.createElement('script');
    s.src = browser.runtime.getURL('/js/script.js');
    s.onload = function () {
        this.remove();
        browser.runtime.sendMessage({
            command: 'scipt loaded'
        });
    };
    (document.head || document.documentElement).appendChild(s);
})();