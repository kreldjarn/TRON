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

    spatialManager.getVertex(this.cx, this.cy).isWally = true;
};

Player.prototype = new Entity();

Player.prototype.rememberResets = function () {
    // Remember my reset positions
    this.reset_cx = this.cx;
    this.reset_cy = this.cy;
    this.reset_velX = this.velX;
    this.reset_velY = this.velY;
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

Player.prototype.wallVertices = [];
Player.prototype.maxWallLength = 5+39;

Player.prototype.anxiousness = 0;

Player.prototype.introCount = 0;

Player.prototype.introUpdate = function(du) 
{
    this.timestep = 0;
    //if (this.AI) this.timestep -=du;
    if (this.timestep <= 0) 
    {
        spatialManager.unregister(this, this.cx, this.cy);

        var last_cx = this.cx;
        var last_cy = this.cy;

        this.cx += this.velX;
        this.cy += this.velY;

        if (this.wallVertices.length === 0)this.refreshWall(last_cx, last_cy);
        this.refreshWall(this.cx, this.cy);

         if (this.isColliding(this.cx + this.velX, this.cy + this.velY)) 
        {
            //Are we at NE corner?
            if (this.velX == 1 && this.velY == 0) 
            { 
                this.velX = 0;
                this.velY = 1;
            }
            //Are we at SW corner?
            else if (this.velX == -1 && this.velY == 0)
            {
                this.velX = 0;
                this.velY = -1;
            }
            //Are we at NW corner?
            else if(this.velX == 0 &&  this.velY == -1) 
            {
                this.velX = 1;
                this.velY = 0;
            }
            //Are we at SW corner?
            else if(this.velX == 0 && this.velY == 1)
            {
                this.velX = -1;
                this.velY = 0;
            }
        }

        this.requestedVelX = this.velX;
        this.requestedVelY = this.velY;
        this.timestep = this.reset_timestep;
        spatialManager.register(this, this.cx, this.cy);
        this.introCount++;
        //console.log(this.introCount);
    }
}
    
Player.prototype.update = function(du)
{

    if(this.introCount < (VERTICES_PER_ROW)*2 - 3) {
        this.introUpdate(du);
        return;
    }
    this.handleInputs();
    this.timestep -= du;

    // We only move the actual entity once every reset_timestep
    if (this.timestep <= 0)
    {
        spatialManager.unregister(this, this.cx, this.cy);
        var last_cx = this.cx;
        var last_cy = this.cy;

        this.cx += this.velX;
        this.cy += this.velY;
        if (this.wallVertices.length === 0) this.refreshWall(last_cx, last_cy);
        this.refreshWall(this.cx, this.cy);
        this.velX = this.requestedVelX;
        this.velY = this.requestedVelY;
        this.timestep = this.reset_timestep;
        //this.refreshWall(last_cx, last_cy);

        if (this.isColliding(this.cx + this.velX, this.cy + this.velY)) 
        {
            this.reset();
            spatialManager.reset();
            return;
        }
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

    // Disallow turning on the spot
    if ((this.velX && this.requestedVelX === -this.velX) ||
        (this.velY && this.requestedVelY === -this.velY))
    {
        this.requestedVelX = this.velX;
        this.requestedVelY = this.velY;
    }
};

Player.prototype.refreshWall = function(x, y)
{
    this.wallVertices.push({cx: x, cy: y});
    spatialManager.register(this,
                            this.wallVertices[0].cx,
                            this.wallVertices[0].cy);
    //spatialManager.addRift(x, y);
    if (this.wallVertices.length > this.maxWallLength)
    {
        spatialManager.unregister(this,
                                  this.wallVertices[0].cx,
                                  this.wallVertices[0].cy);
        spatialManager._vertices[x][y].isWally = false;
        //spatialManager.removeRift(this.wallVertices[0].cx, this.wallVertices[0].cy);
        this.wallVertices.splice(0, 1);
    }
};

Player.prototype.isColliding = function(nextX, nextY)
{
    var vertex = spatialManager.getVertex(nextX, nextY);
    if (!vertex || vertex.isWally) {
        return true;
    }
    return false;
};


Player.prototype.getRadius = function ()
{
    return 8;
};

Player.prototype.getPos = function()
{
    return {x: this.cx, y: this.cy};
};

Player.prototype.getVel = function()
{
    return {x: this.velX, y: this.velY};
}

Player.prototype.reset = function()
{
    spatialManager.unregister(this, this.cx, this.cy);
    
    this.wallVertices = [];

    this.cx = this.reset_cx;
    this.cy = this.reset_cy;
    this.velX = this.reset_velX;
    this.velY = this.reset_velY;
    this.requestedVelX = this.velX;
    this.requestedVelY = this.velY;
    this.timestep = this.reset_timestep;

    // Prevent the fresh-born player to inherit its ancestor's velocities
    // by clearing the state in keys
    for (var key in this.keys)
        keys.clearKey(this.keys[key]);

    spatialManager.register(this, this.cx, this.cy);
};

Player.prototype.render = function (ctx)
{
    var currPos = spatialManager.getVertex(this.cx, this.cy).getPos();
    var nextPos = spatialManager.getVertex(this.cx + this.velX,
                                           this.cy + this.velY).getPos();
    // The elapsed portion of the timestep
    var progress = (this.reset_timestep - this.timestep) / this.reset_timestep;

    // Draw tail
    ctx.save();
    ctx.beginPath();
    var v = this.wallVertices[0];
    // If a tail exists, we start drawing from the tip of it
    if (v)
    {
        var pos = spatialManager.getVertex(v.cx, v.cy).getPos();
        var orgX, orgY;
        // If the wall has reached its maximum length, we ease the tip of the
        // tail between vertices
        if (this.wallVertices[this.maxWallLength - 1])
        {
            var v1 = this.wallVertices[1];
            var pos1 = spatialManager.getVertex(v1.cx, v1.cy).getPos();
            orgX = pos.x + progress * (pos1.x - pos.x);
            orgY = pos.y + progress * (pos1.y - pos.y);
        }
        else
        {
            orgX = pos.x;
            orgY = pos.y;
        }
        
        ctx.moveTo(orgX, orgY);
    }
    for(var i = 1; i < this.wallVertices.length; i++)
    {
        v = this.wallVertices[i];
        pos = spatialManager.getVertex(v.cx, v.cy).getPos();
        ctx.lineTo(pos.x, pos.y);
    }
    
    var destX = currPos.x + progress * (nextPos.x - currPos.x);
    var destY = currPos.y + progress * (nextPos.y - currPos.y);
    
    // If the player doesn't have a tail yet, we draw a line from its current
    // vertex to its perceived position
    if (!v)
        ctx.moveTo(currPos.x, currPos.y);
    ctx.lineTo(destX, destY);

    
    ctx.lineCap = 'round';
    

    var pulse = this.timestep / this.reset_timestep;
    pulse = Math.sin(Math.PI * pulse);
    // Sampling to create a halo effect
    // TODO: Generalise this, and make it use the player's own colour
    ctx.strokeStyle = 'rgba(255, 150, 255, 0.2)';
    ctx.lineWidth = 10 + 2*pulse;
    ctx.stroke();

    ctx.lineWidth = 12 + 2*pulse;
    ctx.stroke();

    ctx.lineWidth = 14 + 4*pulse;
    ctx.stroke();

    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 7;
    ctx.stroke();

    ctx.restore();    
    
    // Draw the head
    /*
    var currPos = spatialManager.getVertex(this.cx, this.cy).getPos();
    
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
