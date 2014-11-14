function Sequencer(sequence)
{
	this.sequence = sequence.slice(0) || [];
}

Sequencer.prototype.pop = function()
{
	var state = null;
	if (this.sequence)
	{
		state = this.sequence[0];
		this.sequence.splice(0, 1);
	}
	return state;
}

Sequencer.prototype.push = function(state)
{
	this.sequence.push(state);
}

Sequencer.prototype.isEmpty = function()
{
	return this.sequence.length === 0;
}
