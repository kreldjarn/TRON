//=====================
//    SpatialManager
//======================

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
        if (!DEBUG)
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
        }
        
    },

    
    getNewSpatialID : function() {
        return this._nextSpatialID++;
    },
    
    register: function(entity, x, y) {
        this._vertices[x][y].register(entity);
    },
    
    unregister: function(entity, x, y) {
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

    render: function(ctx) {
        ctx.strokeStyle = '#FFF';
        var j = 1, i;
        for (var j = 1; j < VERTICES_PER_ROW; ++j)
        {
            for (i = 1; i < VERTICES_PER_ROW; ++i)
            {
                var v = this.getVertex(i, j);
                v.render(ctx, this.getVertex(i-1, j-1));
                // Render solid vertices
                if (DEBUG && v.isWall())
                {
                    var pos = v.getPos();
                    ctx.fillStyle = '#0FF';
                    util.fillCircle(ctx, pos.x, pos.y, 7);
                }
            }
        }

        // Mark wall nodes and AI wall nodes if debug
        if (DEBUG)
        {
            j = 0;
            i = 0;
            for (; j < VERTICES_PER_ROW; ++j)
            {
                for (i = 0; i < VERTICES_PER_ROW; ++i)
                {
                    var v = this.getVertex(i, j);
                    var pos = v.getPos();
                    if (v.isWall())
                    {
                        ctx.fillStyle = '#0FF';
                        util.fillCircle(ctx, pos.x, pos.y, 7);
                    }

                    var nw = DEBUG_NODE_WEIGHTS[i][j];
                    if (nw)
                    {
                        var fill;
                        if (nw == Infinity) fill = '#FFF';
                        else if (nw == -Infinity) fill = '#F00';
                        else
                        {
                            nw *= 10;
                            if (nw > 255) nw = 255;
                            fill = 'rgb(' + nw + ',0 ,' + nw + ')';
                        }
                        ctx.fillStyle = fill;
                        util.fillCircle(ctx, pos.x, pos.y, 13);
                    }
                }
            }

            ctx.fillStyle = '#F00';
            for (i = 0; i < DEBUG_AI_NODES.length; ++i)
            {
                var pos = DEBUG_AI_NODES[i];
                util.fillCircle(ctx, pos.x, pos.y, 5);
            }
        }
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
