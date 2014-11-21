//====================
//      Settings
//=====================

//Global Variables
var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

var g_frameCounter = 1;

var TOGGLE_CLEAR = 'C'.charCodeAt(0);
var TOGGLE_BOX = 'B'.charCodeAt(0);
var TOGGLE_UNDO_BOX = 'U'.charCodeAt(0);
var TOGGLE_FLIPFLOP = 'F'.charCodeAt(0);
var TOGGLE_RENDER = 'R'.charCodeAt(0);

// =====
// DEBUG
// =====
var DEBUG = false;

// =============
// GRID SETTINGS
// =============
var VERTICES_PER_ROW = 30,
    GRID_OFFSET_X = 250,
    GRID_OFFSET_Y = 50;
    VERTEX_MARGIN = (g_canvas.width - (2 * GRID_OFFSET_X)) /
    				(VERTICES_PER_ROW - 1),
    // PHYS_ACC denotes number of iterations through verlet integration.
    // lower for better performance
    PHYS_ACC = 8;

// ==============
// SCORE SETTINGS
// ==============
var LOSE_PENALTY = 10,
	SCORE_INC = 5,
	WIN_SCORE = 100,
	AI_LOSER = false;
	SCORE_POSY = GRID_OFFSET_Y - 10,
	SCORE_POSX = 0 + GRID_OFFSET_X,
	HAS_PLAYED = false,
	LAST_SCORE = 0;

// =============
// HALO SETTINGS
// =============

var HALO_ALPHA = 0.15;

//==============
// WALL LENGTH
//=============

var WALL_INC = 1,
	MAX_INC = 50;

// ==============
// INTRO SEQUENCE
// ==============
// (Lovingly hand-crafted)
var INTRO_SEQUENCE = [{x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 1, y: 0},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 1, y: 0},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: -1, y: 0},
					  {x: -1, y: 0},
					  {x: -1, y: 0},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: -1, y: 0},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: -1, y: 0},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: -1, y: 0},
					  {x: -1, y: 0},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: -1, y: 0},
					  {x: -1, y: 0},
					  {x: -1, y: 0},
					  {x: -1, y: 0},
					  {x: -1, y: 0},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 1, y: 0},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: -1, y: 0},
					  {x: -1, y: 0},
					  {x: -1, y: 0},
					  {x: -1, y: 0},
					  {x: -1, y: 0},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: -1, y: 0},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: -1, y: 0},
					  {x: -1, y: 0},
					  {x: 0, y: -1},
					  {x: 1, y: 0},
					  {x: 1, y: 0},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: -1, y: 0},
					  {x: -1, y: 0},
					  {x: -1, y: 0},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: -1, y: 0},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: -1, y: 0},
					  {x: -1, y: 0},
					  {x: -1, y: 0},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: 0, y: 1},
					  {x: -1, y: 0},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: 0, y: -1},
					  {x: -1, y: 0},
					  {x: -1, y: 0},
					  {x: -1, y: 0},
					  {x: 0, y: -1},
					  {x: 1, y: 0},];