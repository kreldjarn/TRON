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

var VERTICES_PER_ROW = 20,
    GRID_OFFSET = 50,
    VERTEX_MARGIN = (600 - (2 * GRID_OFFSET)) / (VERTICES_PER_ROW - 1);

// Each "cell" in our spatialManager is a vertex in our physical grid.
// Collisions only happen on vertices, and so each entity registers itself
// to a vertex, every time it moves.
function Vertex() {
    this._color = '#FFF',
    this.isWall = false,
    this.render = function (ctx) {
        ctx.save();
        ctx.strokeStyle = this._color;
        //util.fillCircle(ctx, )
        ctx.restore();
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
        var spatialID = entity.getSpatialID();
        
        // TODO: Find the vertex with coordinates (x, y) and register entity
        // to it

    },
    
    unregister: function(entity, x, y) {
        var spatialID = entity.getSpatialID();

        // TODO: Find the vertex with coordinates (x, y) and unregister entity
        // from it

    },
    
    render: function(ctx) {
        for (var i = 0; i < VERTICES_PER_ROW; ++i)
        {
            for (var j = 0; j < VERTICES_PER_ROW; ++j)
            {
                var pos = this.getWorldCoordinates(j, i);
                ctx.save();
                ctx.fillStyle = '#FFF';
                util.fillCircle(ctx, pos.x, pos.y, 2);
                ctx.restore();
            }
        }
    }

}
