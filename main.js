// Generated by CoffeeScript 1.9.3
(function() {
  var Block, Display, Keys, Level, Player, Texture, TextureList, Util, Vector, before, d, elapsed, fps, fpsInterval, gameinit, gameloop, lvl, meter, nowTime, pl, startTime;

  Vector = (function() {
    function Vector(x2, y2) {
      this.x = x2;
      this.y = y2;
    }

    Vector.prototype.add = function(Vec2) {
      this.x = Vec2.x + this.x;
      return this.y = Vec2.y + this.y;
    };

    Vector.prototype.subtract = function(Vec2) {
      this.x = Vec2.x - this.x;
      return this.y = Vec2.y - this.y;
    };

    Vector.prototype.multiply = function(Vec2) {
      this.x = Vec2.x * this.x;
      return this.y = Vec2.y * this.y;
    };

    Vector.prototype.set = function(x, y) {
      this.x = x;
      return this.y = y;
    };

    return Vector;

  })();

  Display = (function() {
    var canvas, context;

    canvas = null;

    context = null;

    function Display(size, s) {
      var canvasSize;
      this.size = size;
      this.s = s;
      this.canvas = document.createElement("canvas");
      canvasSize = this.size;
      canvasSize.multiply(this.s);
      this.canvas.width = canvasSize.x;
      this.canvas.height = canvasSize.y;
      this.context = this.canvas.getContext("2d");
      document.getElementsByTagName("body")[0].appendChild(this.canvas);
      this.context.imageSmoothingEnabled = false;
      this.context.webkitImageSmoothingEnabled = false;
      this.context.scale(2, 2);
    }

    Display.prototype.rgbToHex = function(r, g, b) {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    Display.prototype.clear = function(r, g, b) {
      this.context.fillStyle = this.rgbToHex(r, g, b);
      return this.context.fillRect(0, 0, 320, 240);
    };

    Display.prototype.blit = function(img, x, y, rot, sc, xOffset, yOffset) {
      if (rot === 0) {
        this.context.save();
        this.context.translate(img.width / xOffset + x, img.height / yOffset + y);
        this.context.scale(sc, sc);
        this.context.translate(-img.width / xOffset - x, -img.height / yOffset - y);
        this.context.drawImage(img, x, y);
        return this.context.restore();
      } else {
        this.context.save();
        this.context.translate(img.width / 2 + x, img.height / 2 + y);
        this.context.rotate(rot);
        this.context.scale(sc, sc);
        this.context.translate(-img.width / 2 - x, -img.height / 2 - y);
        this.context.drawImage(img, x, y);
        return this.context.restore();
      }
    };

    return Display;

  })();

  Texture = (function() {
    var loaded, name, obj;

    name = null;

    obj = null;

    loaded = false;

    function Texture(name, imgObj) {
      this.name = name;
      this.obj = imgObj;
    }

    Texture.prototype.hasLoaded = function() {
      return loaded = true;
    };

    return Texture;

  })();

  TextureList = (function() {
    var textures;

    textures = new Array();

    function TextureList() {}

    TextureList.prototype.add = function(name, path) {
      var tempImg, tempTex;
      tempImg = new Image();
      tempImg.src = path;
      tempTex = new Texture(name, tempImg);
      tempImg.onload = function() {
        return tempTex.hasLoaded();
      };
      return textures.push(tempTex);
    };

    TextureList.prototype.get = function(name) {
      var j, num, ref;
      for (num = j = 0, ref = textures.length; 0 <= ref ? j <= ref : j >= ref; num = 0 <= ref ? ++j : --j) {
        if (textures[num].name === name) {
          return textures[num].obj;
        }
      }
    };

    return TextureList;

  })();

  Keys = (function() {
    var leftKey, rightKey;

    leftKey = false;

    rightKey = false;

    function Keys() {
      var self;
      leftKey = false;
      rightKey = false;
      self = this;
      window.onkeydown = function(k) {
        if (k.keyCode === 37) {
          self.leftKey = true;
        }
        if (k.keyCode === 39) {
          return self.rightKey = true;
        }
      };
      window.onkeyup = function(k) {
        if (k.keyCode === 37) {
          self.leftKey = false;
        }
        if (k.keyCode === 39) {
          return self.rightKey = false;
        }
      };
    }

    return Keys;

  })();

  Util = (function() {
    function Util() {}

    Util.ease = function(current, start, change, total) {
      return change * (Math.pow(current / total - 1, 3) + 1) + start;
    };

    Util.lerp = function(a, b, t) {
      return a + t * (b - a);
    };

    Util.degtorad = function(d) {
      return d * (Math.PI / 180);
    };

    return Util;

  })();

  Player = (function() {
    var fuel, fuelModifier, newPos, newPos2, newPos3, posXTimer, posYTimer, position, rotation, rotationItter, textures;

    textures = new TextureList();

    position = new Vector(0, 0);

    rotation = 0;

    rotationItter = 0;

    posXTimer = 0;

    posYTimer = 0;

    newPos = 0;

    newPos2 = 0;

    newPos3 = 0;

    fuel = 100;

    fuelModifier = .05;

    function Player() {
      this.rotation = 0;
      this.keys = new Keys();
      this.textures = new TextureList();
      this.position = new Vector(0, 0);
      this.textures.add("normal", "sprites/drill.png");
      this.position.set(160 / 2 - 8, 16);
      this.posXTimer = 0;
      this.posYTimer = 0;
      this.newPos = 0;
      this.newPos2 = 0;
      this.newPos3 = 0;
      this.fuel = 100;
      this.fuelModifier = .05;
    }

    Player.prototype.update = function() {
      this.fuel -= this.fuelModifier;
      this.position.x += (this.newPos - this.position.x) / 10;
      if (this.keys.leftKey === true) {
        this.posXTimer++;
        if (this.posXTimer > 5) {
          this.newPos = this.position.x - 10;
          this.newPos = this.newPos - this.newPos % 16;
          return this.posXTimer = 0;
        }
      } else if (this.keys.rightKey === true) {
        this.posXTimer++;
        if (this.posXTimer > 5) {
          this.newPos = this.position.x + 25;
          this.newPos = this.newPos - this.newPos % 16;
          return this.posXTimer = 0;
        }
      }
    };

    Player.prototype.draw = function(display) {
      return display.blit(this.textures.get("normal"), this.position.x, this.position.y, 0, this.fuel / 100, 1, 1);
    };

    return Player;

  })();

  Block = (function() {
    var hit, scale, x, y;

    x = 0;

    y = 0;

    hit = false;

    scale = 1;

    function Block(type) {
      this.type = type;
      this.hit = false;
      this.x = 0;
      this.y = 0;
      this.scale = 1;
    }

    return Block;

  })();

  Level = (function() {
    var blocks, curentLevelY, genTimer, levelOffsetY, textures;

    blocks = new Array();

    curentLevelY = 2;

    textures = new TextureList();

    levelOffsetY = 64;

    genTimer = 0;

    function Level() {
      this.blocks = new Array();
      this.textures = new TextureList();
      this.textures.add("dirt", "sprites/dirt.png");
      this.currentLevelY = 2;
      this.levelOffsetY = 0;
      this.genTimer = 0;
      this.addRow();
      this.addRow();
      this.addRow();
      this.addRow();
      this.addRow();
      this.addRow();
      this.addRow();
      this.addRow();
      this.addRow();
      this.addRow();
    }

    Level.prototype.addRow = function(typeOf) {
      var b, i, j;
      for (i = j = 0; j <= 9; i = ++j) {
        b = new Block("grass");
        b.y = this.currentLevelY * 16;
        b.x = i * 16;
        this.blocks.push(b);
      }
      return this.currentLevelY++;
    };

    Level.prototype.checkCollision = function(player) {
      var block, j, ref, results, x1, y1;
      results = [];
      for (block = j = 0, ref = this.blocks.length - 1; 0 <= ref ? j <= ref : j >= ref; block = 0 <= ref ? ++j : --j) {
        if (typeof this.blocks[block] === "undefined") {

        } else {
          if (this.blocks[block].hit === true) {
            this.blocks[block].x += (-32 - this.blocks[block].x) / 20;
            this.blocks[block].y += (-32 - this.blocks[block].y) / 20;
            this.blocks[block].scale += (0 - this.blocks[block].scale) / 20;
            if (Math.floor(this.blocks[block].y) <= -32) {
              results.push(this.blocks.splice(block, 1));
            } else {
              results.push(void 0);
            }
          } else {
            x1 = this.blocks[block].x;
            y1 = this.blocks[block].y + this.levelOffsetY;
            if (player.position.x + 16 > x1 && player.position.x < x1 + 16 && player.position.y + 16 > y1 && player.position.y < y1 + 16) {
              results.push(this.blocks[block].hit = true);
            } else {
              if (y1 <= 0) {
                results.push(this.blocks.splice(block, 1));
              } else {
                results.push(void 0);
              }
            }
          }
        }
      }
      return results;
    };

    Level.prototype.generate = function() {
      this.genTimer++;
      if (this.genTimer > 35) {
        this.addRow();
        return this.genTimer = 0;
      }
    };

    Level.prototype.update = function() {
      if (this.blocks.length > 5) {
        this.newPosY = this.levelOffsetY - 18;
        this.newPosY = this.newPosY - this.newPosY % 16;
        return this.levelOffsetY += (this.newPosY - this.levelOffsetY) / 20;
      }
    };

    Level.prototype.render = function(d) {
      var a, j, ref, results;
      results = [];
      for (a = j = 0, ref = this.blocks.length - 1; 0 <= ref ? j <= ref : j >= ref; a = 0 <= ref ? ++j : --j) {
        if (typeof this.blocks[a] !== "undefined") {
          if (this.blocks[a].hit !== true) {
            results.push(d.blit(this.textures.get("dirt"), this.blocks[a].x, this.blocks[a].y + this.levelOffsetY, 0, this.blocks[a].scale));
          } else {
            results.push(d.blit(this.textures.get("dirt"), this.blocks[a].x, this.blocks[a].y, 0, this.blocks[a].scale));
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    return Level;

  })();

  d = new Display(new Vector(160, 240), new Vector(2, 2));

  meter = new FPSMeter();

  pl = null;

  lvl = new Level();

  fps = 60;

  fpsInterval = 1000 / 60;

  startTime = 0;

  nowTime = 0;

  elapsed = 0;

  before = Date.now();

  window.onload = function() {
    gameinit();
    return requestAnimationFrame(gameloop);
  };

  gameinit = function() {
    return pl = new Player();
  };

  gameloop = function() {
    d.clear(0, 0, 0);
    pl.update();
    pl.draw(d);
    lvl.generate();
    lvl.update();
    lvl.render(d);
    lvl.checkCollision(pl);
    return requestAnimationFrame(gameloop);
  };

}).call(this);
