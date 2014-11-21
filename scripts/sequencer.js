// =========
// Sequencer
// =========


function Sequencer(sequence, loop)
{
	this.sequence = sequence.slice(0) || [];
	this.reset_sequence = sequence || [];
	this.loop = loop || false;
}

Sequencer.prototype.pop = function()
{
	var state = null;
	if (this.sequence.length)
	{
		state = this.sequence[0];
		this.sequence.splice(0, 1);
	}
	else if (this.reset_sequence && this.loop)
	{
		this.reset();
		return this.pop();
	}
	return state;
}

Sequencer.prototype.push = function(state)
{
	this.sequence.push(state);
}

Sequencer.prototype.isEmpty = function()
{
	return this.sequence.length === 0 && !this.loop;
}

Sequencer.prototype.reset = function()
{
	this.sequence = this.reset_sequence.slice(0);
}