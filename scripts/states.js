// ======
// States
// ======

var g_states = {
	_state : 0,
	_states : ['title', 'game'],
	_init : {
		title : function()
		{
			entityManager.reset();
			spatialManager.reset();
			entityManager.generateTitle();
		},
		game : function()
		{
			entityManager.reset();
			spatialManager.reset();
			entityManager.generatePlayers();
		}
	},
	getState : function()
	{
		return this._states[this._state];
	},
	setState : function(state)
	{
		this._state = this._states.indexOf(state);
	},
	//Used to begin/end the gamePlay
	toggleState : function()
	{
		this._state = (this._state + 1) % this._states.length;
		this._init[this._states[this._state]]();
	}
};