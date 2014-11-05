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

var VERTICES_PER_ROW = 20,
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

// Each "cell" in our spatialManager is a vertex in our physical grid.
// Collisions only happen on vertices, and so each entity registers itself
// to a vertex, every time it moves.
function Vertex() {
    this._entities = [];
    this.color = '#FFF';
    this.std_color = '#FFF';
    this.isWall = false;
    this.register = function(entity) {
        var ID = entity.getSpatialID();
        this._entities[ID] = entity;
        this.color = entity.color;
        this.isWall = true;
    };
    this.unregister = function(entity) {
        var ID = entity.getSpatialID();
        delete this._entities[ID];
        //this.color = this.std_color;
    };
    this.render = function(ctx) {
        ctx.save();
        ctx.strokeStyle = this._color;
        //util.fillCircle(ctx, )
        ctx.restore();
    };
    this.reset = function() {
        this.color = this.std_color;
        this.isWall = false;
    }
}

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
                v[i].push(new Vertex());
            }
        }
        return v;
    })(),
    // "PRIVATE" METHODS
    //
    // <none yet>
    
    
    // PUBLIC METHODS

    // Maps grid coordinates to world coordinates
    getWorldCoordinates : function(gx, gy) {
        var wx = GRID_OFFSET + gx * VERTEX_MARGIN;
        var wy = GRID_OFFSET + gy * VERTEX_MARGIN;
        return {x: wx, y: wy};
    },
    
    getNewSpatialID : function() {
        return this._nextSpatialID++;
    },
    
    register: function(entity, x, y) {
        var pos = entity.getPos();
        this._vertices[pos.x][pos.y].register(entity);
        // TODO: Find the vertex with coordinates (x, y) and register entity
        // to it

    },
    
    unregister: function(entity, x, y) {
        var pos = entity.getPos();
        this._vertices[pos.x][pos.y].unregister(entity);
        // TODO: Find the vertex with coordinates (x, y) and unregister entity
        // from it

    },

    drawGrid: function(ctx,levelArray) {
        ctx.strokeStyle = '#FFF';
        var vx = this.getWorldCoordinates(0, 0).x;
        var vy = this.getWorldCoordinates(0, 0).y;

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
        var vx = this.getWorldCoordinates(0, 0).x;
        var vy = this.getWorldCoordinates(0, 0).y;
        
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
                                //ctx.fillRect(vx,vy,VERTEX_MARGIN,VERTEX_MARGIN);
                            }
                        vx = vx + VERTEX_MARGIN;
                    }
                vy = vy + VERTEX_MARGIN;
                vx = 2 * VERTEX_MARGIN - 2;
           }

    },


    render: function(ctx) {
        this.drawFloor(ctx,LEVEL1);
        this.drawGrid(ctx,LEVEL1);
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
        var v = this._vertices[x][y];
        v.color = '#F00';
        return v;
    }

}
