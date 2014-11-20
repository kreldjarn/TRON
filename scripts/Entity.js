// ======
// ENTITY
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


function Entity() {};

Entity.prototype.setup = function (descr) {

    // Apply all setup properies from the (optional) descriptor
    for (var property in descr) {
        this[property] = descr[property];
    }
    
    // Get my (unique) spatial ID
    this._spatialID = spatialManager.getNewSpatialID();
    
    // I am not dead yet!
    this._isDeadNow = false;
};

//Set the x/y coordinates for an entity.
Entity.prototype.setPos = function (cx, cy) {
    this.cx = cx;
    this.cy = cy;
};

//Returns x and y coordinates for an entity.
Entity.prototype.getPos = function () {
    return {posX : this.cx, posY : this.cy};
};

//Returns radius for an entity.
Entity.prototype.getRadius = function () {
    return 0;
};

//Returns spatial ID for an entity.
Entity.prototype.getSpatialID = function () {
    return this._spatialID;
};

//Kills an entity
Entity.prototype.kill = function () {
    this._isDeadNow = true;
};

//Returns the entity we hit.
Entity.prototype.findHitEntity = function () {
    var pos = this.getPos();
    return spatialManager.findEntityInRange(
        pos.x, pos.y, this.getRadius()
    );
};

// This is just little "convenience wrapper"
Entity.prototype.isColliding = function () {
    return this.findHitEntity();
};

//Wrap an entity position around the edges of the grid.
Entity.prototype.wrapPosition = function () {
    this.cx = util.wrapRange(this.cx, 0, g_canvas.width);
    this.cy = util.wrapRange(this.cy, 0, g_canvas.height);
};