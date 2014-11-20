//===================
// util
//===================

"use strict";

var util = {


// RANGES
// ======

clampRange: function(value, lowBound, highBound) {
    if (value < lowBound) {
	value = lowBound;
    } else if (value > highBound) {
	value = highBound;
    }
    return value;
},

wrapRange: function(value, lowBound, highBound) {
    while (value < lowBound) {
	value += (highBound - lowBound);
    }
    while (value > highBound) {
	value -= (highBound - lowBound);
    }
    return value;
},

isBetween: function(value, lowBound, highBound) {
    if (value < lowBound) { return false; }
    if (value > highBound) { return false; }
    return true;
},


// RANDOMNESS
// ==========

randRange: function(min, max) {
    return (min + Math.random() * (max - min));
},


// MISC
// ====

square: function(x) {
    return x*x;
},

// COLOR GENERATORS
// ================

hexToRGB: function (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
},

generateColors: function() {
    var color = '#'+(Math.random().toString(16) + '000000').slice(2, 8); //16777215 is ffffff in hexadecimal
    var result = this.hexToRGB(color);
    var halo_color = 'rgba(' + result.r + ',' + result.g + ',' + result.b + ',' + HALO_ALPHA + ')';
    return {color: color, halo_color: halo_color, result: result}
},


// DISTANCES
// =========

distSq: function(x1, y1, x2, y2) {
    return this.square(x2-x1) + this.square(y2-y1);
},

wrappedDistSq: function(x1, y1, x2, y2, xWrap, yWrap) {
    var dx = Math.abs(x2-x1),
	dy = Math.abs(y2-y1);
    if (dx > xWrap/2) {
	dx = xWrap - dx;
    };
    if (dy > yWrap/2) {
	dy = yWrap - dy;
    }
    return this.square(dx) + this.square(dy);
},


// CANVAS OPS
// ==========

clearCanvas: function (ctx) {
    var prevfillStyle = ctx.fillStyle;
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = prevfillStyle;
},

strokeCircle: function (ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
},

fillCircle: function (ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
},

fillBox: function (ctx, x, y, w, h, style) {
    var oldStyle = ctx.fillStyle;
    ctx.fillStyle = style;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = oldStyle;
},

drawLine: function(ctx, x1, y1, x2, y2, lineWidth, style) {
    var oldStyle = ctx.strokeStyle;
    var oldLineWidth = ctx.lineWidth;
    ctx.strokeStyle = style;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1,y1);  
    ctx.lineTo(x2,y2);
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = oldStyle;
    ctx.lineWidth = oldLineWidth;
},

linearInterpolate : function(a, b, p)
{
    return (b - a) * p + a;
},

writeText : function(ctx, score, style)
{
    ctx.font="15px Helvetica";
    ctx.textAlign = 'center';
    ctx.fillStyle = style;
    ctx.fillText(score , g_canvas.width / 2, SCORE_POSY);
},

};
