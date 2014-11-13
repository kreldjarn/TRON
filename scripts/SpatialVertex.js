function SpatialVertex()
{
    this._entities = [];
    this.isWall = false;
    this.isWally = false;
}

SpatialVertex.prototype.register = function(entity)
{
    var ID = entity.getSpatialID();
    this._entities[ID] = entity;
    this.isWall = true;
};

SpatialVertex.prototype.unregister = function(entity)
{
    var ID = entity.getSpatialID();
    this.isWall = false;
    delete this._entities[ID];
};

SpatialVertex.prototype.reset = function()
{
    this.isWall = false;
    this.isWally = false;
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