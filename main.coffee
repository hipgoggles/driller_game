class Vector
	constructor: (@x,@y) ->
		
	add: (Vec2) ->
		@x = Vec2.x+@x
		@y = Vec2.y+@y
	subtract: (Vec2) ->
		@x = Vec2.x-@x
		@y = Vec2.y-@y
	multiply: (Vec2) ->
		@x = Vec2.x*@x
		@y = Vec2.y*@y
	set: (x,y) ->
		@x = x
		@y = y
class Display
	canvas = null
	context = null
	# size assumes vector argument
	constructor: (@size,@s) ->
		@canvas = document.createElement("canvas")
		canvasSize = @size
		canvasSize.multiply(@s)
		@canvas.width = canvasSize.x
		@canvas.height = canvasSize.y
		@context = @canvas.getContext("2d")
		document.getElementsByTagName("body")[0].appendChild(@canvas)
		@context.imageSmoothingEnabled=false
		@context.webkitImageSmoothingEnabled=false
		@context.scale(4,4)
	rgbToHex: (r,g,b) ->
		return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
	clear: (r,g,b) ->
		@context.fillStyle = @rgbToHex(r,g,b)
		@context.fillRect(0,0,320,240)
	blit: (img,x,y,rot,sc,xOffset,yOffset) ->
		if rot == 0
			@context.save()
			@context.translate(img.width/xOffset+x,img.height/yOffset+y)
			@context.scale(sc,sc)
			@context.translate(-img.width/xOffset-x,-img.height/yOffset-y)
			@context.drawImage(img,x,y)
			@context.restore()
		else
			@context.save()
			@context.translate(img.width/2+x,img.height/2+y)
			@context.rotate(rot)
			@context.scale(sc,sc)
			@context.translate(-img.width/2-x,-img.height/2-y)
			@context.drawImage(img,x,y)
			@context.restore()
	blitText: (string,x,y,r,g,b) ->
		@context.font = "8px EarlyGameBoy"
		@context.fillStyle=@rgbToHex(r,g,b)
		@context.textBaseline = 'top'
		@context.fillText(string,x,y)
class Texture
	name = null
	obj = null
	loaded = false
	constructor: (name,imgObj) ->
		@name = name
		@obj = imgObj
	hasLoaded: () ->
		loaded = true
class TextureList
	textures = new Array()
	constructor: () ->
		# pass
		# @textures = new Array()
	add: (name,path) ->
		tempImg = new Image()
		tempImg.src = path
		tempTex = new Texture(name,tempImg)
		tempImg.onload = () ->
			tempTex.hasLoaded()
		textures.push(tempTex)
	get: (name) ->
		#index = (num for num in [0..textures.length-1])
		for num in [0..textures.length]
			if textures[num].name == name
				# console.log(textures[index])
				return textures[num].obj
class Keys
	constructor: () ->
		leftKey = false
		rightKey = false
		self = this
		window.onkeydown =  (k) ->
			if k.keyCode==37
				self.leftKey=true
			if k.keyCode==39
				self.rightKey=true
		window.onkeyup = (k) ->
			if k.keyCode==37
				self.leftKey=false
			if k.keyCode==39
				self.rightKey=false
class Util
	constructor: () ->
		#pass
	@ease: (current,start,change,total) ->
		return change * (Math.pow(current / total - 1, 3) + 1 ) + start
	@lerp: (a,b,t) ->
		return a + t * (b - a)
	@degtorad: (d) ->
		return d * (Math.PI/180)
	@randomrange: (a,b) ->
		return Math.floor((Math.random()*b)+a)
class Player

	constructor: () ->
		#init player
		@rotation = 0
		@keys = new Keys()
		@textures = new TextureList()
		@position = new Vector(0,0)
		@textures.add("normal","sprites/drill.png")
		@position.set(160/2-8,32)
		@posXTimer = 0
		@posYTimer = 0
		@newPos = 160/2-8
		@newPos2 = 0
		@newPos3 = 0
		@fuel = 100
		@fuelModifier = .05
	update: () ->
		@fuel-=@fuelModifier
		@position.x+=(@newPos-@position.x)/2
		if @keys.leftKey==true
			#console.log("left")
			@posXTimer++
			#newPos = 0
			if @posXTimer >  5
				##@position.x-=16
				@newPos = @position.x-10
				@newPos  = @newPos-@newPos%16
				#@position.x+=(newPos-@position.x)/5
				@posXTimer = 0
			#console.log(@newPos)
			#@position.x+=(newPos-@position.x)/20
			
		else if @keys.rightKey==true
			#console.log("right")
			
			@posXTimer++
			if @posXTimer > 5
				#@position.x+=16
				#@position.x = @position.x-@position.x%16
				@newPos = @position.x+25
				@newPos = @newPos-@newPos%16
				@posXTimer=0
		#	@position.x = Math.round(@position.x/16)*16
	draw: (display) ->
		#draw player
		#console.log(@fuel/100)
		display.blit(@textures.get("normal"),@position.x,@position.y,0,1,1,1)
