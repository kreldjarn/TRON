// =========
// ASTEROIDS
// =========
/*

A sort-of-playable version of the classic arcade game.


HOMEWORK INSTRUCTIONS:

You have some "TODO"s to fill in again, particularly in:

spatialManager.js

But also, to a lesser extent, in:

Rock.js
Bullet.js
Ship.js


...Basically, you need to implement the core of the spatialManager,
and modify the Rock/Bullet/Ship to register (and unregister)
with it correctly, so that they can participate in collisions.

*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */



/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// =============
// GATHER INPUTS
// =============

function gatherInputs() {
    // Nothing to do here!
    // The event handlers do everything we need for now.
}


// =================
// UPDATE SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `update` routine handles generic stuff such as
// pausing, single-step, and time-handling.
//
// It then delegates the game-specific logic to `updateSimulation`


// GAME-SPECIFIC UPDATE LOGIC

var KEY_TOGGLE_STATE = 'X'.charCodeAt(0);

function updateSimulation(du)
{
    processDiagnostics();
    if (keys.eatKey(KEY_TOGGLE_STATE) &&
        g_states.getState() == 'title')
        g_states.toggleState();
    entityManager.update(du);
    while (du > 1) {
        spatialManager.update(1);
        du -= 1;
    }
    spatialManager.update(du);
    
}

// GAME-SPECIFIC DIAGNOSTICS

var g_allowMixedActions = true;
var g_useGravity = false;
var g_useAveVel = true;
var g_renderSpatialDebug = false;

function processDiagnostics()
{
    //if (eatKey(KEY_SPATIAL)) g_renderSpatialDebug = !g_renderSpatialDebug;
}


// =================
// RENDER SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `render` routine handles generic stuff such as
// the diagnostic toggles (including screen-clearing).
//
// It then delegates the game-specific logic to `gameRender`

function renderTitle(ctx)
{
    ctx.font="30px Courier New";
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.fillText("Press X to start",
                 g_canvas.width / 2,
                 g_canvas.height / 2 + 40);
}


// GAME-SPECIFIC RENDERING

function renderSimulation(ctx)
{
    spatialManager.render(ctx);
    entityManager.render(ctx);
    if (g_states.getState() == 'title')
    {
        renderTitle(ctx);
    }
    //if (g_renderSpatialDebug) spatialManager.render(ctx);
}


// =============
// PRELOAD STUFF
// =============

var g_images = {};

function requestPreloads() {

    var requiredImages = {
        ship   : "https://notendur.hi.is/~pk/308G/images/ship.png",
        ship2  : "https://notendur.hi.is/~pk/308G/images/ship_2.png",
        rock   : "https://notendur.hi.is/~pk/308G/images/rock.png"
    };

    imagesPreload(requiredImages, g_images, preloadDone);
}

var g_sprites = {};

function preloadDone() {

    g_sprites.ship  = new Sprite(g_images.ship);
    g_sprites.ship2 = new Sprite(g_images.ship2);
    g_sprites.rock  = new Sprite(g_images.rock);

    g_sprites.bullet = new Sprite(g_images.ship);
    g_sprites.bullet.scale = 0.25;

    entityManager.init();
    createInitialShips();

    main.init();
}


// Kick it off
//requestPreloads();
main.init();