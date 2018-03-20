let xml;
const lines = [];
let particles = [], colorLines = [];
const speed = 2;
const numParticles = 200;
const numStartLines = 12;
let currentStartLine = 0;
let p;

function preload() {
    xml = loadXML('achtergrond2.svg');
}

function setup() {
    createCanvas(1920, 1080);
    const children = xml.getChildren('line');
    children.forEach( child => {
        lines.push( new Line(
            parseFloat(child.attributes.x1),
            parseFloat(child.attributes.y1),
            parseFloat(child.attributes.x2),
            parseFloat(child.attributes.y2),
            child.attributes.stroke == "#FA110D"
        ));
    });
    for (let i = 0; i < numParticles; i++){
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
    background(116,126,153);
    
    strokeWeight(2);
    
    colorLines.forEach(c => {
        c.draw();
    });
    colorLines = colorLines.filter(c => {
        return c.age > 0;
    });
    //console.log(particles.length);
    particles.forEach(p => {
        let m = p.move();
        if (m) colorLines.push(m);      
    })
    let killed = 0;
    particles = particles.filter(p => {
        if (!p.dead)
            return true;
        
        killed++;
    })
    for (let i = 0; i < killed; i++) newParticle();
}

class Particle {
    constructor(line) {
        this.line = line;
        this.pos = new Point(line.p1.x, line.p1.y);
        this.origin = new Point(line.p1.x, line.p1.y);
        this.target = new Point(line.p2.x, line.p2.y);
        this.dead = false;
    }

    move() {
        this.pos.moveTowards(this.target, speed);
        // fill(255,0,0);
        // ellipse(this.pos.x, this.pos.y, 4, 4);
        stroke(255);
        line(this.origin.x, this.origin.y, this.pos.x, this.pos.y);
        if (this.pos.hasReached(this.target)){
            const old = new ColorLine(this.line);
            this.findNewTarget();
            return old;
        }
    }

    findNewTarget() {
        const targets = lines.filter( line => {
            return  (this.target.matches(line.p1) || this.target.matches(line.p2)) &&
                    (!this.line.equals(line)) &&
                    (
                        ((line.p1.x <= this.target.x) && (line.p2.x <= this.target.x)) ||
                        line.isSpecial
                    )
        })

        if (targets.length === 0) {
            //console.log("death");
            this.dead = true;
            return;
        }
        
        const randomLine = targets[Math.floor(Math.random()*targets.length)];
        this.line = randomLine;
        this.origin.x = this.pos.x; this.origin.y = this.pos.y;
        if (randomLine.p1.matches(this.target)) this.target = randomLine.p2;
        else this.target = randomLine.p1;
    }
}

class Line {
    constructor() {
        if (arguments[0] instanceof Line){
            this.p1 = new Point(arguments[0].p1.x, arguments[0].p1.y);
            this.p2 = new Point(arguments[0].p2.x, arguments[0].p2.y);
            this.isSpecial = arguments[0].isSpecial;
        } else if (arguments[0] instanceof Point && arguments[1] instanceof Point){
            this.p1 = new Point(arguments[0].x, arguments[0].y);
            this.p2 = new Point(arguments[1].x, arguments[1].y);
            this.isSpecial = arguments[2];
        } else {
            this.p1 = new Point(arguments[0], arguments[1]);
            this.p2 = new Point(arguments[2], arguments[3]);
            this.isSpecial = arguments[4];
        }   
    }

    equals(line) {
        return
            this.p1.x === line.p1.x &&
            this.p1.y === line.p1.y &&
            this.p2.x === line.p2.x &&
            this.p2.y === line.p2.y;
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    moveTowards(target, speed) {
        let dX = target.x - this.x;
        let dY = target.y - this.y;
        const dist = this.distance(target);
        
        dX = (dX / dist) * speed;
        dY = (dY / dist) * speed;

        this.x += dX;
        this.y += dY;
    }

    matches(b) {
        return b.x == this.x && b.y == this.y;
    }

    hasReached(target) {
        const dist = this.distance(target);

        if (dist < speed){
            this.x = target.x;
            this.y = target.y;
            return true;
        }

        return false;
    }

    distance(target) {
        let dX = target.x - this.x;
        let dY = target.y - this.y;
        return sqrt(dX * dX + dY * dY);
    }
}

class ColorLine {
    constructor(line) {
        this.line = new Line(line);
        this.age = 255;
    }

    draw() {
        stroke(255,255,255,this.age);
        line(this.line.p1.x, this.line.p1.y,this.line.p2.x, this.line.p2.y);
        this.age-=0.5;
    }
}

window.setTimeout(()=>{
    location.reload();
}, 900000)