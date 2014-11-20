//===============================
//     Entity Manager
//===============================

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
    _explosions : [],
    
    //Game is a 1-player game.  Player vs AI.
    generatePlayers : function() {
        // PLAYER CHARACTER
        this.generatePlayer({cx: 0,
                             cy: 0,
                             timestep: 6,
                             color: '#1BFFA2',
                             halo_color: 'rgba(255, 255, 255, 0.15)',
                             //halo_color: 'rgba(50, 255, 255, 0.15)',
                             wallVertices: [{cx: 0, cy: 0}],
                             permWallVertices: [{cx: 0, cy: 0}],
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
                             halo_color: 'rgba(255, 26, 130, 0.15)',
                             wallVertices: [{cx: VERTICES_PER_ROW-1, cy: VERTICES_PER_ROW-1}],
                             permWallVertices: [{cx: VERTICES_PER_ROW-1, cy: VERTICES_PER_ROW-1}],
                             sequencer: null,
                             keys: {
                                 UP: 1000,
                                 DN: 1001,
                                 LT: 1002,
                                 RT: 1003,
                             },
                             AI: true});
    },

    generateExplosion : function(x, y)
    {
        this._explosions.push(explosion(x, y))
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
                _categories : [this._title, this._explosions]
            },
            'game' : {
                _categories : [this._players, this._explosions]
            }
        };
    },
    
    init: function() {
        this._generatePlayers();
    },

    generatePlayer : function(descr) {
        this._players.push(new Player(descr));
    },

    // New psuedo-player/cycle created to draw on the Title "TRON" sequence
    generateTitle : function(descr) {
        this._title.push(new Player({cx: 2,
                                cy: 8,
                                timestep: 6,
                                color: '#1BFFA2',
                                halo_color: 'rgba(255, 255, 255, 0.15)',
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

    //Increase wall length for Player or AI
    incMaxWallLength: function()
    {
        for (var i = 0; i < this._players.length; i++) {
            this._players[i].maxWallLength = WALL_INC;
        }
    },

    //Increase score for player.
    incWinnerScore: function(entity)
    {
        for (var i = 0; i < this._players.length && i != this.returnIndex(entity); i++) {
            this._players[i].score += WIN_SCORE;
        }
    },

    //Check for a head-to-head collision.
    checkSpecialCase: function()
    {
        for (var i = 0; i < this._players.length; i++)
        {
            var x = this._players[i].cx;
            var y = this._players[i].cy;
            for (var j = i+1; (j < this._players.length) && (j != i); j++)
            {
                if (this._players[j].cx == x && this._players[j].cy == y)
                {
                    var player1 = this._players[i];
                    var player2 = this._players[j];

                    var v = spatialManager.getVertex(x, y);
                    if (v)
                    {
                        var pos = v.getPos();
                        entityManager.generateExplosion(pos.x, pos.y);
                    }

                    if (player1.AI) this.respawnAI(player1);
                    if (player2.AI) this.respawnAI(player2);

                    entityManager.resetPlayers();
                    return true;
                }
            }
        }
        return false;
    },

    //AI is respawn when it dies.
    respawnAI: function(entity)
    {   
        //Remember the AI's wallLength
        var wallLength = entity.maxWallLength;
        //kill AI
        this._players.splice(this.returnIndex(entity),1);
        //Spawn new AI
        this.generatePlayer({cx: VERTICES_PER_ROW-1,
                             cy: VERTICES_PER_ROW-1,
                             velX: -1,
                             velY: 0,
                             timestep: 6,
                             color: '#fff',
                             halo_color: '#fff',
                             wallVertices: [{cx: VERTICES_PER_ROW-1, cy: VERTICES_PER_ROW-1}],
                             permWallVertices: [{cx: VERTICES_PER_ROW-1, cy: VERTICES_PER_ROW-1}],
                             scorePosX: 100 + GRID_OFFSET_X,
                             sequencer: null,
                             maxWallLength: wallLength,
                             keys: {
                                 UP: 1000,
                                 DN: 1001,
                                 LT: 1002,
                                 RT: 1003,
                             },
                             AI: true,
                             anxiousness: 0.2});
        //Add colors to the new AI
        var newIndex = this._players.length - 1;
        var newAI = this._players[newIndex];
        var colors = util.generateColors();
        newAI.color = colors.color;
        newAI.halo_color = colors.halo_color;
        if (AI_LOSER)
        {
            newAI.introCount = 100;
            AI_LOSER = false;
        }
    },

    returnIndex: function(entity)
    {
        return this._players.indexOf(entity);
    },

    update: function(du) {
        var state = g_states.getState();
        for (var c = 0; c < this._states[state]._categories.length; ++c)
        {
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
        for (var c = 0; c < this._states[state]._categories.length; ++c)
        {
            var aCategory = this._states[state]._categories[c];
            for (var i = 0; i < aCategory.length; ++i) {
                aCategory[i].render(ctx);
            }
        }
    }

}

// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();
entityManager.generateTitle();

