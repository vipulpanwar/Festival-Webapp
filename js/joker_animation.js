var canvas = document.getElementById('joker_canvas'), DW, DH,
    CTX = canvas.getContext("2d"),
    particles = [],

    RESOLUTION

DW, DH;

canvas.width = DW = document.documentElement.clientWidth;
canvas.height = DH = document.documentElement.clientHeight;
DW = canvas.width = 400;
DH = canvas.height = 400;

RESOLUTION = DW <= 480 ? 5 : 4; // Resolution of samples. Smaller = more particles. Change this

/* ------------------
  ImageMap()

  takes img and stores color and brightness data

*/
function ImageMap(img) {
    var self = this;
    this.img = img;
    this.src = this.img.src;
    this.width = this.img.width;
    this.height = this.img.height;

    this.res = RESOLUTION;
    this.scale = (function () {
        var difx = DW / self.width,
            dify = DH / self.height;
        if (difx < dify) {
            return difx;
        } else {
            return dify;
        }
    })();

    this.brightnessData = null;
    this.colorData = null;
    this.imgData = this._setData();
}

/* ------------------
  ImageMap._setData(); 

  Create temporary canvas to drawimage and retrive data.
  Sets values of brightnessData, colorData, imgData.

*/
ImageMap.prototype._setData = function () {
    var tempCanvas = document.createElement('canvas'),
        tempCtx = tempCanvas.getContext('2d'),
        imgData,
        colorData = [],
        brightnessData = [];

    tempCanvas.width = this.width;
    tempCanvas.height = this.height;

    tempCtx.drawImage(this.img, 0, 0);

    imgData = tempCtx.getImageData(0, 0, this.width, this.height);
    for (var i = 0, x = 0; i < (imgData.width * imgData.height); i++) {
        var curPixel = i * 4;
        bri = imgData.data[curPixel] + imgData.data[curPixel + 1] + imgData.data[curPixel + 2];

        colorData[i] = [imgData.data[curPixel], imgData.data[curPixel + 1], imgData.data[curPixel + 2]];
        brightnessData[i] = bri;
    };

    this.colorData = colorData;
    this.brightnessData = brightnessData;
    return imgData;
}

ImageMap.prototype.getColorData = function (x, y) {
    return this.colorData[y * this.width + x];
}

ImageMap.prototype.getBrightnessData = function (x, y) {
    return this.brightnessData[y * this.width + x];
}

function Particle(x, y, r, colors) {
    this.x = x;
    this.y = y;
    this.lastx = null;
    this.lasty = null;
    this.targetx = null;
    this.targety = null;

    this.vx = 5; // px/s 
    this.vy = 5; // px/s
    this.terminalv = 1;
    this.av = 50; // alpha %/s

    this.radius = r;
    this.alpha = 1;
    this.colors = typeof colors !== "undefined" ? colors : [0, 0, 0];
    this.color = 'rgba(' + this.colors[0] + ',' + this.colors[1] + ',' + this.colors[2] + ',' + this.alpha + ')';

    this.lastUpdateTime = 0;
}

Particle.prototype.update = function (t) {
    var time = (t - this.lastUpdateTime) / 1000, // in secs
        distx = time * this.vx,
        disty = time * this.vy,
        dista = time * (this.av / 100);

    this.x += distx * (this.targetx - this.x);
    this.y += disty * (this.targety - this.y);

    this.lastUpdateTime = t;
}

Particle.prototype.drawCircle = function (ctx) {
    ctx.beginPath();
    ctx.arc(this.x - .5, this.y - .5, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
}


var Particles = (function () {
    function _renderCircles(ctx, imgMap) {
        var pi = 0;
        for (var i = 0, ii = 0; i < (imgMap.brightnessData.length / imgMap.res); i++) {
            ii = i * imgMap.res;

            var x = ii % imgMap.width,
                y = Math.floor(ii / imgMap.width),
                // r = (765 - imgMap.getBrightnessData(x, y)) / 765,
                r = 1,
                colors = imgMap.getColorData(x, y);

            r = r * ((imgMap.width * imgMap.scale) < DW ? (DH / (imgMap.height / imgMap.res) / 2) : (DW / (imgMap.width / imgMap.res) / 2));

            if (!r || y % imgMap.res != 0) continue;

            x = x * imgMap.scale;
            y = y * imgMap.scale;

            particles[pi] = new Particle(Math.random() * DW, Math.random() * DH, r, colors);
            particles[pi].targetx = x;
            particles[pi].targety = y;
            particles[pi].drawCircle(ctx);
            pi++;
        }

        console.log('Particle count:', pi);

        return particles;
    }


    return {
        renderCircle: _renderCircles,
    }
})();

function init() {
    var imgMap,
        img = new Image();

    img.src = imgURI;
    imgMap = new ImageMap(img);
    particles = Particles.renderCircle(CTX, imgMap);
    loop(0);

}

function loop(t) {
    CTX.clearRect(0, 0, DW, DH);

    for (var i = 0; i < particles.length; i++) {
        particles[i].drawCircle(CTX);
        particles[i].update(t);
    }

    requestAnimationFrame(loop);
}

clickFunction = function () {
    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (p.lastx === null && p.lasty === null) {
            p.lastx = p.targetx;
            p.lasty = p.targety;

            p.targetx = Math.random() * DW;
            p.targety = Math.random() * DH;
            continue;
        }

        p.targetx = p.lastx;
        p.targety = p.lasty;

        p.lastx = null;
        p.lasty = null;
    }
}

// canvas.addEventListener('click', clickFunction);

var img = new Image();

// var imgs = ["./images/joker.jpg","./images/joker2.jpg"]

imgURI = "./images/joker2.jpg";
// imgURI = imgs[Math.floor(Math.random()*imgs.length)];
img.src = imgURI;


img.addEventListener('load', function () {
    init();
    // clickFunction();
});