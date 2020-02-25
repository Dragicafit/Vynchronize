var roomnum = 1
var id = "M7lc1UVf-VE"
var username = ""
// Don't allow trailing or leading whitespace!
var nosymbols = new RegExp("^(([a-zA-Z0-9_-][a-zA-Z0-9 _-]*[a-zA-Z0-9_-])|([a-zA-Z0-9_-]*))$");

// Remove the video from the queue at idx
function removeAt(idx) {
    browser.tabs.sendMessage(browser.tabs.query({
        currentWindow: true,
        active: true
      })[0].id,
    {
        command: 'remove at',
        idx: idx
    })
}

function playAt(idx) {
    browser.tabs.sendMessage(browser.tabs.query({
        currentWindow: true,
        active: true
      })[0].id,
    {
        command: 'play at',
        idx: idx
    }).then(data => {
        var videoId = data.videoId

        // Change the video
        rowser.tabs.sendMessage(browser.tabs.query({
            currentWindow: true,
            active: true
          })[0].id,
        {
            command:'change video',
            room: roomnum,
            videoId: videoId,
            time: 0
        })
    })
}

// set id
browser.runtime.onMessage.addListener((data, sender) => {
    // Ensure no valid id too
    if (data.command != 'set id')
        return
    if (data.id != "" && nosymbols.test(data.id)) {
        document.getElementById('roomnum').value = data.id
        // Probably should not force it to be readonly
        // document.getElementById('roomnum').readOnly = true
        console.log("You are joining room: " + data.id)
    }
    // Reset url for next person
    // Workaround
    browser.tabs.sendMessage(browser.tabs.query({
        currentWindow: true,
        active: true
      })[0].id,
      {
          command: 'reset url'
      })
});

function copyInvite() {
    /* Get the text field */
    var copyText = document.getElementById("inv_input");
    console.log(copyText)
    /* Select the text field */
    copyText.select();
    /* Copy the text inside the text field */
    document.execCommand("Copy");
    /* Alert the copied text */
    // alert("Copied the text: " + copyText.value);
    var tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copied!";
}

function outFunc() {
    var tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copy to clipboard";
}

// Generate a random alphanumeric room id
function randomroom() {
    document.getElementById('roomnum').value = Math.random().toString(36).substr(2, 12)
}


browser.tabs.query({ url: 'http://localhost/*', visible: true, active: true }).executeScript({
    // Bootstrap core JavaScript
    file: "/js/dependencies/jquery.min.js",
    file: "/js/dependencies/bootstrap.bundle.min.js",
    file: "/js/dependencies/scrolling-nav.js",
    file: "/js/dependencies/bootstrap-notify.min.js",
    // Plugin JavaScript
    file: "/js/dependencies/jquery.easing.min.js",
    // My JS files
    file: "/js/sync.js",
    file: "/js/player.js",
    file: "/js/host.js",
    file: "/js/events.js",
    file: "/js/notify.js",
    // Youtube
    file: "js/yt.js",
    // Daily Motion
    file: "https://api.dmcdn.net/all.js",
    file: "js/dm.js",
    // Vimeo
    file: "https://player.vimeo.com/api/player.js",
    file: "js/vimeo.js",
    // HTML5 Player
    file: "js/html5.js"

})