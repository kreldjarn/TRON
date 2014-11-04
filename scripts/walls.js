// ==========
// Wall STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// A generic contructor which accepts an arbitrary descriptor object
function Wall(descr) {
    console.log(descr);
    // Common inherited setup logic from Entity
    this.setup(descr);

};

var g_prevCX = 0;
var g_prevCY = 0;

Wall.prototype = new Entity();
//Wall.prototype.lastWallCx = 0;
//Wall.prototype.lastWallCy = 0;
Wall.prototype.cx = 0;
Wall.prototype.cy = 0;
Wall.prototype.color = '';


Wall.prototype.getPos = function()
{
    return {x: this.cx, y: this.cy};
};

Wall.prototype.getLatestWallEntity = function()
{
	console.log(entityManager._walls.length-1);
	console.log(entityManager._walls[entityManager._walls.length-1]);
	return entityManager._walls[entityManager._walls.length-1];
};

Wall.prototype.getOldestWallEntity = function()
{
	return entityManager._walls[0];
};

Wall.prototype.getWallLength = function()
{
	return entityManager._walls.length;
};

Wall.prototype.render = function(ctx)
{
	console.log("is running");
	if (entityManager._walls.length === 0) return;
	if (entityManager._walls.length === 1)
	{
		g_prevCX = this.cx;
		g_prevCY = this.cy;
		return;
	}
	util.drawLine(ctx, g_prevCX, g_prevCY, this.cx, this.cy, this.color);
	g_prevCX = this.cx;
	g_prevCY = this.cy;

};