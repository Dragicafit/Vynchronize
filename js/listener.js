(function () {
    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again,
     * it will do nothing next time.
     */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    /**
     * Listen for messages from the background script.
     * Call "beastify()" or "reset()".
    */
    browser.runtime.onMessage.addListener(message => {
        document.dispatchEvent(new CustomEvent(message.command, { detail: JSON.stringify(message) }))
    });

    var s = document.createElement('script');
    s.src = browser.runtime.getURL('/js/script.js');
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
})();