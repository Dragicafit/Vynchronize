var roomsTabs = {};

chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.command == 'changeVideoClient') {
        console.log("change video client");

        var tabId = sender.tab.id;
        if (roomsTabs[tabId] == null)
            return;

        chrome.tabs.update(tabId, { active: true, url: "https://www.wakanim.tv/" + message.location + "/v2/catalogue/episode/" + message.videoId });
    } else if (message.command == 'createVideoClient') {
        console.log("create video client");

        roomsTabs[message.tab] = 0;
    } else if (message.command == 'send info') {
        console.log("get info");

        var tabId = sender.tab.id;
        if (message.username)
            chrome.storage.local.set({ username: message.username });
        if (message.roomnum)
            roomsTabs[tabId] = message.roomnum;
    }
});

function sendInfo(tabId) {
    console.log("send info");
    chrome.storage.local.get(['username'], item => {
        if (item['username'] == null)
            return;
        chrome.tabs.sendMessage(tabId,
            {
                command: 'new user',
                username: item['username'],
            });
    });
    chrome.tabs.sendMessage(tabId,
        {
            command: 'new room',
            roomnum: roomsTabs[tabId]
        });
}

function insertScript(tabId) {
    var listener = message => {
        if (message.command == 'scipt loaded') {
            console.log("scipt loaded");
            chrome.runtime.onMessage.removeListener(listener);
            sendInfo(tabId);
        }
    };
    chrome.runtime.onMessage.addListener(listener);

    console.log("executeScript");
    chrome.tabs.executeScript(tabId, {
        runAt: "document_end",
        file: "/js/listener.js"
    });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status != "complete")
        return;
    if (roomsTabs[tabId] == null)
        return;
    console.log("updated");
    insertScript(tabId);
});

function reportError(error) {
    console.error(`Could not beastify: ${error}`);
}