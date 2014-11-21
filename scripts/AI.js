
// ==
// AI
// ==
// We implement an alpha beta pruning algorithm to control the AI movements
// The main functions are the decisionMaker, maxValue and minValue functions
// all other functions are helper functions.


var g_AI = {

	// snapShotGrid makes a two dimensional array that represents the game grid
	snapShotGrid : function()
	{
		DEBUG_AI_NODES = [];
		var snapShotGrid = [];
		var v;
		for (var i = 0; i < VERTICES_PER_ROW; i++)
		{
			snapShotGrid.push([]);
			for (var j = 0; j < VERTICES_PER_ROW; j++)
			{
				snapShotGrid[i][j] = 0;
				v = spatialManager.getVertex(i, j);
				snapShotGrid[i][j] = (v.isWall()) ? 1 : 0;
				if (DEBUG && snapShotGrid[i][j])
				{
					var pos = v.getPos();
					DEBUG_AI_NODES.push(pos);
				}
			}
		}
		return snapShotGrid;
	},

	// copyGrid makes a duplicate of a grid so more than one possibility can be
	// explored when determining future moves
	copyGrid : function (grid, cx, cy)
	{
		var newgrid = grid.slice(0);
		//var newgrid = [];
		//for (var i = 0; i < grid.length; i++)
		//{
		//	newgrid[i] = grid[i].slice();
		//}
		newgrid[cx][cy] = 1;
		return newgrid;
	},

	// illegalMove determines if a position is outside the grid
	// or if a position is occupied with a wall
	illegalMove : function(grid, direction, cx, cy)
	{
		if (direction === 'North') cy--;
		else if (direction === 'South') cy++;
		else if (direction === 'West') cx--;
		else cx++;
		if (cx < 0 || cx>= VERTICES_PER_ROW || cy<0 ||
			cy>=VERTICES_PER_ROW) return true;
		else if (grid[cx][cy]===1) return true;
		else return false;
	},

	// Given a direction you are headed in the function return all direction
	// except the one you are coming from
	directionOptions : function(direction, cx, cy)
	{
		var directions = [['North', cx, cy-1],['East', cx+1, cy],
		['South', cx, cy+1],['West', cx-1, cy]];
		// Mark the direction we're coming from as illegal
		for(var i = 0; i < directions.length; i++)
		{
			var illegalDir = (i + 2) % 4;
			if (direction === directions[i][0]) directions.splice(illegalDir, 1);
		}
		return directions;
	},

	// The decisionMaker determines the best possible move the AI can make
	// m games ahead.
	// The variable m determines the depth of the minimax tree
	decisionMaker : function (AIdir, AIcx, AIcy, P1dir, P1cx, P1cy)
	{
		var m = 2;
		var pathValue = [];
		var alpha = -Infinity;
		var beta = Infinity;
		var AIdirs = this.directionOptions(AIdir, AIcx, AIcy);

		var grid = this.snapShotGrid();
		for (var i = 0; i < 3; ++i)
		{
			pathValue[i] = this.minValue(AIdirs[i][0],
										 AIdirs[i][1],
										 AIdirs[i][2],
										 alpha,
										 beta,
										 m,
										 grid.slice(0),
										 P1dir,
										 P1cx,
										 P1cy);
		}
		
		var maxVal = Math.max(pathValue[1], pathValue[0], pathValue[2]);
		var res;
		switch (maxVal)
		{
			case pathValue[0]:
				res = AIdirs[0][0];
				break;
			case pathValue[1]:
				res = AIdirs[1][0];
				break;
			default:
				res = AIdirs[2][0];
		}
		return res;
	},

	// The maxValue determines the best possible move the AI can make
	maxValue : function(P1dir, P1cx, P1cy, alpha, beta, m, grid, AIdir, AIcx, AIcy)
	{
		if (this.illegalMove(grid, AIdir, AIcx, AIcy)) return alpha;
		var AIdirs = this.directionOptions(AIdir, AIcx,AIcy);
		var defaultAlpha = alpha;

		var newgrid = this.copyGrid(grid, AIcx, AIcy);
		for (var i = 0; i < 3; ++i)
		{
			alpha = Math.max(alpha, this.minValue(AIdirs[i][0],
												  AIdirs[i][1],
												  AIdirs[i][2],
												  alpha,
												  beta,
												  m,
												  newgrid.slice(0),
												  P1dir,
												  P1cx,
												  P1cy));
			// Return instead of looking at other routes to shorten tree
			if (alpha >= beta) return alpha;
			else if (alpha > defaultAlpha) defaultAlpha = alpha;
		}

		return alpha;
	},

	// The minValue determines the best possible move the oponent can make
	minValue : function(AIdir, AIcx, AIcy, alpha, beta, m, grid, P1dir, P1cx, P1cy)
	{
		if (this.illegalMove(grid, P1dir, P1cx, P1cy)) return beta;
		m -= 1;
		if (m === 0) return this.terminalValue(grid, AIdir, AIcx,AIcy);
		var P1dirs = this.directionOptions(P1dir, P1cx, P1cy);
		var defaultBeta = beta;

		var newgrid = this.copyGrid(grid, P1cx, P1cy);
		for (var i = 0; i < 3; ++i)
		{
			beta = Math.min(beta, this.maxValue(P1dirs[i][0],
												P1dirs[i][1],
												P1dirs[i][2],
												alpha,
												beta,
												m,
												newgrid,
												AIdir,
												AIcx,
												AIcy));
			// Return instead of looking at other routes to shorten tree
			if(beta <= alpha) return beta;
			else if (beta < defaultBeta) defaultBeta = beta;
		}

		return defaultBeta;
	},
	
	// Returns a terminal value estimating the best move

	terminalValue : function(grid, AIdir, AIcx, AIcy)
	{
		// TODO:
		// Factor player 1 into the decision making
		var weight = this.freeVertex(grid, AIdir, AIcx, AIcy);
		if (DEBUG)
		{
			if (AIcx > 0 && AIcy > 0 && AIcx < (VERTICES_PER_ROW-1) &&
				AIcy < (VERTICES_PER_ROW-1))
				DEBUG_NODE_WEIGHTS[AIcx][AIcy] = weight;
		}
		return weight;
	},

	// Counts free vertices straight ahead 
	freeVertex : function(grid, direction, cx, cy)
	{
		if (cx < 1 || cy < 1 || cx >= (VERTICES_PER_ROW - 1) ||
			cy >= (VERTICES_PER_ROW - 1)) return -Infinity;
		var counter = 0;
		var x = cx;
		var y = cy;
		switch (direction)
		{
			case 'North':
				while(y > 0)
				{
					if (grid[x][--y]===0) counter++;
					else return counter;
				}
				break;
			case 'South':
				while(y < VERTICES_PER_ROW-1)
				{
					if (grid[x][++y]===0) counter++;
					else return counter;
				}
				break;
			case 'East':
				while(x < VERTICES_PER_ROW-1)
				{
					if (grid[++x][y]===0) counter++;
					else return counter;
				}
				break;
			default:
				while(x > 0)
				{
					if (grid[--x][y]===0) counter++;
					else return counter;
				}
		}
		return counter;
	}
};
