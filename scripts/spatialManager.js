/*

spatialManager.js

A module which handles spatial lookup, as required for...
e.g. general collision detection.

*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/
var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

var VERTICES_PER_ROW = 25,
    GRID_OFFSET = 50,
    VERTEX_MARGIN = (g_canvas.width - (2 * GRID_OFFSET)) / (VERTICES_PER_ROW - 1),
    GRID_COLOR = '#FFF',
    LEVEL1 = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,0,0,0,0,1,1,1,1,1,1,1,0,0,0,1,1,1],
        [1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1],
        [1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1],
        [1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1],
        [1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,1],
        [1,1,1,0,1,1,0,1,1,1,1,1,1,0,1,1,0,1,1,1],
        [1,1,1,0,1,1,0,1,1,1,1,1,1,0,1,1,0,1,1,1],
        [1,1,1,0,1,1,0,1,1,1,1,1,1,0,1,1,0,1,1,1],
        [1,1,1,0,0,0,0,1,1,1,1,1,1,0,1,1,0,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];


var gravity = 2;

// Maps grid coordinates to world coordinates
function getWorldCoordinates(gx, gy)
{
    var wx = GRID_OFFSET + gx * VERTEX_MARGIN;
    var wy = GRID_OFFSET + gy * VERTEX_MARGIN / 2;
    return {x: wx, y: wy};
}

// Each "cell" in our spatialManager is a vertex in our physical grid.
// Collisions only happen on vertices, and so each entity registers itself
// to a vertex, every time it moves.
function Vertex(x, y)
{
    this._entities = [];
    this.color = '#FFF';
    this.std_color = '#FFF';
    this.isWall = false;
    this.debug = false;

    /*******************
     *  VERTLET STUFF  *
     *******************/
    this.x = x;
    this.y = y;
    this.px = x;
    this.py = y;
    this.vx = 0;
    this.vy = 0;
    this.pinX = null;
    this.pinY = null;
    this.constraints = [];
}

Vertex.prototype.register = function(entity)
{
    var ID = entity.getSpatialID();
    this._entities[ID] = entity;
    this.color = entity.color;
    this.isWall = true;
};

Vertex.prototype.unregister = function(entity)
{
    var ID = entity.getSpatialID();
    this.isWall = false;
    delete this._entities[ID];
    //this.color = this.std_color;
};

Vertex.prototype.reset = function()
{
    this.color = this.std_color;
    this.isWall = false;
};

Vertex.prototype.getPos = function()
{
    return {x: this.x, y: this.y};
};

Vertex.prototype.setPos = function(x, y)
{
    this.x = x;
    this.y = y;
};

Vertex.prototype.pin = function(px, py)
{
    this.pinX = px;
    this.pinY = py;
}

Vertex.prototype.update = function(du)
{
    if (this.pinX && this.pinY) return;
    this.px = this.x;
    this.py = this.y;

    var players = entityManager.getPlayers();
    for (var i = 0; i < players.length; ++i)
    {
        var pos = players[i].getPos();
        pos = spatialManager.getVertex(pos.x, pos.y).getPos();
        var dist = util.distSq(pos.x, pos.y, this.x, this.y);

        if (dist < 8000)
        {
            var scale = (dist > 2000) ? (8000/dist) : 4;
            var vel = players[i].getVel();
            this.px -= vel.x * du * scale;
            this.py -= vel.y * du * scale;
        }
    }

    this.applyForce(0, gravity * du);
    //du *= du;
    var nx = this.x + ((this.x - this.px) * 0.99) + ((this.vx / 2) * du);
    var ny = this.y + ((this.y - this.py) * 0.99) + ((this.vy / 2) * du);

    this.px = this.x;
    this.py = this.y;

    this.x = nx;
    this.y = ny;

    this.vx = 0;
    this.vy = 0;
};

Vertex.prototype.render = function(ctx, vtx)
{/*
    if (this.constraints.length === 0) return;

    for (var i = 0; i < this.constraints.length; ++i)
    {
        this.constraints[i].render(ctx);
    }*/

    if (this.constraints.length < 2 || !vtx) return;
    ctx.beginPath();
    ctx.moveTo(vtx.x, vtx.y);
    ctx.lineTo(this.constraints[0].vtx2.x, this.constraints[0].vtx2.y);
    
    ctx.lineTo(this.x, this.y);
    ctx.lineTo(this.constraints[1].vtx2.x, this.constraints[1].vtx2.y);

    
    ctx.closePath();
    var off = (this.x - vtx.x) + (this.y - vtx.y);
    off *= 0.25;

    var coef = Math.round((Math.abs(off)/VERTEX_MARGIN) * 255);
    if (coef > 220)
        coef = 220;
    ctx.fillStyle = "rgba(" + coef + ", 65, " + (220 - coef) + ", " + util.linearInterpolate(0.25, 1, coef/255.0) + ")";
    ctx.fill();
};

