function startScreen(descr){
	for (var property in descr) {
	this[property] = descr[property];
}
}

var g_startScreen = new startScreen({
	animationInterval: 100,
	n: 0,
	animationSequence:0,
	opacityLincreasing: true,
	opacityRincreasing:true,
	opacityTRONincreasing:true,
	opacityL:0.6,
	opacityR:0.6,
	opacityTRON:0.6,
	changeValueL: 0.0015,
	changeValueR: 0.002,
	changeValueTRON: 0.001
	
});

var g_staticSound1 = new Audio("https://notendur.hi.is/tap4/tronImages/static1.wav");
var g_staticSound2 = new Audio("https://notendur.hi.is/tap4/tronImages/static2.wav");
var g_staticSound3 = new Audio("https://notendur.hi.is/tap4/tronImages/static3.wav");
var g_playSound = true;

startScreen.prototype.render = function(ctx)
{
	g_sprites.grid.drawAt(ctx,GRID_OFFSET_X,GRID_OFFSET_Y);
	if (this.animationSequence<0.7)
	{
		ctx.globalAlpha=this.opacityTRON;
	g_sprites.titleReg.drawAt(ctx,50+GRID_OFFSET_X,50+GRID_OFFSET_Y);
	}
	if (this.animationSequence>=0.7 && this.animationSequence<0.75)
	{
		if (g_playSound===true)
		{
		g_staticSound1.play();
		g_playSound = false;
		}
		ctx.globalAlpha=this.opacityTRON;
		g_sprites.titleNoInnerO.drawAt(ctx,50+GRID_OFFSET_X,50+GRID_OFFSET_Y);
	}
	if (this.animationSequence>=0.75 && this.animationSequence<0.80)
	{
		if (g_playSound===true)
		{
		g_staticSound3.play();
		g_playSound = false;
		}
		ctx.globalAlpha=this.opacityTRON;
		g_sprites.titleNoOuterO.drawAt(ctx,50+GRID_OFFSET_X,50+GRID_OFFSET_Y);
	}
	if (this.animationSequence>=0.8 && this.animationSequence<0.9)
	{
		if (g_playSound === true)
		{
		g_staticSound3.play();
		g_playSound = false;
		}
		g_sprites.titleN.drawAt(ctx,50+GRID_OFFSET_X,50+GRID_OFFSET_Y);
	}
	if(this.animationSequence>=0.9)
	{
		if (g_playSound === true)
		{
		g_staticSound2.play();
		g_playSound = false;
		}
		ctx.globalAlpha=this.opacityTRON;
		g_sprites.titleNoT.drawAt(ctx,50+GRID_OFFSET_X,50+GRID_OFFSET_Y);
	}
	ctx.globalAlpha =this.opacityL;
	ctx.fillStyle="cyan";
	util.roundedRect(ctx,50+GRID_OFFSET_X,200+GRID_OFFSET_Y,225,150,35);
	ctx.stroke();
	ctx.globalAlpha=this.opacityR;
	util.roundedRect(ctx,325+GRID_OFFSET_X,200+GRID_OFFSET_Y,225,150,35);
	ctx.stroke();
	util.roundedRect(ctx,50+GRID_OFFSET_X,400+GRID_OFFSET_Y,500,40,20);
	ctx.stroke();
	ctx.fillStyle="white";
	util.roundedRect(ctx,50+GRID_OFFSET_X,350+GRID_OFFSET_Y,225,25,10);
	util.roundedRect(ctx,325+GRID_OFFSET_X,350+GRID_OFFSET_Y,225,25,10);
	ctx.stroke();
	ctx.globalAlpha=1;
	ctx.fillStyle="black";
	ctx.font="50px Andale Mono";
	ctx.fillStyle = "white";
	ctx.fillText ("GRID", 100+GRID_OFFSET_X,250+GRID_OFFSET_Y);
	ctx.fillText("ENEMIES",340+GRID_OFFSET_X,250+GRID_OFFSET_Y);
	ctx.stroke();
	ctx.font="35px Andale Mono";
	//ctx.fillStyle = "black";
	ctx.fillText ("Press Z to Begin",125+GRID_OFFSET_X,433+GRID_OFFSET_Y);
	ctx.stroke();
	ctx.font= "100px Andale Mono";
	ctx.fillText(g_game.gridChoice,130+GRID_OFFSET_X,335+GRID_OFFSET_Y);
	ctx.fillText(g_game.numbOfEnemies,400+GRID_OFFSET_X,335+GRID_OFFSET_Y);
	ctx.font="20px Andale Mono";
	ctx.fillStyle="black";
	ctx.fillText("Press G to change",65+GRID_OFFSET_X, 372+GRID_OFFSET_Y);
	ctx.fillText("Press E to change",340+GRID_OFFSET_X, 372+GRID_OFFSET_Y);


}

startScreen.prototype.update = function(du)
{
	if (keys.eatKey(KEY_CHOOSEGRID))
	{
		if (g_game.gridChoice ==="A") {g_game.gridChoice = "B"; return;}
		if (g_game.gridChoice ==="B") {g_game.gridChoice = "C"; return;}
		if (g_game.gridChoice ==="C") {g_game.gridChoice = "A"; return;}
	}
	if (keys.eatKey(KEY_ENEMYNUMBER))
	{
		g_game.numbOfEnemies = g_game.numbOfEnemies+1;
		if (g_game.numbOfEnemies>3) {g_game.numbOfEnemies=1;}
	}
	if (keys.eatKey(KEY_STARTGAME)) {g_gameState = "playing";}
	if (this.n < this.animationInterval)  {this.n=this.n+1;}
	else
	{
		this.n=0;
		this.animationInterval = Math.random()*50;
		this.animationSequence=Math.random();
		if (this.animationSequence<0.7)
		{
			this.animationInterval = this.animationInterval + 50;
		}
		g_playSound = true;


	}
	
		if (this.opacityL>0.95 && this.opacityLincreasing===true) 
			{
				this.opacityLincreasing = false;
				this.changeValueL = this.changeValueL*-1;
			}
		this.opacityL = this.opacityL+this.changeValueL;


		if (this.opacityL<0.3 && this.opacityLincreasing === false)
			{
				this.opacityLincreasing=true;
				this.changeValueL = this.changeValueL*-1;
			}

		if (this.opacityR>0.85 && this.opacityLincreasing===true) 
			{
				this.opacityRincreasing = false;
				this.changeValueR = this.changeValueR*-1;
			}
		this.opacityR = this.opacityR+this.changeValueR;


		if (this.opacityR<0.3 && this.opacityRincreasing === false)
			{
				this.opacityRincreasing=true;
				this.changeValueR = this.changeValueR*-1;
			}

		if (this.opacityTRON>0.9 && this.opacityTRONincreasing===true) 
			{
				this.opacityTRONincreasing = false;
				this.changeValueTRON = this.changeValueTRON*-1;
			}
		this.opacityTRON = this.opacityTRON+this.changeValueTRON;


		if (this.opacityTRON<0.2 && this.opacityTRONincreasing === false)
			{
				this.opacityTRONincreasing=true;
				this.changeValueTRON = this.changeValueTRON*-1;
			}
}
