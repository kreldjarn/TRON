function Sequencer(sequence)
{
	this.sequence = sequence;
}

Sequencer.prototype.nextState = function()
{
	var state = null;
	if (this.sequence)
	{
		state = this.sequence[0];
		this.sequence.splice(0, 1);
	}
	return state;
}