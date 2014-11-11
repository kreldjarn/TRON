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

// Maps grid coordinates to world coordinates
function getWorldCoordinates(gx, gy)
{
    var wx = GRID_OFFSET_X + gx * VERTEX_MARGIN;
    var wy = GRID_OFFSET_Y + gy * VERTEX_MARGIN;
    return {x: wx, y: wy};
}

// Each "cell" in our spatialManager is a vertex in our physical grid.
// Collisions only happen on vertices, and so each entity registers itself
// to a vertex, every time it moves.
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
        var duAlt = du/PHYS_ACC;
        for (var n = 0; n < PHYS_ACC; ++n)
        {
            for (var j = 0; j < VERTICES_PER_ROW; ++j)
            {
                for (var i = 0; i < VERTICES_PER_ROW; ++i)
                {
                    this._vertices[i][j].applyConstraints(duAlt);
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
    },
    
    unregister: function(entity, x, y) {
        //var pos = entity.getPos();
        //this._vertices[pos.x][pos.y].unregister(entity);
        this._vertices[x][y].unregister(entity);
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

        //Reset to first vertex
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
        for (var j = 1; j < VERTICES_PER_ROW; ++j)
        {
            for (var i = 1; i < VERTICES_PER_ROW; ++i)
            {
                this.getVertex(i, j).render(ctx, this.getVertex(i-1, j-1));
            }
        }
        //ctx.stroke();
    },

    reset: function() {
        for (var i = 0; i < VERTICES_PER_ROW; ++i)
        {
            for (var j = 0; j < VERTICES_PER_ROW; ++j)
            {
                if (this.getVertex(j, i)){
                    var v = this._vertices[j][i].reset();
                }
            }
        }
    },

    getVertex: function(x, y) {
        if (this._vertices[x] && this._vertices[x][y])
        {
            var v = this._vertices[x][y];
            return v;
        }
        return false;
    }

}
