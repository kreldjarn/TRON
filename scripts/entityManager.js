/*

entityManager.js

A module which handles arbitrary entity-management for "Asteroids"


We create this module as a single global object, and initialise it
with suitable 'data' and 'methods'.

"Private" properties are denoted by an underscore prefix convention.

*/


"use strict";


// Tell jslint not to complain about my use of underscore prefixes (nomen),
// my flattening of some indentation (white), or my use of incr/decr ops 
// (plusplus).
//
/*jslint nomen: true, white: true, plusplus: true*/


var entityManager = {

    // "PRIVATE" DATA
    
    _players : [],
    //_walls : [],
    
    // "PRIVATE" METHODS
    
    _generatePlayers : function() {
        this.generatePlayer({cx: 0,
                             cy: 0,
                             timestep: 7,
                             color: '#1BFFA2',
                             halo_color: 'rgba(143, 246, 204, 0.2)',
                             wallVertices: [{cx: VERTICES_PER_ROW -1, cy: VERTICES_PER_ROW-2}],
                             permWallVertices: [{cx: 0, cy: 0}],
                             scorePosX: 0 + GRID_OFFSET_X,
                             keys: {
                                 UP: 'W'.charCodeAt(0),
                                 DN: 'S'.charCodeAt(0),
                                 LT: 'A'.charCodeAt(0),
                                 RT: 'D'.charCodeAt(0),
                             },
                             AI: false});
        this.generatePlayer({cx: VERTICES_PER_ROW-1,
                             cy: VERTICES_PER_ROW-1,
                             velX: -1,
                             velY: 0,
                             timestep: 7,
                             color: '#EF066E',
                             halo_color: 'rgba(239, 6, 110, 0.2)',
                             wallVertices: [{cx: 0, cy: 1}],
                             permWallVertices: [{cx: VERTICES_PER_ROW-1, cy: VERTICES_PER_ROW-1}],
                             scorePosX: 100 + GRID_OFFSET_X,
                             keys: {
                                 UP: 1000,
                                 DN: 1001,
                                 LT: 1002,
                                 RT: 1003,
                             },
                             AI: true,
                             anxiousness: 0.2});
    },
    
    _forEachOf: function(aCategory, fn) {
        for (var i = 0; i < aCategory.length; ++i) {
            fn.call(aCategory[i]);
        }
    },
    
    // PUBLIC METHODS
    
    // A special return value, used by other objects,
    // to request the blessed release of death!
    //
    KILL_ME_NOW : -1,
    
    // Some things must be deferred until after initial construction
    // i.e. thing which need `this` to be defined.
    //
    deferredSetup : function () {
        this._categories = [this._players];
        this._generatePlayers();
    },
    
    init: function() {
        this._generatePlayers();
        //this._generateShip();
    },

    generatePlayer : function(descr) {
        this._players.push(new Player(descr));
    },

    getPlayers : function()
    {
        return this._players;
    },

    /*generateWall : function(descr) {
        this._walls.push(new Wall(descr));
        //console.log(this._walls);
    },*/
    
    resetPlayers: function() 
    {
        for (var i = 0; i < this._players.length; i++) {
            this._players[i].reset();
        }
    },

    incMaxWallLength: function()
    {
        for (var i = 0; i < this._players.length; i++) {
            this._players[i].maxWallLength += 5;
        }
    },

    checkSpecialCase: function() 
    {
        var x = this._players[0].cx;
        var y = this._players[0].cy;
        for (var i = 1; i < this._players.length; i++) {
            if (this._players[i].cx == x && this._players[i].cy == y)
            {
                for (var i = 0; i < this._players.length; i++) {
                    this._players[i].score -= LOSE_PENALTY;
                }
                entityManager.resetPlayers();
                entityManager.incMaxWallLength();
                return true;
            }
        }
        return false;
    },

    update: function(du) {
        for (var c = 0; c < this._categories.length; ++c) {
    
            var aCategory = this._categories[c];
            var i = 0;
    
            while (i < aCategory.length) {
    
                var status = aCategory[i].update(du);
    
                if (status === this.KILL_ME_NOW) {
                    // remove the dead guy, and shuffle the others down to
                    // prevent a confusing gap from appearing in the array
                    aCategory.splice(i,1);
                }
                else {
                    ++i;
                }
            }
        }
    
    },
    
    render: function(ctx) {
    
        var debugX = 10, debugY = 100;
    
        for (var c = 0; c < this._categories.length; ++c) {
    
            var aCategory = this._categories[c];
    
            if (!this._bShowRocks && 
                aCategory == this._rocks)
                continue;
    
            for (var i = 0; i < aCategory.length; ++i) {
    
                aCategory[i].render(ctx);
                //debug.text(".", debugX + i * 10, debugY);
    
            }
            debugY += 10;
        }
    }

}

// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();

