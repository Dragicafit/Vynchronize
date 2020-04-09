var roomsTabs = {};
var username = "";

browser.runtime.onMessage.addListener((message, sender) => {
    if (message.command == 'changeVideoClient') {
        console.log("change video client");

        var tabId = sender.tab.id;
        if (roomsTabs[tabId] == null)
            return;

        browser.tabs.update(tabId, { active: true, url: "https://www.wakanim.tv/" + message.location + "/v2/catalogue/episode/" + message.videoId });
    } else if (message.command == 'createVideoClient') {
        console.log("create video client");

        roomsTabs[message.tab] = 0;
    } else if (message.command == 'send info') {
        console.log("get info");

        var tabId = sender.tab.id;
        if (message.username)
            username = message.username;
        if (message.roomnum)
            roomsTabs[tabId] = message.roomnum;
    }
});

function sendInfo(tabId) {
    console.log("send info");
    browser.tabs.sendMessage(tabId,
        {
            command: 'new user',
            username: username,
        }).catch(reportError);
    browser.tabs.sendMessage(tabId,
        {
            command: 'new room',
            roomnum: roomsTabs[tabId]
        }).catch(reportError);
}

function insertScript(tabId) {
    var listener = message => {
        if (message.command == 'scipt loaded') {
            console.log("scipt loaded");
            browser.runtime.onMessage.removeListener(listener);
            sendInfo(tabId);
        }
    };
    browser.runtime.onMessage.addListener(listener);

    console.log("executeScript");
    browser.tabs.executeScript(tabId, {
        runAt: "document_end",
        file: "/js/listener.js"
    })
        .catch(reportError);
}

browser.tabs.onUpdated.addListener((tabId) => {
    if (roomsTabs[tabId] == null)
        return;
    console.log("updated");
    insertScript(tabId);
});

function reportError(error) {
    console.error(`Could not beastify: ${error}`);
}