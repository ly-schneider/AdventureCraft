//Create a Pixi Application
PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
let app = new PIXI.Application({ 
    width: 512, 
    height: 256,                       
    antialias: false,
    transparent: false,
    resolution: 1
  }
);
app.stage.scale.x = 4;
app.stage.scale.y = 4;

// Game action state - 0: resting, 1: defensive, 2: offensive
let gameAction = 0;

let playerSprites = [], npcSprites = [];

let playerScore = 0, boseScore = 0;

// Number padding utility
const zeroPad = (num, places) => String(num).padStart(places, '0');

// Load animated sprite
function loadSprite(prefix, indexes=[], places=2, size=32, fmt='.png') {
  let textureArray = [];
  indexes.forEach(function(i) {
    let texture = PIXI.Texture.from(prefix + zeroPad(i, places) + fmt);
    textureArray.push(texture);
  });
  anim = new PIXI.extras.AnimatedSprite(textureArray);
  anim.width = size;
  anim.height = size;
  anim.animationSpeed = 0.15
  return anim;
}

//Add the canvas that Pixi automatically created for you to the HTML document
window.onload = () => {
  document.body.appendChild(app.view)

  //load additional sprites and run the `setup` function when it's done
  PIXI.loader
    .load(setup);

  // why?
  setup();
  
  app.start()
}

//This `setup` function will run when the image has loaded
async function setup() {

  gameMessage = new PIXI.Text('Player: 135  Boss: 10', {
     fontFamily: 'Arial', fontSize: 12, fill: 0xff1010, align: 'center' 
    });
  gameMessage.position.x = 5;
  gameMessage.position.y = 45;
  app.stage.addChild(gameMessage);

  let jesterWalk = loadSprite("jester/sprite_", [6, 7]);
  app.stage.addChild(jesterWalk)
  jesterWalk.play();

  let jesterLight = loadSprite("jester/sprite_", [4, 5]);
  //jesterLight.x = 40;
  app.stage.addChild(jesterLight)
  jesterLight.play();

  let jesterDefend = loadSprite("jester/sprite_", [6, 2, 12, 10]);
  // jesterDefend.x = 80;
  app.stage.addChild(jesterDefend)
  jesterDefend.play();

  /*
  let jesterRocking = loadSprite("jester/sprite_", [10, 11]);
  jesterRocking.x = 80;
  app.stage.addChild(jesterRocking)
  jesterRocking.play();
  */

  playerSprites = [
    jesterWalk,
    jesterLight,
    jesterDefend
  ]

  let boseWicht = loadSprite("watcher/sprite_", [1, 1, 1, 1, 1, 3, 4], 1);
  boseWicht.x = 80;
  boseWicht.y = 5;
  boseWicht.animationSpeed = 0.05
  app.stage.addChild(boseWicht)
  boseWicht.play();

  npcSprites = [
    boseWicht
  ]

  initML();

  //Set the game state
  state = play;

  //Start the game loop 
  app.ticker.add(delta => gameLoop(delta));

}

async function gameLoop(delta) {
  
  //Update the current game state:
  state(delta);

  loopML();

  playerSprites.forEach(function(s) {
    s.visible = false;
    s.position.x = 10;
    s.position.y = 5;
  });
  playerSprites[gameAction].visible = true;

  // bose awake
  if (npcSprites[0].currentFrame == 3) { 
    if (gameAction != 2) { // not defending
      boseScore++;
    }
  }
  
  // bose sleeping
  if (npcSprites[0].currentFrame < 3) {
    if (gameAction == 1) { // attacking
      playerScore++;
    }
  }
}

async function play(delta) {
  if (playerScore > 100) {
    gameMessage.text = '👑 You win!';
  } else if (boseScore > 100) {
    gameMessage.text = '🧟 You lose';
  } else {
    gameMessage.text = 'Player: ' + playerScore + ' ⚔️ Boss: ' + boseScore;
  }
}

let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function initML() {
  const modelURL = "./model/model.json";
  const metadataURL = "./model/metadata.json";

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // or files from your local hard drive
  // Note: the pose library adds "tmImage" object to your window (window.tmImage)
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const flip = true; // whether to flip the webcam
  webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();

  // append elements to the DOM
  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) { // and class labels
      labelContainer.appendChild(document.createElement("div"));
  }
}

async function loopML() {
  webcam.update(); // update the webcam frame
  await predict();
}

// run the webcam image through the image model
async function predict() {
  // predict can take in an image, video or canvas html element
  const prediction = await model.predict(webcam.canvas);
  gameAction = 0;
  for (let i = 0; i < maxPredictions; i++) {
    //const classPrediction =
    //  prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    //labelContainer.childNodes[i].innerHTML = classPrediction;

    if (prediction[i].className == 'Fist') {
      if (prediction[i].probability > 0.5) {
        //console.log("Pow!")
        gameAction = 1;
      } 
    } else if (prediction[i].className == 'Hand') {
      if (prediction[i].probability > 0.8) {
        //console.log("Stop!")
        gameAction = 2;
      }
    }
  }
}
