// Constructor function to handle the onscreen menu, keyboard and mouse controls
function ControlsAndInput() {
  this.menuDisplayed = false;

  // Playback button displayed in the top left of the screen
  this.playbackButton = new PlaybackButton();

  // Make the window fullscreen or revert to windowed
  this.mousePressed = function () {
    // Check if the playback button has been clicked
    if (this.playbackButton.hitCheck(mouseX, mouseY)) {
      this.playbackButton.mousePressed();
    } else {
      // Check if the mouse click is within the menu area
      if (this.menuDisplayed) {
        for (let i = 0; i < vis.visuals.length; i++) {
          let y = 80 + i * 40;
          if (mouseX > 100 && mouseX < 400 && mouseY > y - 32 && mouseY < y) {
            vis.selectVisual(vis.visuals[i].name);
            this.menuDisplayed = false;
            break;
          }
        }
      } else {
        // Make the visualisation fullscreen
        let fs = fullscreen();
        fullscreen(!fs);
      }
    }
  };

  // Responds to keyboard presses
  // @param keycode the ASCII code of the key pressed
  this.keyPressed = function (keycode) {
    console.log(keycode);
    if (keycode == 32) {
      this.menuDisplayed = !this.menuDisplayed;
    }

    if (keycode > 48 && keycode < 58) {
      var visNumber = keycode - 49;
      if (visNumber < vis.visuals.length) {
        vis.selectVisual(vis.visuals[visNumber].name);
        this.menuDisplayed = false;
      }
    }
  };

  // Draws the playback button and potentially the menu
  this.draw = function () {
    push();
    fill("white");
    stroke("black");
    strokeWeight(2);
    textSize(34);

    // Playback button
    this.playbackButton.draw();
    // Only draw the menu if menuDisplayed is set to true
    if (this.menuDisplayed) {
      text("Select a visualisation:", 100, 30);
      this.menu();
    }
    pop();
  };

  this.menu = function () {
    // Draw out menu items for each visualisation
    for (let i = 0; i < vis.visuals.length; i++) {
      let visual = vis.visuals[i];
      textSize(32);
      fill(255);
      text(i + 1 + "> " + visual.name, 100, 80 + i * 40);
    }
  };
}