Vertex.prototype.applyConstraints = function(du)
{
    // ATTN
    // Currently, cannot be pinned to a falsy coord
    if (this.pinX && this.pinY)
    {
        this.setPos(this.pinX, this.pinY);
        return;
    }

    for (var i = 0; i < this.constraints.length; ++i)
    {
        this.constraints[i].assert(du);
    }

    this.x = util.clampRange(this.x, 0, g_canvas.width);
    this.y = util.clampRange(this.y, 0, g_canvas.height);
};

Vertex.prototype.constrainBy = function(vertex)
{
    this.constraints.push(new Constraint(this, vertex));
};

Vertex.prototype.spliceConstraint = function(constraint)
{
    this.constraints.splice(this.constraints.indexOf(constraint), 1);
};

Vertex.prototype.applyForce = function(fx, fy)
{
    this.vx += fx;
    this.vy += fy;
};

// Constraint represents the attraction force between two vertices
function Constraint(vtx1, vtx2)
{
    this.vtx1 = vtx1;
    this.vtx2 = vtx2;
    this.length = VERTEX_MARGIN;
}

Constraint.prototype.assert = function(du)
{
    //if (this.vtx1.pinX && this.vtx1.pinY) return;
    var pos1 = this.vtx1.getPos(),
        pos2 = this.vtx2.getPos();

    var dX = pos1.x - pos2.x,
        dY = pos1.y - pos2.y,
        dist = Math.sqrt(dX * dX + dY * dY),
        delta = (this.length - dist) / dist;

    var px = dX * delta * 0.4;// * du;
    var py = dY * delta * 0.4;// * du;

    this.vtx1.setPos(pos1.x + px, pos1.y + py);
    this.vtx2.setPos(pos2.x - px, pos2.y - py);
};

Constraint.prototype.render = function(ctx)
{
    var pos1 = this.vtx1.getPos(),
        pos2 = this.vtx2.getPos();
    ctx.moveTo(pos1.x, pos1.y);
    ctx.lineTo(pos2.x, pos2.y);
};


var debug = [];
for (var i = 0; i < VERTICES_PER_ROW; ++i) debug[i] = [];

