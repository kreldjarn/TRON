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
    this.halo = halo('255, 255, 255');

    spatialManager.register(this, this.cx, this.cy);
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
Player.prototype.maxWallLength = 5;
//Player.prototype.permWallVertices = [];

Player.prototype.anxiousness = 0;

Player.prototype.introCount = 0;

Player.prototype.score = 0;

// introUpdate is called during the intro sequence (when the player and one AI
// are circling the playing field)
Player.prototype.introUpdate = function(du) 
{
    // We want the intro to be fast, hence:
    this.timestep = 0;
    //if (this.AI) this.timestep -=du;
    if (this.timestep <= 0) 
    {
        spatialManager.unregister(this, this.cx, this.cy);

        var last_cx = this.cx;
        var last_cy = this.cy;

        this.cx += this.velX;
        this.cy += this.velY;

        if (this.wallVertices.length === 0)
            this.refreshWall(this.wallVertices, last_cx, last_cy);
        this.refreshWall(this.wallVertices, this.cx, this.cy);

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
    }
}
    
Player.prototype.update = function(du)
{
    var currPos = spatialManager.getVertex(this.cx, this.cy).getPos();
    var nextPos = spatialManager.getVertex(this.cx + this.velX,
                                           this.cy + this.velY);
    if (nextPos)
        nextPos = nextPos.getPos();
    // The elapsed portion of the timestep
    var progress = (this.reset_timestep - this.timestep) / this.reset_timestep;
    // Find the exact coordinates inbetween vertices that the player is
    // currently at
    var destX = currPos.x + progress * (nextPos.x - currPos.x);
    var destY = currPos.y + progress * (nextPos.y - currPos.y);
    this.halo.update(destX, destY);
    
    if (g_states.getState() != 'title' &&
        this.introCount < (VERTICES_PER_ROW) * 2 - 1) {
        this.introUpdate(du);
        return;
    }
    
    this.handleInputs();
    this.timestep -= du;

    // We only move the actual entity once every reset_timestep
    if (this.timestep <= 0)
    {
        this.takeStep();
    }

    if (this._isDeadNow)
    {
        LAST_SCORE = this.score;
        HAS_PLAYED = true;
        g_states.toggleState();
        return;
    }
};

