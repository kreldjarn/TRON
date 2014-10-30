// =================
// KEYBOARD HANDLING
// =================

var keys = (function()
{
    // Private
    // =======
    var state = {};
    var handleKeydown = function(e)
    {
        state[e.keyCode] = true;
    };
    var handleKeyup = function(e)
    {
        state[e.keyCode] = false;
    };
    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("keyup", handleKeyup);


    // Public
    // ======
    var eatKey = function(keyCode)
    {
        var isDown = state[keyCode];
        state[keyCode] = false;
        return isDown;
    };
    var getState = function(keyCode)
    {
        return state[keyCode];
    };

    return {
        getState : getState,
        eatKey   : eatKey
    };
})();