const express = require("express");
const app = express();
const http = require("http");
const nunjucks = require("nunjucks")
const fs = require("fs");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

nunjucks.configure(["views", "sims"], { 
    autoescape: true, 
    express: app 
});

app.use(express.static(__dirname + "/sims"));
app.use("/static", express.static(__dirname + "/static"));

app.get('/:roomID?', (req, res) => {
    const cid = req.params.roomID;
    const did = req.query.roomID;
    const sim = req.query.sim;
    const data = {
        version: cid ? "connect" : "display",
        croom: cid,
        droom: did,
        sims: fs.readdirSync("./sims"),
        active: sim
    }
    res.render("index.html", data);
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on("join", (room) => {
        console.log(`Joined room ${room}`);
        socket.join(room);
    });
    socket.on("leave", () => {
        console.log(`Left room ${room}`);
    }); 
    socket.on("name_query", (room, callback) => {
        io.timeout(1000).to(room).emit("name_query", (err, sim) => {
            callback(sim[0])
        });
    })
    socket.on("fetch", (name, version, callback) => {
        let data = {
            version: version
        };
        if (!fs.readdirSync("./sims").includes(name)) { callback(""); return; }
        fs.readFile(`./sims/${name}/${name}.html`, "utf8", (error, buffer) => {
            callback(nunjucks.renderString(buffer, data));
        })
    });
    socket.on("refresh", (room, id, callback) => {
        io.to(room).emit("refresh", id);
        callback();
    });
    socket.on("event", (room, data) => {
        io.to(room).emit("event", data);
    });
    socket.on("clients", (room, callback) => {
        const clients = io.sockets.adapter.rooms.get(room);
        callback(clients ? clients.size : 0);
    })
    socket.on("disconnect", () => {
        console.log("user disconnected");
    })
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});