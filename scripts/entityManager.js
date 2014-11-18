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
    _title : [],
    
    generatePlayers : function() {
        // PLAYER CHARACTER
        this.generatePlayer({cx: 0,
                             cy: 0,
                             timestep: 6,
                             color: '#1BFFA2',
                             halo_color: 'rgba(143, 246, 204, 0.2)',
                             wallVertices: [{cx: 0, cy: 0}],
                             permWallVertices: [{cx: 0, cy: 0}],
                             scorePosX: 0 + GRID_OFFSET_X,
                             sequencer: null,
                             keys: {
                                 UP: 'W'.charCodeAt(0),
                                 DN: 'S'.charCodeAt(0),
                                 LT: 'A'.charCodeAt(0),
                                 RT: 'D'.charCodeAt(0),
                             },
                             AI: false});
        // AI
        this.generatePlayer({cx: VERTICES_PER_ROW-1,
                             cy: VERTICES_PER_ROW-1,
                             velX: -1,
                             velY: 0,
                             timestep: 6,
                             color: '#EF066E',
                             halo_color: 'rgba(239, 6, 110, 0.2)',
                             wallVertices: [{cx: VERTICES_PER_ROW-1, cy: VERTICES_PER_ROW-1}],
                             permWallVertices: [{cx: VERTICES_PER_ROW-1, cy: VERTICES_PER_ROW-1}],
                             scorePosX: 100 + GRID_OFFSET_X,
                             sequencer: null,
                             keys: {
                                 UP: 1000,
                                 DN: 1001,
                                 LT: 1002,
                                 RT: 1003,
                             },
                             AI: true,
                             anxiousness: 0.2});
    },

    reset: function()
    {
        this._players = [];
        this._title = [];
        this.deferredSetup();
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
        this._states = {
            'title' : {
                _categories : [this._title]
            },
            'game' : {
                _categories : [this._players]
            }
        };
    },
    
    init: function() {
        this._generatePlayers();
    },

    generatePlayer : function(descr) {
        this._players.push(new Player(descr));
    },

    generateTitle : function(descr) {
        this._title.push(new Player({cx: 2,
                                cy: 8,
                                timestep: 6,
                                color: '#1BFFA2',
                                halo_color: 'rgba(143, 246, 204, 0.2)',
                                wallVertices: [{cx: 2, cy: 8}],
                                permWallVertices: [{cx: 0, cy: 0}],
                                scorePosX: null,
                                sequencer: new Sequencer(INTRO_SEQUENCE, true),
                                introPlayer: true,
                                maxWallLength: 170,
                                keys: {
                                    UP: 2000,
                                    DN: 2001,
                                    LT: 2002,
                                    RT: 2003,
                                },
                                AI: false}));
    },

    getPlayers : function()
    {
        return this._states[g_states.getState()]._categories[0];
    },

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

    update: function(du) {
        var state = g_states.getState();
        for (var c = 0; c < this._states[state]._categories.length; ++c) {
            var aCategory = this._states[state]._categories[c];
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
        var state = g_states.getState();
        for (var c = 0; c < this._states[state]._categories.length; ++c) {
            
            var aCategory = this._states[state]._categories[c];

            if (!this._bShowRocks && 
                aCategory == this._rocks)
                continue;
    
            for (var i = 0; i < aCategory.length; ++i) {
                aCategory[i].render(ctx);
            }
        }
    }

}

// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();
entityManager.generateTitle();

