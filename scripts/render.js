// ==============================
//      GENERIC RENDERING
// ===============================
var g_doClear = true;
var g_doBox = false;
var g_undoBox = false;
var g_doFlipFlop = false;
var g_doRender = true;

function render(ctx) {
    
    // Process various option toggles
    //
    if (keys.eatKey(TOGGLE_BOX)) g_doBox = !g_doBox;
    if (keys.eatKey(TOGGLE_UNDO_BOX)) g_undoBox = !g_undoBox;
    if (keys.eatKey(TOGGLE_FLIPFLOP)) g_doFlipFlop = !g_doFlipFlop;
    if (keys.eatKey(TOGGLE_RENDER)) g_doRender = !g_doRender;
    if (g_doClear) util.clearCanvas(ctx);
    if (g_doBox) util.fillBox(ctx, 200, 200, 50, 50, "red");
    
    
    // The core rendering of the actual game / simulation
    //
    if (g_doRender) renderSimulation(ctx);

    if (g_doFlipFlop) {
        var boxX = 250,
            boxY = g_isUpdateOdd ? 100 : 200;
        
        // Draw flip-flop box
        util.fillBox(ctx, boxX, boxY, 50, 50, "green");
        
        // Display the current frame-counter in the box...
        ctx.fillText(g_frameCounter % 1000, boxX + 10, boxY + 20);
        // ..and its odd/even status too
        var text = g_frameCounter % 2 ? "odd" : "even";
        ctx.fillText(text, boxX + 10, boxY + 40);
    }

    if (g_undoBox) ctx.clearRect(200, 200, 50, 50);
    
    ++g_frameCounter;
}
