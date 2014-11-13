function SpatialVertex()
{
    this._entities = [];
    this.isWally = false;
}

SpatialVertex.prototype.register = function(entity)
{
    var ID = entity.getSpatialID();
    this._entities[ID] = entity;
    this.isWally = true;
};

SpatialVertex.prototype.unregister = function(entity)
{
    var ID = entity.getSpatialID();
    this.isWally = false;
    delete this._entities[ID];
};

SpatialVertex.prototype.reset = function()
{
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