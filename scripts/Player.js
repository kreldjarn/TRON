// ==========
// Player STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Player(descr) {
    // Common inherited setup logic from Entity
    this.setup(descr);

    this.rememberResets();
};

Player.prototype = new Entity();

Player.prototype.rememberResets = function () {
    // Remember my reset positions
    this.reset_cx = this.cx;
    this.reset_cy = this.cy;
    this.last_cx = this.cx - this.velX;
    this.last_cy = this.cy - this.velY;
    this.reset_timestep = this.timestep;
};

Player.prototype.keys = {
    UP: 'W'.charCodeAt(0),
    DN: 'S'.charCodeAt(0),
    LT: 'A'.charCodeAt(0),
    RT: 'D'.charCodeAt(0),
}

Player.prototype.KEY_TURBO   = ' '.charCodeAt(0);

// Initial, inheritable, default values
Player.prototype.cx = 0;
Player.prototype.cy = 0;
Player.prototype.velX = 1;
Player.prototype.velY = 0;
//At the vertex, we determine the vertex we are headed for
//and save this information to dx and dy
Player.prototype.requestedVelX = 1;
Player.prototype.requestedVelY = 0;

Player.prototype.maxWallLength = 5;
Player.prototype.wallVerticies = [];
Player.prototype.anxiousness = 0;

    
Player.prototype.update = function(du)
{
    this.handleInputs();

    //At the vertex, we determine the vertex we are headed for
    //and save this information to dx and dy

    // We only move the actual entity once every reset_timestep
    this.timestep -= du;
    if (this.timestep <= 0)
    {
        //spatialManager.unregister(this);
        spatialManager.unregister(this, this.cx, this.cy);
        var last_cx = this.cx;
        var last_cy = this.cy;
        console.log("player update:"+ this.color + " " + this.cx + " " +this.cy);
        this.cx += this.velX;
        this.cy += this.velY;
        if (this.wallVerticies.length === 0)this.refreshWall(last_cx, last_cy);
        this.refreshWall(this.cx, this.cy);
        this.velX = this.requestedVelX;
        this.velY = this.requestedVelY;
        this.timestep = this.reset_timestep;
        //this.refreshWall(last_cx, last_cy);

        // TODO: HANDLE COLLISIONS
        //spatialManager.register(this);
        spatialManager.register(this, this.cx, this.cy);
        
        if (this.AI) this.makeMove(15);
    }

    if (this._isDeadNow) return entityManager.KILL_ME_NOW;
};

Player.prototype.handleInputs = function()
{
    if (keys.getState(this.keys['UP']))
    {
        this.requestedVelX = 0;
        this.requestedVelY = -1;
    }
    else if (keys.getState(this.keys['DN']))
    {
        this.requestedVelX = 0;
        this.requestedVelY = 1;
    }
    else if (keys.getState(this.keys['LT']))
    {
        this.requestedVelX = -1;
        this.requestedVelY = 0;
    }
    else if (keys.getState(this.keys['RT']))
    {
        this.requestedVelX = 1;
        this.requestedVelY = 0;
    }
};

Player.prototype.refreshWall = function(x,y)
{
    //console.log(this.wallVerticies);
    this.wallVerticies.push({cx: x, cy: y});
    spatialManager.register(this, x, y);
    if (this.wallVerticies.length > this.maxWallLength)
    {
        spatialManager.unregister(this, this.wallVerticies[0].cx, this.wallVerticies[0].cy);
        this.wallVerticies.splice(0,1);
    }
    for (var i = 0; i < this.wallVerticies.length; i++)
    {
        console.log(this.color + " " + this.wallVerticies[i].cx +  " " + this.wallVerticies[i].cy);
    }
};

Player.prototype.isColliding = function()
{
    //TODO
};

Player.prototype.getRadius = function ()
{
    return 8;
};

Player.prototype.getPos = function()
{
    return {x: this.cx, y: this.cy};
};

Player.prototype.reset = function()
{
    spatialManager.unregister(this);
    this.cx = this.reset_cx;
    this.cy = this.reset_cy;
    this.timestep = this.reset_timestep;
    spatialManager.register(this);
};

Player.prototype.render = function (ctx)
{
    for(var i = 1; i < this.wallVerticies.length; i++)
    {
        var wx1 = spatialManager.getWorldCoordinates(this.wallVerticies[i-1].cx,
                                                    this.wallVerticies[i-1].cy).x;
        var wy1 = spatialManager.getWorldCoordinates(this.wallVerticies[i-1].cx,
                                                    this.wallVerticies[i-1].cy).y;
        var wx2 = spatialManager.getWorldCoordinates(this.wallVerticies[i].cx,
                                                    this.wallVerticies[i].cy).x;
        var wy2 = spatialManager.getWorldCoordinates(this.wallVerticies[i].cx,
                                                    this.wallVerticies[i].cy).y;
        
        util.drawLine(ctx,
            wx1, wy1, wx2, wy2,
            this.getRadius(),
            this.color);
    }
    //current vertex position
    var currPos = spatialManager.getWorldCoordinates(this.cx, this.cy);
    
    //destination vertex position
    //var revTimestep = (this.timestep - 10)*(-1);
    //var destX = this.cx + (1/revTimestep)*(this.velX);
    //var destY = this.cy + (1/revTimestep)*(this.velY);
    var progress = (this.reset_timestep - this.timestep) / this.reset_timestep;
    var destX = this.cx + (progress * this.velX);
    var destY = this.cy + (progress * this.velY);
    var destPos = spatialManager.getWorldCoordinates(destX, destY);
    //console.log(pos);
    
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(currPos.x, currPos.y);
    ctx.lineTo(destPos.x, destPos.y);
    ctx.stroke();
    ctx.restore();    

    /*
    ctx.save();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    util.strokeCircle (
       ctx, currPos.x, currPos.y, 10
    );
    ctx.restore();
    */
};

Player.prototype.makeMove = function(N)
{
    if (Math.random() < this.anxiousness)
    {
        this.makeRandomMove();
    }

    var nextX = this.cx + this.velX;
    var nextY = this.cy + this.velY;
    var vertex = spatialManager.getVertex(nextX, nextY);

    if (N && (!vertex || vertex.isWall))
    {
        this.makeRandomMove();
        this.handleInputs();
        this.velX = this.requestedVelX;
        this.velY = this.requestedVelY;
        this.makeMove(N - 1);
    }

};

Player.prototype.makeRandomMove = function()
{
    for (var key in this.keys)
        keys.clearKey(this.keys[key]);
    
    var pivot = Math.random();
    if (pivot < 0.25)
        keys.setKey(this.keys['UP']);
    else if (pivot < 0.5)
        keys.setKey(this.keys['DN']);
    else if (pivot < 0.75)
        keys.setKey(this.keys['LT']);
    else
        keys.setKey(this.keys['RT']);
};
