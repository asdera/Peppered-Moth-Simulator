nums = [0]

function distance(x1, y1, x2, y2) {
    return sqrt((x1 - x2)**2 + (y1 - y2)**2)
}

Margin = 200;
Width = 1200;
Height = 600;
colour = 0;
alleleLength = 20;
alphabet = 'abcdefghijklmnopqrstuvwxyz';
frame = 0;
environment = 100;
mutationRate = 0.05;
mothRate = 10;
birdRate = 40;
disasterRate = 1000;
killRate = 1;

function setup() {
    createCanvas(Width+Margin, Height+Margin);
    textAlign(CENTER, CENTER)
    textSize(42);
    for (var i = 0; i < 15; i++) {
        migrate(random(Margin, Width), random(Margin, Height));
    }
    environment = random(50, 250);
}
// z=sin((1)/(6)x+(1)/(3)y)+cos((1)/(4)y+20)
moths = [];
birds = [];

function draw() {
    background(environment, environment, environment, 50);
    frame++;
    fill("yellow");
    text("Peppered Moth Simulator", (Width+Margin)/2, 50)
    for (var i = moths.length - 1; i >= 0; i--) {
        var moth = moths[i];
        if (moth.destroy) {
			moths.splice(i,1);
		} else {
			moth.update();
		}
    }
    for (var i = 0; i < birds.length; i++) {
        var bird = birds[i];
        if (bird.destroy) {
			birds.splice(i,1);
		} else {
			bird.update();
		}
    }
    if (frame % mothRate == 0) {
        reproduce(random(Margin, Width), random(Margin, Height));
    }
    if ((frame+10) % birdRate == 0) {
        predator();
    }
    if ((frame+20) % disasterRate == 0) {
        disaster(random(Margin, Width), random(Margin, Height));
    }
}

function Moth(x, y, alleles) {
	this.x = x;
    this.y = y;
    this.big = 15;
    this.genotypes = alleles;
    this.phenotypes = [];
    this.gametes = [];
    this.frame = 0;
    this.immune = 300;
    this.rotation = random(0, 2*PI);
    for (var i = 0; i < alleles.length; i++) {
        this.phenotypes.push(alleles[i] != alleles[i].toLowerCase());
    }
    for (var i = 0; i < alleles.length; i++) {
        this.gametes.push(random(alleles[i].split("")));
    }
    this.colour = this.phenotypes.filter(x => x==true).length * 255 / alleleLength;
    this.update = function () {
        this.frame++;
        fill(this.colour);
        ellipse(this.x, this.y, this.big);
        push();
        translate(this.x, this.y);
        rotate(this.rotation);
        ellipse(0, -this.big/2, this.big/2);
        quad(this.big/6, this.big/6, this.big/2, this.big/2, this.big, this.big/6, this.big/6, -this.big/2);
        quad(-this.big/6, this.big/6, -this.big/2, this.big/2, -this.big, this.big/6, -this.big/6, -this.big/2);
        pop();
        this.immune--;
    }
    this.attack = function () {
        if (random(0, 255/killRate) < abs(this.colour - environment) + 10) { // && this.immune < 0
            this.destroy = true;
        } else {
            this.immune = 300;
        }
    }
}

function Bird(x, y, speed) {
	this.x = x;
    this.y = y;
    this.speed = speed;
    this.big = 15;
    this.bigg = 60;
    this.frame = 0;

    this.update = function () {
        this.frame++;
        this.x += this.speed;
        fill("navy");
        // rect(this.x-this.big, this.y-this.bigg, this.big*2, this.bigg*2);
        push();
        translate(this.x, this.y);
        rotate(PI/2*Math.sign(this.speed));
        triangle(-this.bigg/4, 0, 0, this.bigg/2, this.bigg/4, 0)
        triangle(-this.bigg/8, 0, 0, -this.bigg/6, this.bigg/8, 0)
        quad(this.bigg/6, this.big/6, this.bigg/2, this.big/2, this.bigg, this.big/6, this.bigg/6, -this.big/2);
        quad(-this.bigg/6, this.big/6, -this.bigg/2, this.big/2, -this.bigg, this.big/6, -this.bigg/6, -this.big/2);
        pop();
        if (this.x > Width + Margin || this.x < 0) {
            this.destroy = true;
        }
        for (var i = 0; i < moths.length; i++) {
            var moth = moths[i];
            if (abs(this.x-moth.x) <= this.big && abs(this.y-moth.y) < this.bigg) {
                moth.attack();
            }
        }
        if (this.x > Width + Margin || this.x < 0) {
            this.destroy = true;
        }
    }
}

function predator() {
    var c = random([-1, 1]);
    birds.push(new Bird((Width+Margin)/2 + (Width+Margin)*c/2, random(0, Height+Margin), 10 * -c));
}

function migrate(x, y) {
    var alleles = []
    for (var i = 0; i < alleleLength; i++) {
        alleles.push(random([alphabet[i], alphabet[i].toUpperCase()]) + random([alphabet[i], alphabet[i].toUpperCase()]))
    }

    moths.push(new Moth(x, y, alleles));
}

function reproduce(x, y, art=false) {
    var population = moths.concat();
    var sel = 0;
    var close = Width * 10;
    for (var i = 0; i < population.length; i++) {
        var d = distance(x, y, population[i].x, population[i].y);
        if (d < close) {
            sel = i;
            close = d;
        };
    }
    var a = population[sel];
    population.splice(sel, 1);
    
    if (art) {
        sel = 0;
        close = Width * 10;
        for (var i = 0; i < population.length; i++) {
            var d = distance(x, y, population[i].x, population[i].y);
            if (d < close) {
                close = d;
                sel = i;
            };
        }
        var b = population[sel];
    } else {
        var b = random(population);
    }
    line(x, y, a.x, a.y);
    line(x, y, b.x, b.y);
    moths.push(new Moth(x, y, mate(a.gametes, b.gametes)));
}

function mate(p1, p2) {
    var alleles = [];
    for (i = 0; i < p1.length; i++) {
        if (random() < mutationRate) {
            alleles.push(random([alphabet[i], alphabet[i].toUpperCase()]) + random([alphabet[i], alphabet[i].toUpperCase()]))
        } else {
            alleles.push(p1[i] + p2[i]);
        }
    }
    return alleles;
}


function disaster(x, y, art=false) {
    fill("red");
    ellipse(x, y, 200);
    for (var i = 0; i < moths.length; i++) {
        var d = distance(x, y, moths[i].x, moths[i].y);
        if (d < 100) {
            moths[i].destroy = true;
        };
    }
}

function mousePressed () {
    if (mouseButton === LEFT) {
        reproduce(mouseX, mouseY, true);
    } else if (mouseButton === CENTER) {
        environment = random(50, 250);
    } else {
        disaster(mouseX, mouseY);
    }
}

function keyPressed() {
    if (keyCode === 32) {
        environment = random(50, 250);
    }
}








