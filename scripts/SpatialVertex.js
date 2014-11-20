function SpatialVertex()
{
    this._entities = [];
    this._isWall = false;
}

SpatialVertex.prototype.register = function(entity)
{
    var ID = entity.getSpatialID();
    this._entities[ID] = entity;
    this._isWall = true;
};

SpatialVertex.prototype.unregister = function(entity)
{
    var ID = entity.getSpatialID();
    this._isWall = false;
    delete this._entities[ID];
};

SpatialVertex.prototype.setWall = function()
{
    this._isWall = true;
};

SpatialVertex.prototype.clearWall = function()
{
    this._isWall = false;
}

SpatialVertex.prototype.isWall = function()
{
    return this._isWall;
};

SpatialVertex.prototype.reset = function()
{
    this._isWall = false;
    for (var e in this._entities)
    {
        delete this._entities[e];
    }
};

SpatialVertex.prototype.getPos = function()
{
    return {x: this.x, y: this.y};
};

SpatialVertex.prototype.setPos = function(x, y)
{
    this.x = x;
    this.y = y;
};