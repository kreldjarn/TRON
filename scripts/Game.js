function Game(descr){
	for (var property in descr) {
	this[property] = descr[property];
}
}

var g_game = new Game({
    score: 0,
    state: "pregame",
    numbOfEnemies: 1
});


Game.protoype.reset = function()
{
	this.score=0;
	this.state="pregame";
	this.numbOfEnemies=1;
}