const qs = document.querySelector.bind(document);

const LensType = {
    Concave: "Concave",
    Convex: "Convex"
}

class World {
    constructor(p, lenses, entities) {
        this.p = p;
        this.sf = 0.25;
        this.lenses = lenses.sort((a, b) => a.x - b.x);
        this.entities = entities;
    }

    scale({ x, y }) {
        return {
            x: this.sf * (x + (this.p.width / 2)),
            y: this.sf * (y + (this.p.height / 2))
        }
    }

    display() {
        this.p.line(0, this.p.height / 2, this.p.width, this.p.height / 2);
        this.lenses.forEach((l) => {
            l.display(this);
        });
        this.entities.forEach((e) => {
            e.display(this);
            e.raytrace(this);
        });
    }

    selectEntity(name) {
        const es = this.entities.filter((e) => e.name == name);
        if (es.length > 0) { 
            return es[0];
        }
        return null;
    }

    selectLens(index) {
        if (index < this.lenses.length) { 
            return this.lenses[index];
        }
        return null;
    }
}

class Lens {
    constructor({
        x = 0,
        y = 0,
        h = 0,
        fl = 0,
        type = LensType.Convex,
    }) {
        this.x = x;
        this.y = y;
        this.h = h;
        this.fl = fl;
        this.type = type;
    }

    display(world) {
        const { x: sx, y: sy } = world.scale({ x: this.x, y: this.y });
        world.p.line(sx, sy, sx, sy + this.h);

        const { x: flx1, y: fly } = world.scale({ x: -this.fl, y: 0 });
        const { x: flx2, y: _ } = world.scale({ x: this.fl, y: 0 });
        world.p.circle(flx1, fly, 10);
        world.p.circle(flx2, fly, 10);
    }
}

class Entity {
    constructor(name, {
        x = 0,
        y = 0,
        w = 0,
        h = 0
    }) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.p = 0;
    }

    display(world) {
        const { x: sx, y: sy } = world.scale({ x: this.x, y: this.y });
        world.p.fill(51);
        world.p.rect(sx, sy, this.w, this.h);
        world.p.fill(255);
        world.sf = Math.max((this.x - 200) / 100, 1);
    }

    move(x) {
        this.p = 0;
        this.x += x;
    }

    moveTo(x) {
        this.p = 0;
        this.x = x;
    }

    raytrace(world) {

        const lens = world.lenses.filter((l) => l.x > this.x)[0];
        
        const w = this.w;
        const h = this.h;
        const o = -this.x - w / 2;
        const f = lens.fl;
        const i = (f*o)/(o-f);
        const H = h/(o/i);
        const W = w/(o/i);

        //const hyp = Math.sqrt(Math.pow(i, 2) + Math.pow(H, 2));
        const { x: ox, y: oy } = world.scale({ x: -o, y: this.y });
        const { x: ix, y: iy } = world.scale({ x: i, y: H });
        const { x: lx, y: ly } = world.scale({ x: lens.x, y: lens.y + (lens.h / 2) });
        const { x: flx, y: hy } = world.scale({ x: lens.x + lens.fl, y: h - oy });

        // perpendicular, left focal, straight

        const objVec = world.p.createVector(ox, oy);
        const perpMid = world.p.createVector(lx, oy);
        const lfMid = world.p.createVector(lx, iy);
        const strMid = world.p.createVector(lx, oy + h);

        const perpLxr = p5.Vector.lerp(objVec, perpMid, this.p < 1 ? this.p : 1);
        world.p.line(ox, oy, perpLxr.x, perpLxr.y);

        const lfLxr = p5.Vector.lerp(objVec, lfMid, this.p < 1 ? this.p : 1);
        world.p.line(ox, oy, lfLxr.x, lfLxr.y);

        const strLxr = p5.Vector.lerp(objVec, strMid, this.p < 1 ? this.p : 1);
        world.p.line(ox, oy, strLxr.x, strLxr.y);

        if (i < 0) { 
            //world.p.circle(lx, oy, 20);
            //world.p.circle(flx, ly, 20);
            const perpVec = world.p.createVector(250000, 250000*((ly - oy) / (flx - lx)));
            const perpEnd = p5.Vector.lerp(perpMid, perpVec, this.p < 1 ? 0 : this.p - 1);
            const lfVec = world.p.createVector(5000, iy);
            const lfEnd = p5.Vector.lerp(lfMid, lfVec, this.p < 1 ? 0 : this.p - 1);
            const strVec = world.p.createVector(5000, 5000*(h/o));
            const strEnd = p5.Vector.lerp(strMid, strVec, this.p < 1 ? 0 : this.p - 1);
            world.p.line(lx, oy, perpEnd.x, perpEnd.y);
            world.p.line(lx, iy, lfEnd.x, lfEnd.y);
            world.p.line(lx, oy + h, strEnd.x, strEnd.y);
            world.p.drawingContext.setLineDash([5, 5]); 
        }

        const imgVec = world.p.createVector(ix, iy);
        const perpEnd = p5.Vector.lerp(perpMid, imgVec, this.p < 1 ? 0 : this.p - 1);
        const lfEnd = p5.Vector.lerp(lfMid, imgVec, this.p < 1 ? 0 : this.p - 1);
        const strEnd = p5.Vector.lerp(strMid, imgVec, this.p < 1 ? 0 : this.p - 1);
        world.p.line(lx, oy, perpEnd.x, perpEnd.y);
        world.p.line(lx, iy, lfEnd.x, lfEnd.y);
        world.p.line(lx, oy + h, strEnd.x, strEnd.y);

        this.imgx = i;
        this.imgy = H;
        if (this.p < 2) {
            this.p += 0.01;
        } else if (this.p >= 2) {
            // result
            world.p.rect(ix - W / 2, iy - H, W, H);
        }
        world.p.drawingContext.setLineDash([]);
    }
}

