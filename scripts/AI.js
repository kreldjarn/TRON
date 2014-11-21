
//======================
//   AI
//======================
// We implemented an alpha beta pruning algorithm to control the AI movements
// The main functions are the decisionMaker, maxValue and minValue functions
// all other functions are helper functions.


var g_AI = {

	// snapShotGrid makes a two dimensional array that represents the game grid
	snapShotGrid : function()
	{
		DEBUG_AI_NODES = [];
		//var p = entityManager.getPlayers();
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

		//for (var i=0; i<p[0].wallVertices.length;i++)
		//{
		//	snapShotGrid[p[0].wallVertices[i].cx][p[0].wallVertices[i].cy]=1;
		//}

		//for (var i=0; i<p[1].wallVertices.length;i++)
		//{
		//	snapShotGrid[p[1].wallVertices[i].cx][p[1].wallVertices[i].cy]=1;
		//}
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
	illegalMove : function(grid, direction, cx, cy, N)
	{
		// =============
		// TODO:
		// Clean up: DRY
		// =============
		if (direction === 'North') cy--;
		else if (direction === 'South') cy++;
		else if (direction === 'West') cx--;
		else cx++;

		if (cx < 0 || cx>= VERTICES_PER_ROW || cy<0 ||
			cy>=VERTICES_PER_ROW) return true;
		else if (grid[cx][cy]===1) return true;

		if (direction === 'North') cy--;
		else if (direction === 'South') cy++;
		else if (direction === 'West') cx--;
		else cx++;

		if (cx < 0 || cx>= VERTICES_PER_ROW|| cy<0||
			cy>=VERTICES_PER_ROW) return true;
		else if (grid[cx][cy]===1) return true;
		else return false;
	},

	// A helper function for the illegal move function
	isADeadlyMove : function(grid, x, y)
	{
		if (x < 0 || x>= VERTICES_PER_ROW|| y<0||
			y>=VERTICES_PER_ROW) return true;
		else if (grid[x][y]===1) return true;
		else return false;
	},

	// Given a direction you are headed in the function return all direction
	// except the one you are coming from
	directionOptions : function(direction, cx, cy)
	{
		var directions = [['North', cx, cy-1],['East', cx+1, cy],
		['South', cx, cy+1],['West', cx-1, cy]];
		for(var i = 0; i < directions.length; i++)
		{
			var illegalDir = (i+2)%4;
			if (direction === directions[i][0]) directions.splice(illegalDir,1);
		}
		return directions;
	},

	// The decisionMaker determines the best possible move the AI can make
	// m games ahead.
	// The variable m determines the depth of the minimax tree
	decisionMaker : function (AIdir, AIcx, AIcy, P1dir, P1cx, P1cy)
	{
		var m = 2;
		var pathValue =[];
		var alpha = -Infinity;
		var beta = Infinity;
		var AIdirs = this.directionOptions(AIdir, AIcx, AIcy);

		var grid = this.snapShotGrid();
		pathValue[0]= Math.max(alpha, this.minValue(AIdirs[0][0],
			AIdirs[0][1], AIdirs[0][2], alpha, beta, m, grid.slice(0),
			P1dir, P1cx, P1cy));

		pathValue[1] = Math.max(alpha, this.minValue(AIdirs[1][0],
			AIdirs[1][1], AIdirs[1][2], alpha, beta, m, grid.slice(0),
			P1dir, P1cx, P1cy));

		pathValue[2] = Math.max(alpha, this.minValue(AIdirs[2][0],
			AIdirs[2][1], AIdirs[2][2], alpha, beta, m, grid,
			P1dir, P1cx, P1cy));

		if (pathValue[0]>pathValue[1] && pathValue[0]>pathValue[2])
			return AIdirs[0][0];
		else if (pathValue[1]>pathValue[0] && pathValue[1]>pathValue[2])
			return AIdirs[1][0];
		else if (pathValue[2]>pathValue[0] && pathValue[2]>pathValue[1])
			return AIdirs[2][0];
	},

	// The maxValue determines the best possible move the AI can make
	maxValue : function(P1dir, P1cx, P1cy,alpha,beta,m,grid, AIdir, AIcx,AIcy)
	{
		if (this.illegalMove(grid, AIdir, AIcx, AIcy, 2)) return alpha;
		var AIdirs = this.directionOptions(AIdir, AIcx,AIcy);

		var newgrid = this.copyGrid(grid, AIcx, AIcy);
		alpha=Math.max(alpha,this.minValue(AIdirs[0][0],
			AIdirs[0][1],AIdirs[0][2],alpha,beta,m,newgrid,
			P1dir,P1cx, P1cy));
		if (alpha >= beta) return alpha;

		newgrid = this.copyGrid(grid, AIcx, AIcy);
		alpha=Math.max(alpha,this.minValue(AIdirs[1][0],
			AIdirs[1][1],AIdirs[1][2],alpha,beta,m,newgrid,
			P1dir,P1cx, P1cy));
		if (alpha >= beta) return alpha;

		newgrid = this.copyGrid(grid, AIcx, AIcy);
		alpha=Math.max(alpha,this.minValue(AIdirs[2][0],
			AIdirs[2][1],AIdirs[2][2],alpha,beta,m,newgrid,
			P1dir,P1cx, P1cy));
		if (alpha >= beta) return alpha;

		return alpha;
	},

	// The minValue determines the best possible move the oponent can make
	minValue : function(AIdir, AIcx,AIcy,alpha,beta,m,grid, P1dir, P1cx, P1cy)
	{
		if (this.illegalMove(grid, P1dir, P1cx, P1cy, 2)) return beta;
		m = m-1;
		if (m===0) return this.terminalValue(grid,AIdir, AIcx,AIcy,
			P1dir, P1cx, P1cy);
		var P1dirs = this.directionOptions(P1dir, P1cx, P1cy);

		var newgrid = this.copyGrid(grid, P1cx, P1cy);
		beta=Math.min(beta,this.maxValue(P1dirs[0][0],
			P1dirs[0][1],P1dirs[0][2],alpha,beta,m,newgrid,
			AIdir, AIcx,AIcy));
		if(beta<=alpha) return beta;

		newgrid = this.copyGrid(grid, P1cx, P1cy);
		beta=Math.min(beta,this.maxValue(P1dirs[1][0],
			P1dirs[1][1],P1dirs[1][2],alpha,beta,m,newgrid,
			AIdir, AIcx,AIcy));
		if(beta<=alpha) return beta;

		newgrid = this.copyGrid(grid, P1cx, P1cy);
		beta=Math.min(beta,this.maxValue(P1dirs[2][0],
			P1dirs[2][1],P1dirs[2][2],alpha,beta,m,newgrid,
			AIdir, AIcx,AIcy));
		if(beta<=alpha) return beta;

		return beta;
	},
	
	// Returns a terminal value estimating the best move
	terminalValue : function(grid,AIdir, AIcx,AIcy,P1dir, P1cx, P1cy)
	{
		if (AIdir === 'North') AIcy--;
		else if (AIdir === 'South') AIcy++;
		else if (AIdir === 'West') AIcx--;
		else AIcx++;

		return this.freeVertex(grid, AIdir, AIcx, AIcy);
	},

	// Counts free verticies straight ahead 
	freeVertex : function(grid, direction, cx, cy)
	{
		if (cx < 1 || cy < 1 || cx >= (VERTICES_PER_ROW-1) ||
			cy >= (VERTICES_PER_ROW-1)) return 0;
		var counter = 0;
		var x = cx;
		var y = cy;
		switch (direction)
		{
			case 'North':
				while(y>0)
				{
					if (grid[x][--y]===0) counter++;
					else return counter;
				}
				break;
			case 'South':
				while(y<VERTICES_PER_ROW-1)
				{
					if (grid[x][++y]===0) counter++;
					else return counter;
				}
				break;
			case 'East':
				while(x<VERTICES_PER_ROW-1)
				{
					if (grid[++x][y]===0) counter++;
					else return counter;
				}
				break;
			default:
				while(x>0)
				{
					if (grid[--x][y]===0) counter++;
					else return counter;
				}
		}
		return counter;
	}
};
