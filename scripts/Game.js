function Game(descr){
	for (var property in descr) {
	this[property] = descr[property];
}
}

var g_game = new Game({
    score: 0,
    state: 0,
    numbOfEnemies: 1,
    gridChoice: "A"
});


Game.protoype.reset = function()
{
	this.score=0;
	this.state=0;
	this.numbOfEnemies=1;
	this.gridChoice="A";
}