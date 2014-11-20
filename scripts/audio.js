//==================
//    Audio
//==================

document.body.appendChild(g_track);
g_track.play();

var m = document.getElementsByClassName('mute')[0];
m.onclick = function()
{
	if (g_track.paused) g_track.play();
	else g_track.pause();
}