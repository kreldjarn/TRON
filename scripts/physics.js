//==========================
//      Physics
//==========================


var gravity = 2.5;

function Vertex(x, y)
{
    this.x = x;
    this.y = y;
    this.velX = 0;
    this.velY = 0;
    this.pinX = null;
    this.pinY = null;
    this.constraints = [];
}

Vertex.prototype = new SpatialVertex();

Vertex.prototype.pin = function(px, py)
{
    this.pinX = px;
    this.pinY = py;
}

Vertex.prototype.update = function(du)
{
    if (this.pinX && this.pinY)
    {
        this.setPos(this.pinX, this.pinY);
        return;
    }

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
            this.applyForce(vel.x * du * scale * 2,
                            vel.y * du * scale * 2);
        }
    }

    this.applyForce(0, gravity * du);

    duSq = du * du;

    var nextX = this.x + ((this.velX / 2) * duSq),
        nextY = this.y + ((this.velY / 2) * duSq);

    this.x = nextX;
    this.y = nextY;

    this.velX = 0;
    this.velY = 0;
};

Vertex.prototype.render = function(ctx, vtx)
{
    if (this.constraints.length < 2 || !vtx) return;
    ctx.beginPath();
    ctx.moveTo(vtx.x, vtx.y);
    ctx.lineTo(this.constraints[0].vtx2.x, this.constraints[0].vtx2.y);
    ctx.lineTo(this.x, this.y);
    ctx.lineTo(this.constraints[1].vtx2.x, this.constraints[1].vtx2.y);
    ctx.closePath();

    // Ideally, we would want to calculate a normal vector to the plane and use
    // this to pick the color on the plane (i.e. whether the it is 'in shadow'
    // or not). With this approach we could even interpolate between them.
    // Instead we fake it with a hack.
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
    // Currently cannot be pinned to a falsy coord
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
        deltaFrac = (this.length - dist) / dist;

    var px = dX * deltaFrac * 5 * du;
    var py = dY * deltaFrac * 5 * du;

    // This is a hack to make up for the fact that the top (pinned) row does
    // not assert any force on the next row below.
    if (this.vtx2.pinX && this.vtx2.pinY)
    {
        this.vtx1.setPos(pos1.x + px * 2.5, pos1.y + py * 2.5);
    }
    else
    {
        this.vtx1.setPos(pos1.x + px, pos1.y + py);
        this.vtx2.setPos(pos2.x - px, pos2.y - py);
    }
    
};
