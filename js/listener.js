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
    browser.runtime.onMessage.addListener((message) => {
        if (message.command === "new room") {
            socket.emit("new room", message.roomnum, data => {
                // This should only call back if the client is the host
                if (data) {
                    console.log("Host is syncing the new socket!")
                    syncVideo(roomnum)
                }
            })
        } else if (message.command === "new user") {
            socket.emit("new user", message.username, data => {
                if (data) {
                    // This sets the room number on the client
                    if ($roomnum.val() != "") {
                        roomnum = message.roomnum
                    }
                }
            })
        }
    });
})();