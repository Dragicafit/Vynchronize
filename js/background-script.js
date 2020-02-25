  var socket = io.connect();
  var roomnum = 1
  var id = "M7lc1UVf-VE"
  var username = ""
  // Don't allow trailing or leading whitespace!
  var nosymbols = new RegExp("^(([a-zA-Z0-9_-][a-zA-Z0-9 _-]*[a-zA-Z0-9_-])|([a-zA-Z0-9_-]*))$");

  // Remove the video from the queue at idx
  function removeAt(idx) {
      socket.emit('remove at', {
          idx: idx
      })
  }

  function playAt(idx) {
      socket.emit('play at', {
          idx: idx
      }, function (data) {
          var videoId = data.videoId

          // Change the video
          socket.emit('change video', {
              room: roomnum,
              videoId: videoId,
              time: 0
          })
      })
  }

  browser.runtime.sendMessage({
    command: 'set id'
  });
  // set id
  socket.on('set id', function (data) {
      // Ensure no valid id too
      if (data.id != "" && nosymbols.test(data.id)) {
          document.getElementById('roomnum').value = data.id
          // Probably should not force it to be readonly
          // document.getElementById('roomnum').readOnly = true
          console.log("You are joining room: " + data.id)
      }
      // Reset url for next person
      // Workaround
      socket.emit('reset url')
  });

  function outFunc() {
      var tooltip = document.getElementById("myTooltip");
      tooltip.innerHTML = "Copy to clipboard";
  }

  // Generate a random alphanumeric room id
  function randomroom() {
      document.getElementById('roomnum').value = Math.random().toString(36).substr(2, 12)
  }