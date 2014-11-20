// =======================
//         Wind
//========================

function Wind()
{
	this.cx = Math.floor(Math.random() * VERTICES_PER_ROW);
	this.cy = Math.floor(Math.random() * VERTICES_PER_ROW);
	this.velX = Math.random() * 3;
	this.velY = 0;
}

Wind.prototype.getPos = function()
{
	return {x: this.cx, y: this.cy};
};

Wind.prototype.getVel = function()
{
	return {x: this.velX, y: this.velY};
};

Wind.prototype.update = function(du)
{
	if (Math.random() < 0.01)
	{
		this.cx = Math.floor(Math.random() * VERTICES_PER_ROW);
		this.cy = Math.floor(Math.random() * VERTICES_PER_ROW);
		this.velX = Math.random() * 3;
	}
};

Wind.prototype.render = function(ctx){};