class Block
	constructor: (@type) ->
		@hit = false
		@x = 0
		@y = 0
		@scale = 1
		@state = "displayed"
		@animationFrame = 0
class Level
	blocks = new Array()
	curentLevelY = 2
	textures = new TextureList()
	levelOffsetY = 64
	genTimer = 0
	constructor: () ->
		@blocks = new Array()
		@textures = new TextureList()
		@textures.add("dirt","sprites/dirt.png")
		@textures.add("dirt_fade0","sprites/dirt_fade0.png")
		@textures.add("dirt_fade1","sprites/dirt_fade1.png")
		@textures.add("dirt_fade2","sprites/dirt_fade2.png")
		@currentLevelY = 2
		@levelOffsetY = 0
		@genTimer = 0
		@spaceBetweenRows=2
		for a in [0..15]
			@addRow()
	addRow: (typeOf) ->
		for i in [0..9]
			type = Util.randomrange(1,10)
			console.log(type)
			if type ==  2 or  type == 4 or type == 6
				b = new Block("grass")
			#	b = @blocks.push(new Block("grass"))
				b.y = (@currentLevelY*16)*@spaceBetweenRows
				b.x = i*16
				@blocks.push(b)
		@currentLevelY++
	checkCollision: (player) ->
		for block in [0..@blocks.length-1]
			if typeof @blocks[block]  == "undefined"
			else
				if @blocks[block].hit == true
					@blocks[block].state = "fadeout"
					@blocks[block].animationFrame+=.3
					if @blocks[block].animationFrame>=2
						@blocks[block].animationFrame=2
						@blocks.splice(block,1)
						console.log("spliced")
					
				else
					x1 = @blocks[block].x
					y1 = @blocks[block].y+@levelOffsetY
					if (player.position.x)+14 > x1 && 2+player.position.x <  x1+16 && player.position.y+16 > y1 && player.position.y+2 < y1+16
						#console.log("collision")
						@blocks[block].hit=true
						#@blocks.splice(block,1)
					else
						
						if y1 <= 8
							@blocks[block].hit=true
	generate: () ->
		#console.log(@genTimer)
		@genTimer++
		#console.log(@genTimer)
		if @genTimer > 35
			@addRow()
			@genTimer = 0
	update: () ->
		if @blocks.length>5 
			@newPosY = @levelOffsetY-18
			@newPosY = @newPosY-@newPosY%16
			@levelOffsetY+=(@newPosY - @levelOffsetY)/20
	render: (d) ->
		for a in [0..@blocks.length-1]
		#	console.log(@blocks[a].x)
			if typeof @blocks[a] != "undefined"
				if @blocks[a].hit != true
					d.blit(@textures.get("dirt"),@blocks[a].x,@blocks[a].y+@levelOffsetY,0,@blocks[a].scale)
				else
					if @blocks[a].state = "fadeout"
						d.blit(@textures.get("dirt_fade"+Math.floor(@blocks[a].animationFrame)),@blocks[a].x,@blocks[a].y+@levelOffsetY,0,@blocks[a].scale)

class Hud
	constructor: () ->
		@textures = new TextureList()
		@textures.add("hud","sprites/hud.png")
	render: (d,pl) ->
		d.blit(@textures.get("hud"),0,1,0,1)
		if pl.fuel > 70
			d.blitText("fuel >70C",5,5,0,null)
		else if pl.fuel > 40
			d.blitText("fuel >40C",5,5,0,null)
		else if pl.fuel > 30
			d.blitText("fuel >30C",5,5,0,null)
		else if pl.fuel > 10
			d.blitText("fuel >10C", 5,5,0,null)
		else if pl.fuel > 5
			d.blitText("fuel >5C",5,5,0,null)
		else
			d.blitText("no fuel",5,5,0,null)
d = new Display(new Vector(160,120),new Vector(4,4))
pl = null
lvl = new Level()
fps = 60
fpsInterval = 1000/60
startTime = 0
nowTime = 0
elapsed = 0
before = Date.now()
hd = null
window.onload = () ->
	gameinit()
	requestAnimationFrame(gameloop)
	
gameinit = () ->
	#textures.add("player","sprites/drill.png")
	pl = new Player()
	hd = new Hud()
gameloop = () ->
	#draw and update
	d.clear(0,0,0)
	pl.update()
	pl.draw(d)
	lvl.generate()
	lvl.update()
	lvl.render(d)
	lvl.checkCollision(pl)
	hd.render(d,pl)
	requestAnimationFrame(gameloop)
