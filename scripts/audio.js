//==================
//    Audio
//==================
var g_track = new Audio("https://notendur.hi.is/~keh4/TRON/assets/boats.m4a");
g_track.loop = true;
document.body.appendChild(g_track);
g_track.play();

var m = document.getElementsByClassName('mute')[0];
m.onclick = function()
{
	if (g_track.paused) g_track.play();
	else g_track.pause();
}