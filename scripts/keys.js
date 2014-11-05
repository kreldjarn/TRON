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
        setKey(e.keyCode);
    };
    var handleKeyup = function(e)
    {
        clearKey(e.keyCode);
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
    // setKey and clearKey are called by AI functions
    var setKey = function(keyCode)
    {
        state[keyCode] = true;
    };
    var clearKey = function(keyCode)
    {
        state[keyCode] = false;
    };

    return {
        getState : getState,
        setKey   : setKey,
        clearKey : clearKey,
        eatKey   : eatKey
    };
})();