Player.prototype.takeStep = function()
{
    spatialManager.unregister(this, this.cx, this.cy);
    // If there's a non-empty sequencer attached to the Player, we ignore given
    // input and instead pop the sequencer
    if (this.sequencer && !this.sequencer.isEmpty())
    {
        var state = this.sequencer.pop();
        this.requestedVelX = state.x;
        this.requestedVelY = state.y;
    }
    var last_cx = this.cx;
    var last_cy = this.cy;

    this.cx += this.velX;
    this.cy += this.velY;
    // Check whether this is colliding head-on with another player
    // and deal with it accordingly
    //if(entityManager.checkSpecialCase()) return; 

    if (this.isColliding(this.cx, this.cy)) 
    {
        var v = spatialManager.getVertex(this.cx, this.cy);
        // We generate an explosion if the player is hitting a wall, but not if
        // they are exiting the playing field
        if (v)
        {
            var pos = v.getPos();
            this.halo.explode(pos.x, pos.y);
        }
        //TODO kill the player and end the game
        if (this.maxWallLength > LOSE_PENALTY) this.maxWallLength -= LOSE_PENALTY;
        entityManager.resetPlayers();
        entityManager.incMaxWallLength();
        if (this.AI) entityManager.respawnAI(this);
        else this._isDeadNow = true;
        return;
    }

    if (this.wallVertices.length === 0)
        this.refreshWall(this.wallVertices, last_cx, last_cy);
    
    // In the vertex, we make a decision towards which vertex we will move next
    this.velX = this.requestedVelX;
    this.velY = this.requestedVelY;
    this.timestep = this.reset_timestep;

    this.refreshWall(this.wallVertices, last_cx, last_cy);
    spatialManager.register(this, this.cx, this.cy);
    
    if (this.AI) this.makeMove();

    this.score = this.score + SCORE_INC;
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

Player.prototype.refreshWall = function(vertexArray, x, y)
{
    vertexArray.push({cx: x, cy: y});
    var wallLength = vertexArray.length;
    spatialManager.register(this, x, y);
    if (vertexArray == this.wallVertices &&
        vertexArray.length > this.maxWallLength)
    {
        var freeUpVertexX = this.wallVertices[0].cx;
        var freeUpVertexY = this.wallVertices[0].cy;
        spatialManager.unregister(this,
                                  freeUpVertexX,
                                  freeUpVertexY);
        this.wallVertices.splice(0, 1);
    }
};

Player.prototype.isColliding = function(nextX, nextY)
{
    var vertex = spatialManager.getVertex(nextX, nextY);
    if (!vertex || vertex.isWall()) {
        return true;
    }
    return false;
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
    this.introCount = 0;
    if (spatialManager.getVertex(this.cx, this.cy))
        spatialManager.unregister(this, this.cx, this.cy);
    /*for(var i = 0; i < this.wallVertices.length; i++)
    {
        var wallX = this.wallVertices[i].cx;
        var wallY = this.wallVertices[i].cy;
        spatialManager.unregister(this, wallX, wallY)
    }
    */
    spatialManager.reset();
    this.wallVertices = [];
    /*
    for(var i = 0; i < this.permWallVertices.length; i++)
    {
        var wallX = this.permWallVertices[i].cx;
        var wallY = this.permWallVertices[i].cy;
        //spatialManager.getVertex(wallX, wallY).isWall = false;
    }
    this.permWallVertices = [];
    */
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
    //this.drawWalls(ctx, this.permWallVertices);
    //if (this.introCount === (VERTICES_PER_ROW)*2 - 3)
    this.drawWalls(ctx, this.wallVertices);
    if (!this.AI && !this.sequencer)
        util.writeText(ctx, this.score, this.color);
    this.halo.render(ctx);
};

Player.prototype.drawWalls = function(ctx, vertexArray) 
{
    var currPos = spatialManager.getVertex(this.cx, this.cy).getPos();
    var nextPos = spatialManager.getVertex(this.cx + this.velX,
                                           this.cy + this.velY)
    if (nextPos)
        nextPos = nextPos.getPos();
    // The elapsed portion of the timestep
    var progress = (this.reset_timestep - this.timestep) / this.reset_timestep;

    // Draw tail
    ctx.save();
    
    ctx.beginPath();
    var v = vertexArray[0];
    // If a tail exists, we start drawing from the tip of it
    if (v)
    {
        var pos = spatialManager.getVertex(v.cx, v.cy).getPos();
        var orgX, orgY;
        // If the wall has reached its maximum length, we ease the tip of the
        // tail between vertices
        if (vertexArray[this.maxWallLength - 1] &&
            vertexArray != this.permWallVertices)
        {
            var v1 = vertexArray[1];
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
    for(var i = 1; i < vertexArray.length; i++)
    {
        v = vertexArray[i];
        pos = spatialManager.getVertex(v.cx, v.cy).getPos();
        ctx.lineTo(pos.x, pos.y);
    }

    ctx.lineTo(currPos.x, currPos.y);

    var destX = currPos.x + progress * (nextPos.x - currPos.x);
    var destY = currPos.y + progress * (nextPos.y - currPos.y);
    
    // If the player doesn't have a tail yet, we draw a line from its current
    // vertex to its perceived position
    if (!v)
        ctx.moveTo(currPos.x, currPos.y);
    ctx.lineTo(destX, destY);

    
    ctx.lineCap = 'round';
    

    var pulse = this.timestep / this.reset_timestep;
    pulse = Math.sin(Math.PI * pulse / 4);
    // Sampling to create a halo effect
    ctx.strokeStyle = this.halo_color;
    ctx.lineWidth = 8 + 2 * pulse;
    ctx.stroke();

    ctx.lineWidth = 10 + 3 * pulse;
    ctx.stroke();

    ctx.lineWidth = 12 + 4 * pulse;
    ctx.stroke();

    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore(); 
}

Player.prototype.makeMove = function()
{
    var movesAhead = 3;
    var speed = 1;

    var attack = this.aggressiveMove();
    if (attack)
    {
        console.log("I'm gonna kill you!");
        this.AIMove(attack);
        return;
    }

    if (this.velX === -speed && (this.freeVertexWest()>movesAhead)) return;
    if (this.velX === speed && (this.freeVertexEast()>movesAhead)) return;
    if (this.velY === speed && (this.freeVertexSouth()>movesAhead)) return;
    if (this.velY === -speed && (this.freeVertexNorth()>movesAhead)) return;
    
    if (Math.abs(this.velX)===speed)
    {
        if (this.freeVertexSouth()>this.freeVertexNorth())
            this.AIMove('South');
        else
            this.AIMove('North');
    }
    if (Math.abs(this.velY)===speed)
    {
        if (this.freeVertexWest()>this.freeVertexEast())
            this.AIMove('West');
        else
            this.AIMove('East');
    }
};

Player.prototype.aggressiveMove = function()
{
    var player1X = entityManager._players[0].cx,
    player1Y = entityManager._players[0].cy,
    player1VelX = entityManager._players[0].velX,
    player1VelY = entityManager._players[0].velY;

    var distanceX = this.cx - player1X;
    var distanceY = this.cy - player1Y;
    var speed = 1;

    // Turn in front of your nemesis
    if (this.velX !== 0 && this.velX === player1VelX &&
        Math.abs(distanceX) > Math.abs(distanceY))
    {
        if (this.cy > player1Y && this.freeVertexNorth() > 0) return 'North';
        if (this.cy < player1Y && this.freeVertexSouth() > 0) return 'South';
    }

    if (this.velY !== 0 && this.velY === player1VelY &&
        Math.abs(distanceY) > Math.abs(distanceX))
    {
        if (this.cx > player1X && this.freeVertexWest() > 0) return'West';
        if (this.cx < player1X && this.freeVertexEast() > 0) return 'East';
    }

    // If your oponent is heading into you sideways carry on
    if (player1VelY !== 0 && this.velX === 0 &&
        Math.abs(distanceX) > Math.abs(distanceY))
    {
        if (this.velX === speed && distanceX < 1 && this.freeVertexEast() > 0) return 'East';
        if (this.velX === -speed && distanceX > -1 && this.freeVertexWest() > 0) return 'West';
    }

    if (player1VelX !== 0 && this.velY === 0 &&
        Math.abs(distanceX) < Math.abs(distanceY))
    {
        if (this.velY === speed && distanceY < 1 && this.freeVertexSouth() > 0) return 'South';
        if (this.velY === -speed && distanceY > -1 && this.freeVertexNorth() > 0) return 'North';
    }

    // If you and your oponent are head on Turn in front of him
    if (this.velX !== 0 && this.velX === -player1VelX &&
        Math.abs(distanceX) > Math.abs(distanceY))
    {
        if (distanceY < 0 && this.freeVertexSouth() > 0) return 'South';
        if (distanceY > 0 && this.freeVertexNorth() > 0) return 'South';
    }

    if (this.velY !== 0 && this.velY === -player1VelY &&
        Math.abs(distanceX) < Math.abs(distanceY))
    {
        if (distanceX < 0 && this.freeVertexEast() > 0) return 'East';
        if (distanceX > 0 && this.freeVertexWest() > 0) return 'West';
    }

    return false;
};

Player.prototype.AIMove = function(direction)
{
    for (var key in this.keys)
        keys.clearKey(this.keys[key]);
    if (direction === 'North')
        keys.setKey(this.keys['UP']);
    else if (direction === 'South')
        keys.setKey(this.keys['DN']);
    else if (direction === 'West')
        keys.setKey(this.keys['LT']);
    else
        keys.setKey(this.keys['RT']);
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

Player.prototype.freeVertexNorth = function()
{
    var counter = 0;
    var nextNorth = this.cy - 1;
    var vertex = spatialManager.getVertex(this.cx, nextNorth);
    while (vertex && !vertex.isWall())
    {
        counter++;
        nextNorth--;
        vertex = spatialManager.getVertex(this.cx, nextNorth);
    }
    return counter;    
};

Player.prototype.freeVertexSouth = function()
{
    var counter = 0;
    var nextSouth = this.cy + 1;
    var vertex = spatialManager.getVertex(this.cx, nextSouth);
    while (vertex && !vertex.isWall())
    {
        counter++;
        nextSouth++;
        vertex = spatialManager.getVertex(this.cx, nextSouth);
    }
    return counter;    
};

Player.prototype.freeVertexEast = function()
{
    var counter = 0;
    var nextEast = this.cx + 1;
    var vertex = spatialManager.getVertex(nextEast, this.cy);
    while (vertex && !vertex.isWall())
    {
        counter++;
        nextEast++;
        vertex = spatialManager.getVertex(nextEast, this.cy);
    }
    return counter;    
};

Player.prototype.freeVertexWest = function()
{
    var counter = 0;
    var nextWest = this.cx - 1;
    var vertex = spatialManager.getVertex(nextWest, this.cy);
    while (vertex && !vertex.isWall())
    {
        counter++;
        nextWest--;
        vertex = spatialManager.getVertex(nextWest, this.cy);
    }
    return counter;    
};
