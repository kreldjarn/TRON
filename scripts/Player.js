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
    console.log(descr);
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

Player.prototype.KEY_UP = 'W'.charCodeAt(0);
Player.prototype.KEY_DN = 'S'.charCodeAt(0);
Player.prototype.KEY_LT = 'A'.charCodeAt(0);
Player.prototype.KEY_RT = 'D'.charCodeAt(0);

Player.prototype.KEY_TURBO   = ' '.charCodeAt(0);

// Initial, inheritable, default values
Player.prototype.cx = 0;
Player.prototype.cy = 0;
Player.prototype.velX = 1;
Player.prototype.velY = 0;

    
Player.prototype.update = function(du)
{
    spatialManager.unregister(this);

    this.handleInputs();

    // We only move the actual entity once every reset_timestep
    this.timestep -= du;
    if (this.timestep <= 0)
    {
        this.cx += this.velX;
        this.cy += this.velY;
        this.timestep = this.reset_timestep;
    }

    // TODO: HANDLE COLLISIONS

    spatialManager.register(this, this.cx, this.cy);
    if (this._isDeadNow) return entityManager.KILL_ME_NOW;
};

Player.prototype.handleInputs = function()
{
    if (keys.getState(this.KEY_UP))
    {
        this.velX = 0;
        this.velY = -1;
    }
    else if (keys.getState(this.KEY_DN))
    {
        this.velX = 0;
        this.velY = 1;
    }
    else if (keys.getState(this.KEY_LT))
    {
        this.velX = -1;
        this.velY = 0;
    }
    else if (keys.getState(this.KEY_RT))
    {
        this.velX = 1;
        this.velY = 0;
    }
};


Player.prototype.getRadius = function ()
{
    return 1;
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
    var pos = spatialManager.getWorldCoordinates(this.cx, this.cy);
    //console.log(pos);
    ctx.save();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    util.strokeCircle (
	   ctx, pos.x, pos.y, 10
    );
    ctx.restore();
};
