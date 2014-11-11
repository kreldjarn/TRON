var gravity = 4;

function Vertex(x, y)
{
    this._entities = [];
    this.isWall = false;
    this.isWally = false;
    this.debug = false;

    this.x = x;
    this.y = y;
    /*******************
     *  VERTLET STUFF  *
     *******************/
    this.pullX = x;
    this.pullY = y;
    this.velX = 0;
    this.velY = 0;
    this.pinX = null;
    this.pinY = null;
    this.constraints = [];
}

Vertex.prototype.register = function(entity)
{
    var ID = entity.getSpatialID();
    this._entities[ID] = entity;
    this.isWall = true;
};

Vertex.prototype.unregister = function(entity)
{
    var ID = entity.getSpatialID();
    this.isWall = false;
    delete this._entities[ID];
};

Vertex.prototype.reset = function()
{
    this.isWall = false;
    this.isWally = false;
};

Vertex.prototype.getPos = function()
{
    return {x: this.x, y: this.y};
};

Vertex.prototype.setPos = function(x, y)
{
    this.x = x;
    this.y = y;
};

Vertex.prototype.pin = function(px, py)
{
    this.pinX = px;
    this.pinY = py;
}

Vertex.prototype.update = function(du)
{
    if (this.pinX && this.pinY)
    {
        this.x = this.pinX;
        this.y = this.pinY;
        return;
    }
    this.pullX = this.x;
    this.pullY = this.y;

    var players = entityManager.getPlayers();
    for (var i = 0; i < players.length; ++i)
    {
        var pos = players[i].getPos();
        pos = spatialManager.getVertex(pos.x, pos.y).getPos();
        var dist = util.distSq(pos.x, pos.y, this.x, this.y);

        if (dist < 8000)
        {
            var scale = (dist > 2000) ? (8000/dist) : 4;
            var vel = players[i].getVel();
            this.pullX -= vel.x * du * scale;
            this.pullY -= vel.y * du * scale;
        }
    }

    this.applyForce(0, gravity * du);
    /******************
     *  VERLET STUFF  *
     ******************/
    duSq = du * du;

    var nx = this.x + ((this.x - this.pullX) * 0.99) + ((this.velX / 2) * duSq);
    var ny = this.y + ((this.y - this.pullY) * 0.99) + ((this.velY / 2) * duSq);

    this.pullX = this.x;
    this.pullY = this.y;

    this.x = nx;
    this.y = ny;

    this.velX = 0;
    this.velY = 0;
};

Vertex.prototype.render = function(ctx, vtx)
{
    if (this.constraints.length === 0) return;
    /*
    // If we don't pass a second vertex into the render function, we only render
    // the constraints that bind the vertices together.
    if (!vtx)
    {
        for (var i = 0; i < this.constraints.length; ++i)
        {
            this.constraints[i].render(ctx);
        }
    }
    */
    if (this.constraints.length < 2 || !vtx) return;
    ctx.beginPath();
    ctx.moveTo(vtx.x, vtx.y);
    ctx.lineTo(this.constraints[0].vtx2.x, this.constraints[0].vtx2.y);
    ctx.lineTo(this.x, this.y);
    ctx.lineTo(this.constraints[1].vtx2.x, this.constraints[1].vtx2.y);
    ctx.closePath();

    // Ideally, we would want to calculate a normal vector to the plane and use
    // this to pick the color on the plane (i.e. whether the it is 'in shadow'
    // or not). Instead we fake it.
    var offset = (this.x - vtx.x) + (this.y - vtx.y);
    offset *= 0.25;

    var coeficcient = Math.round((Math.abs(offset)/VERTEX_MARGIN) * 255);
    if (coeficcient > 200)
        coeficcient = 200;
    ctx.fillStyle = "rgba(" + coeficcient + ", 65, " + (200 - coeficcient) +
                    ", " + util.linearInterpolate(0.25, 2, coeficcient/255.0) +
                    ")";
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.stroke();
};

Vertex.prototype.applyConstraints = function(du)
{
    // ATTN
    // Currently, cannot be pinned to a falsy coord
    if (this.pinX && this.pinY)
    {
        this.setPos(this.pinX, this.pinY);
        return;
    }

    for (var i = 0; i < this.constraints.length; ++i)
    {
        this.constraints[i].apply(du);
    }

    this.x = util.clampRange(this.x, 0, g_canvas.width);
    this.y = util.clampRange(this.y, 0, g_canvas.height);
};

Vertex.prototype.constrainBy = function(vertex)
{
    this.constraints.push(new Constraint(this, vertex));
};

Vertex.prototype.spliceConstraint = function(constraint)
{
    this.constraints.splice(this.constraints.indexOf(constraint), 1);
};

Vertex.prototype.applyForce = function(fx, fy)
{
    this.velX += fx;
    this.velY += fy;
};

// Constraint represents the attraction force between two vertices
function Constraint(vtx1, vtx2)
{
    this.vtx1 = vtx1;
    this.vtx2 = vtx2;
    this.length = VERTEX_MARGIN;
}

Constraint.prototype.apply = function(du)
{
    var pos1 = this.vtx1.getPos(),
        pos2 = this.vtx2.getPos();

    var dX = pos1.x - pos2.x,
        dY = pos1.y - pos2.y,
        dist = Math.sqrt(dX * dX + dY * dY),
        delta = (this.length - dist) / dist;

    var px = dX * delta * 4 * du;
    var py = dY * delta * 4 * du;

    // This is a hack to make up for the fact that the top (pinned) row does
    // not assert any force on the next row below.
    if (this.vtx2.pinX && this.vtx2.pinY)
    {
        this.vtx1.setPos(pos1.x + px * 2, pos1.y + py * 2);
    }
    else
    {
        this.vtx1.setPos(pos1.x + px, pos1.y + py);
        this.vtx2.setPos(pos2.x - px, pos2.y - py);
    }
    
};

Constraint.prototype.render = function(ctx)
{
    var pos1 = this.vtx1.getPos(),
        pos2 = this.vtx2.getPos();
    ctx.moveTo(pos1.x, pos1.y);
    ctx.lineTo(pos2.x, pos2.y);
};