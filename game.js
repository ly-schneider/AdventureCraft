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

// Number padding utility
const zeroPad = (num, places) => String(num).padStart(places, '0');

// Load animated sprite
function loadSprite(prefix, count, start=0, size=32, fmt='.png') {
  let textureArray = [];
  for (let i = start; i < count + start; i++) {
    let texture = PIXI.Texture.from(prefix + zeroPad(i, 2) + fmt);
    textureArray.push(texture);
  };
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
function setup() {

  let jesterWalk = loadSprite("jester/sprite_", 2, 6);
  app.stage.addChild(jesterWalk)
  jesterWalk.play();

  let jesterLight = loadSprite("jester/sprite_", 2, 4);
  jesterLight.x = 40;
  app.stage.addChild(jesterLight)
  jesterLight.play();

  let jesterDefend = loadSprite("jester/sprite_", 2, 9);
  jesterDefend.x = 80;
  app.stage.addChild(jesterDefend)
  jesterDefend.play();

}
