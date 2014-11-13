// ========
// MAINLOOP
// ========
/*

The mainloop is one big object with a fairly small public interface
(e.g. init, iter, gameOver), and a bunch of private internal helper methods.

The "private" members are identified as such purely by the naming convention
of having them begin with a leading underscore. A more robust form of privacy,
with genuine name-hiding *is* possible in JavaScript (via closures), but I 
haven't adopted it here.

*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

var KEY_QUIT = 'Q'.charCodeAt(0);
var KEY_CHOOSEGRID = 'G'.charCodeAt(0);
var KEY_ENEMYNUMBER = 'E'.charCodeAt(0);
var KEY_STARTGAME = 'Z'.charCodeAt(0);
var g_gameState = "pregame";


function requestedQuit()
{
    return keys.getState(KEY_QUIT);
}

// Annoying shim for Firefox and Safari
window.requestAnimationFrame = 
    window.requestAnimationFrame ||        // Chrome
    window.mozRequestAnimationFrame ||     // Firefox
    window.webkitRequestAnimationFrame;    // Safari

function mainIterFrame(frameTime) {
    main.iter(frameTime);
}

var TOGGLE_TIMER_SHOW = 'T'.charCodeAt(0);

var main = (function()
{
    // PRIVATE
    // =======
    // "Frame Time" is a (potentially high-precision) frame-clock for animations
    var frameTime_ms = null,
        frameTimeDelta_ms = null,
        isGameOver = false,
        doTimerShow = false;

    var updateClocks = function(frameTime)
    {
        
        // First-time initialisation
        if (frameTime_ms === null) frameTime_ms = frameTime;
        
        // Track frameTime and its delta
        frameTimeDelta_ms = frameTime - frameTime_ms;
        frameTime_ms = frameTime;
    };

    var iterCore = function(dt)
    {
        
        // Handle QUIT
        if (requestedQuit()) {
            gameOver();
            return;
        }
        
        gatherInputs();
        
        if (g_gameState==="pregame"){
            g_startScreen.render(g_ctx);
            g_startScreen.update(dt);
        }
        if (g_gameState==="playing") {
            render(g_ctx);
            update(dt);
            }
    };

    var requestNextIteration = function()
    {
        window.requestAnimationFrame(mainIterFrame);
    };

    var debugRender = function (ctx) {
        
        if (keys.eatKey(TOGGLE_TIMER_SHOW)) doTimerShow = !doTimerShow;
        
        if (!doTimerShow) return;
        
        var y = 350;
        ctx.fillText('FT ' + frameTime_ms, 50, y+10);
        ctx.fillText('FD ' + frameTimeDelta_ms, 50, y+20);
        ctx.fillText('UU ' + g_prevUpdateDu, 50, y+30); 
        ctx.fillText('FrameSync ON', 50, y+40);
    };

    // PUBLIC
    // ======
    var gameOver = function()
    {
        isGameOver = true;
        console.log("gameOver: quitting...");
    };

    var iter = function(frameTime)
    {
        // Use the given frameTime to update all of our game-clocks
        updateClocks(frameTime);
        
        // Perform the iteration core to do all the "real" work
        iterCore(frameTimeDelta_ms);
        
        // Diagnostics, such as showing current timer values etc.
        debugRender(g_ctx);
        
        // Request the next iteration if needed
        if (!isGameOver) requestNextIteration();
    };

    var init = function ()
    {   
        
        g_ctx.fillStyle = "white";
    
        requestNextIteration();
    };

    return {
        gameOver: gameOver,
        iter    : iter,
        init    : init
    };
})();