var spatialManager = {

    // "PRIVATE" DATA
    _nextSpatialID : 1, // make all valid IDs non-falsey (i.e. don't start at 0)

    _vertices : (function(){
        var v = [];
        for (var i = 0; i < VERTICES_PER_ROW; ++i)
        {
            v.push([]);
            for (var j = 0; j < VERTICES_PER_ROW; ++j)
            {
                var pos = getWorldCoordinates(i, j)
                v[i][j] = new Vertex(pos.x, pos.y);
                if (i > 0)
                    v[i][j].constrainBy(v[i - 1][j]);
                if (j > 0)
                    v[i][j].constrainBy(v[i][j - 1]);
                // We pin the top row of vertices:
                if (j === 0)
                {
                    pos = v[i][j].getPos();
                    v[i][j].pin(pos.x, pos.y);
                }
            }
        }
        return v;
    })(),
    // "PRIVATE" METHODS
    //
    // <none yet>
    
    // PUBLIC METHODS

    update: function(du)
    {
        // Acc denotes accuracy of physics simulation.
        // lower for better performance
        var Acc = 3;
        for (var n = 0; n < Acc; ++n)
        {
            for (var j = 0; j < VERTICES_PER_ROW; ++j)
            {
                for (var i = 0; i < VERTICES_PER_ROW; ++i)
                {
                    this._vertices[i][j].applyConstraints(du);
                }
            }
        }

        for (var j = 0; j < VERTICES_PER_ROW; ++j)
        {
            for (var i = 0; i < VERTICES_PER_ROW; ++i)
            {
                this._vertices[i][j].update(du);
            }
        }
    },

    
    getNewSpatialID : function() {
        return this._nextSpatialID++;
    },
    
    register: function(entity, x, y) {
        //var pos = entity.getPos();
        //this._vertices[pos.x][pos.y].register(entity);
        this._vertices[x][y].register(entity);
        // TODO: Find the vertex with coordinates (x, y) and register entity
        // to it

    },
    
    unregister: function(entity, x, y) {
        //var pos = entity.getPos();
        //this._vertices[pos.x][pos.y].unregister(entity);
        this._vertices[x][y].unregister(entity);
        // TODO: Find the vertex with coordinates (x, y) and unregister entity
        // from it

    },

    addRift: function(x, y)
    {
        this.getVertex(x, y).constraints = [];
    },

    removeRift: function(x, y)
    {
        var v1 = this.getVertex(x, y);
        var v2 = this.getVertex(x - 1, y);
        if (v2)
            v1.constrainBy(v2);
        v2 = this.getVertex(x, y - 1);
        if (v2)
            v1.constrainBy(v2);
    },

    drawGrid: function(ctx, levelArray) {
        ctx.strokeStyle = '#00F';
        var vx = getWorldCoordinates(0, 0).x;
        var vy = getWorldCoordinates(0, 0).y;

        //Draw horizontal lines of grid
        for (var j = 0; j < VERTICES_PER_ROW; ++j)
        {
            for (var i = 0; i < VERTICES_PER_ROW - 1; ++i)
            {
                ctx.beginPath();
                ctx.moveTo(vx, vy);
                if (levelArray[j][i] === 1 && levelArray[j][i + 1] === 1)
                {
                    ctx.lineTo(vx + VERTEX_MARGIN, vy);
                    ctx.stroke();
                }
                vx = vx + VERTEX_MARGIN;
            }
            vy = vy + VERTEX_MARGIN;
            vx = 2 * VERTEX_MARGIN - 2;
        }

        //Reset to first vertix
        var vx = getWorldCoordinates(0, 0).x;
        var vy = getWorldCoordinates(0, 0).y;
        
        //Draw vertical lines of grid
        for (var m = 0; m < VERTICES_PER_ROW; ++m)
        {
            for (var n = 0; n < VERTICES_PER_ROW - 1; ++n)
            {
                ctx.beginPath();
                ctx.moveTo(vx, vy);
                if (levelArray[n][m] === 1 && levelArray[n + 1][m] === 1)
                {
                    ctx.lineTo(vx, vy + VERTEX_MARGIN);
                    ctx.stroke();
                }
                vy = vy + VERTEX_MARGIN;
            }
            vx = vx + VERTEX_MARGIN;
            vy = 2 * VERTEX_MARGIN - 2;
        }


        // DEBUG
        // =====
        /*
        ctx.strokeStyle = '#FFF';
        for (var i = 0; i < VERTICES_PER_ROW; ++i)
        {
            for (var j = 0; j < VERTICES_PER_ROW; ++j)
            {
                if (debug[i][j])
                {
                    var pos = this.getWorldCoordinates(i, j);
                    util.strokeCircle(g_ctx, pos.x, pos.y, 20);
                }
            }
        }
        */
    },

    drawFloor: function (ctx, levelArray) {
            var floorGrad = ctx.createRadialGradient(300,300,300,300,300,100);
            floorGrad.addColorStop(0,'#33334C');
            floorGrad.addColorStop(1,'#8585AD');
            ctx.fillStyle = floorGrad;
            var vx = 2 * VERTEX_MARGIN - 2;
            var vy = 2 * VERTEX_MARGIN - 2;
            //Draw floor tiles of grid
            for (var j=0; j< VERTICES_PER_ROW - 1; ++j)
            {
                for (var i =0; i < VERTICES_PER_ROW - 1; ++i)
                    {
                        ctx.beginPath();
                        ctx.moveTo(vx,vy);
                        if(levelArray[j][i]===1 && levelArray[j+1][i]===1 && levelArray[j+1][i+1]===1 && levelArray[j][i+1]===1)
                            {
                                ctx.fillRect(vx,vy,VERTEX_MARGIN,VERTEX_MARGIN);
                            }
                        vx = vx + VERTEX_MARGIN;
                    }
                vy = vy + VERTEX_MARGIN;
                vx = 2 * VERTEX_MARGIN - 2;
           }

    },


    render: function(ctx) {
        ctx.strokeStyle = '#FFF';
        //ctx.beginPath();

        for (var j = 0; j < VERTICES_PER_ROW; ++j)
        {
            for (var i = 0; i < VERTICES_PER_ROW; ++i)
            {
                this.getVertex(i, j).render(ctx, this.getVertex(i-1, j-1));
            }
        }

        //ctx.stroke();
        //this.drawFloor(ctx, LEVEL1);
        //this.drawGrid(ctx, LEVEL1);
        /*for (var i = 0; i < VERTICES_PER_ROW; ++i)
        {
            for (var j = 0; j < VERTICES_PER_ROW; ++j)
            {
                var pos = this.getWorldCoordinates(j, i);
                ctx.save();
                var v = this._vertices[j][i];
                ctx.fillStyle = v.color;

                util.fillCircle(ctx, pos.x, pos.y, (v.isWall) ? 4 : 2);
                ctx.restore();
            }
        }*/
    },

    reset: function() {
        for (var i = 0; i < VERTICES_PER_ROW; ++i)
        {
            for (var j = 0; j < VERTICES_PER_ROW; ++j)
            {
                var v = this._vertices[j][i].reset();
            }
        }
    },

    getVertex: function(x, y) {
        if (this._vertices[x] && this._vertices[x][y])
        {
            var v = this._vertices[x][y];
            debug[x][y] = true;
            return v;
        }
        return false;
    }

}
