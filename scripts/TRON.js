// =======
// TRON.js
// =======

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

function processDiagnostics(){}


// =================
// RENDER SIMULATION
// =================


function renderTitle(ctx)
{
    ctx.font="15px Helvetica";
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.fillText("Press X to start",
                 g_canvas.width / 2,
                 g_canvas.height / 2 + 75);
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
}


// Kick it off
main.init();
