var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

var VERTICES_PER_ROW = 30,
    GRID_OFFSET_X = 250,
    GRID_OFFSET_Y = 50;
    VERTEX_MARGIN = (g_canvas.width - (2 * GRID_OFFSET_X)) /
    				(VERTICES_PER_ROW - 1),
    // PHYS_ACC denotes accuracy of physics simulation.
    // lower for better performance
    PHYS_ACC = 8;

//Game Scoring Settings
var LOSE_PENALTY = 50,
	SCORE_INC = 5,
	SCORE_POSY = GRID_OFFSET_Y - 10;