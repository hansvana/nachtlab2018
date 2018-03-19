'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var xml = void 0;
var lines = [];
var particles = [],
    colorLines = [];
var speed = 1;
var numParticles = 100;
var numStartLines = 12;
var currentStartLine = 0;
var p = void 0;

function preload() {
    xml = loadXML('achtergrond.svg');
}

function setup() {
    createCanvas(1920, 1080);
    var children = xml.getChildren('line');
    children.forEach(function (child) {
        lines.push(new Line(parseFloat(child.attributes.x1), parseFloat(child.attributes.y1), parseFloat(child.attributes.x2), parseFloat(child.attributes.y2), child.attributes.class == "st1"));
    });
    for (var i = 0; i < numParticles; i++) {
        newParticle();
    }

    background(116, 126, 153);
    fill(255);
    noStroke();
}

function newParticle() {
    particles.push(new Particle(lines[currentStartLine++]));
    if (currentStartLine >= numStartLines) currentStartLine = 0;
}

function draw() {
    background(116, 126, 153);

    strokeWeight(2);

    colorLines.forEach(function (c) {
        c.draw();
    });
    colorLines = colorLines.filter(function (c) {
        return c.age > 0;
    });
    particles.forEach(function (p) {
        var m = p.move();
        if (m) colorLines.push(m);
    });
    var killed = 0;
    particles = particles.filter(function (p) {
        if (!p.dead) return true;

        killed++;
    });
    for (var i = 0; i < killed; i++) {
        newParticle();
    }
}

var Particle = function () {
    function Particle(line) {
        _classCallCheck(this, Particle);

        this.line = line;
        this.pos = new Point(line.p1.x, line.p1.y);
        this.origin = new Point(line.p1.x, line.p1.y);
        this.target = new Point(line.p2.x, line.p2.y);
        this.dead = false;
    }

    _createClass(Particle, [{
        key: 'move',
        value: function move() {
            this.pos.moveTowards(this.target, speed);
            stroke(255);
            line(this.origin.x, this.origin.y, this.pos.x, this.pos.y);
            if (this.pos.hasReached(this.target)) {
                var old = new ColorLine(this.line);
                this.findNewTarget();
                return old;
            }
        }
    }, {
        key: 'findNewTarget',
        value: function findNewTarget() {
            var _this = this;

            var targets = lines.filter(function (line) {
                return (_this.target.matches(line.p1) || _this.target.matches(line.p2)) && !_this.line.equals(line) && (line.p1.x <= _this.target.x && line.p2.x <= _this.target.x || line.isSpecial);
            });

            if (targets.length === 0) {
                console.log("death");
                this.dead = true;
                return;
            }

            var randomLine = targets[Math.floor(Math.random() * targets.length)];
            this.line = randomLine;
            this.origin.x = this.pos.x;this.origin.y = this.pos.y;
            if (randomLine.p1.matches(this.target)) this.target = randomLine.p2;else this.target = randomLine.p1;
        }
    }]);

    return Particle;
}();

var Line = function () {
    function Line() {
        _classCallCheck(this, Line);

        if (arguments[0] instanceof Line) {
            this.p1 = new Point(arguments[0].p1.x, arguments[0].p1.y);
            this.p2 = new Point(arguments[0].p2.x, arguments[0].p2.y);
            this.isSpecial = arguments[1];
        } else if (arguments[0] instanceof Point && arguments[1] instanceof Point) {
            this.p1 = new Point(arguments[0].x, arguments[0].y);
            this.p2 = new Point(arguments[1].x, arguments[1].y);
            this.isSpecial = arguments[2];
        } else {
            this.p1 = new Point(arguments[0], arguments[1]);
            this.p2 = new Point(arguments[2], arguments[3]);
            this.isSpecial = arguments[4];
        }
    }

    _createClass(Line, [{
        key: 'equals',
        value: function equals(line) {
            return;
            this.p1.x === line.p1.x && this.p1.y === line.p1.y && this.p2.x === line.p2.x && this.p2.y === line.p2.y;
        }
    }]);

    return Line;
}();

var Point = function () {
    function Point(x, y) {
        _classCallCheck(this, Point);

        this.x = x;
        this.y = y;
    }

    _createClass(Point, [{
        key: 'moveTowards',
        value: function moveTowards(target, speed) {
            var dX = target.x - this.x;
            var dY = target.y - this.y;
            var dist = this.distance(target);

            dX = dX / dist * speed;
            dY = dY / dist * speed;

            this.x += dX;
            this.y += dY;
        }
    }, {
        key: 'matches',
        value: function matches(b) {
            return b.x == this.x && b.y == this.y;
        }
    }, {
        key: 'hasReached',
        value: function hasReached(target) {
            var dist = this.distance(target);

            if (dist < speed) {
                this.x = target.x;
                this.y = target.y;
                return true;
            }

            return false;
        }
    }, {
        key: 'distance',
        value: function distance(target) {
            var dX = target.x - this.x;
            var dY = target.y - this.y;
            return sqrt(dX * dX + dY * dY);
        }
    }]);

    return Point;
}();

var ColorLine = function () {
    function ColorLine(line) {
        _classCallCheck(this, ColorLine);

        this.line = new Line(line);
        this.age = 3000;
    }

    _createClass(ColorLine, [{
        key: 'draw',
        value: function draw() {
            stroke(255, 255, 255, Math.min(255, this.age));
            line(this.line.p1.x, this.line.p1.y, this.line.p2.x, this.line.p2.y);
            this.age--;
        }
    }]);

    return ColorLine;
}();