let world;
let tracer = function(p) {
    const div = qs("div#container");

    p.setup = function() {
        let canvas = p.createCanvas(
            div.offsetWidth - window.innerWidth * 0.4,
            div.offsetHeight
        );
        canvas.parent("container");
        canvas.class("simulation");
        
        world = new World(p, [], []);
        world.lenses = [
            new Lens({ 
                x: 0, 
                y: -(p.height - 20) / 2, 
                h: p.height - 20, 
                fl: 100, 
                type: LensType.Convex
            })
        ];
        world.entities = [
            new Entity("main", {
                x: -50,
                y: -20,
                w: 5,
                h: 20
            })
        ];
    }

    p.draw = function() {
        p.background(255);
        world.display();

        const lens = world.selectLens(0);
        qs("#ltype").innerHTML = lens.fl < 0 ? "Concave" : "Convex";
        qs("#fl").innerHTML = `${lens.fl}mm`;

        const entity = world.selectEntity("main");
        qs("#objx").innerHTML = `${entity.x}mm`;
        qs("#imgx").innerHTML = `${entity.imgx.toFixed(3)}mm`;
    }
}

let p5tracer;
qs("script#p5js").addEventListener("load", () => {
    /* magic */
    p5tracer = new p5(tracer);
});

let connected = false;
window.receive(data => {
    if (data == "oleft") {
        const m = world.selectEntity("main");
        if (Math.abs(m.x) + 5 <= 300) {
            m.move(-5);
        }
    } else if (data == "oright") {
        const m = world.selectEntity("main");
        if (Math.abs(m.x) - 5 >= 30) {
            m.move(5);
        }
    } if (data == "fldec") {
        const l = world.selectLens(0);
        l.fl -= 5;
    } else if (data == "flinc") {
        const l = world.selectLens(0);
        l.fl += 5;
    } else if (data == "connect") {
        connected = true;
    } else if (data == "disconnect") {
        connected = false;
    }
});

setInterval(() => {
    if (connected) { return; }
    const m = world.selectEntity("main");
    const n = Math.ceil(-(Math.round(Math.random() * 270) + 30) / 5) * 5
    m.moveTo(n);
}, 10000);