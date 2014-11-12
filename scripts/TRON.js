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


// ====================
// CREATE INITIAL SHIPS
// ====================

function createInitialShips() {

    entityManager.generateShip({
        cx : 200,
        cy : 200
    });
    
}

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

function updateSimulation(du)
{
    processDiagnostics();
    spatialManager.update(du);
    entityManager.update(du);
}

// GAME-SPECIFIC DIAGNOSTICS

var g_allowMixedActions = true;
var g_useGravity = false;
var g_useAveVel = true;
var g_renderSpatialDebug = false;

var KEY_SPATIAL = 'X'.charCodeAt(0);

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


// GAME-SPECIFIC RENDERING

function renderSimulation(ctx)
{
    
            spatialManager.render(ctx);
            entityManager.render(ctx);


    //if (g_renderSpatialDebug) spatialManager.render(ctx);
}


// =============
// PRELOAD STUFF
// =============

var g_images = {};

function requestPreloads() {

    var requiredImages = {
        grid   : "https://notendur.hi.is/tap4/tronImages/gridBG600x800.jpg",
        titleN   : "https://notendur.hi.is/tap4/tronImages/title_NoN_s.png",
        titleNoInnerO  : "https://notendur.hi.is/tap4/tronImages/title_no_inner_o_s.png",
        titleNoOuterO  : "https://notendur.hi.is/tap4/tronImages/title_no_outer_o_s.png",
        titleNoT   : "https://notendur.hi.is/tap4/tronImages/title_no_T_s.png",
        titleReg: "https://notendur.hi.is/tap4/tronImages/title_Reg_s.png",
        titleS100H50   : "https://notendur.hi.is/tap4/tronImages/title_s100_h50_s.png",
        gridTransparent : "https://notendur.hi.is/tap4/tronImages/gridTransparent.png"
        //ship   : "https://notendur.hi.is/~pk/308G/images/ship.png",
        //ship2  : "https://notendur.hi.is/~pk/308G/images/ship_2.png",
        //rock   : "https://notendur.hi.is/~pk/308G/images/rock.png"
    };

    imagesPreload(requiredImages, g_images, preloadDone);
}

var g_sprites = {};

function preloadDone() {

    g_sprites.grid = new Sprite(g_images.grid);
    g_sprites.titleN = new Sprite(g_images.titleN);
    g_sprites.titleNoInnerO = new Sprite(g_images.titleNoInnerO);
    g_sprites.titleNoOuterO = new Sprite(g_images.titleNoOuterO);
    g_sprites.titleNoT = new Sprite(g_images.titleNoT);
    g_sprites.titleReg = new Sprite(g_images.titleReg);
    g_sprites.titleS100H50 = new Sprite (g_images.titleS100H50);
    g_sprites.gridTransparent = new Sprite (g_images.gridTransparent);
    //g_sprites.ship  = new Sprite(g_images.ship);
    //g_sprites.ship2 = new Sprite(g_images.ship2);
    //g_sprites.rock  = new Sprite(g_images.rock);
    //g_sprites.bullet = new Sprite(g_images.ship);
    //g_sprites.bullet.scale = 0.25;

    //entityManager.init();
    //createInitialShips();

    main.init();
}

// retina
//var dpr = window.devicePixelRatio || 1;
//g_canvas.width *= dpr;
//g_canvas.height *= dpr;
//g_canvas.getContext("2d").scale(dpr, dpr);
//

// Kick it off
requestPreloads();
//main.init();