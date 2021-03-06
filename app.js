var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var app = express();
var passport = require("passport");
var debug = require("debug")("btcn06:server");
var http = require("http");

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || "8080");
app.set("port", port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
const socketIo = require("socket.io");
const io = socketIo(server);

console.log("sxdcfvgbhn");
//--------------------------------------------------------------view engine setup4
require("./middlewares/session")(app);
require("./middlewares/passport")(app);
var bodyParser = require("body-parser");
app.use(bodyParser.text({limit: "20MB"}));

let roomId = 0;
let pairs = 0;
let room = [];
let slot = [];
let rooms = {};
let stateRoom = {};
io.on("connection", socket => {
    socket.on("find", username => {
        // if (!rooms.username) {
        socket.join(roomId);
        rooms[username] = roomId;
        socket.emit("get-room", roomId, pairs + 1);
        if (pairs === 0) {
            slot[0] = socket;
            pairs++;
        } else {
            stateRoom[roomId] = {
                history: [],
            };
            slot[1] = socket;
            room[roomId] = slot;
            socket.nsp.in(roomId).emit(`have-enough`, roomId);
            pairs = 0;
            roomId++;
        }
    });
    socket.on("request", (codeReq, room, num) => {
        console.log(room, num, codeReq, "request_undo");
        socket.in(room).emit("haveRequest", codeReq, num);
    });
    socket.on("LoseAcception", r => {
        console.log("LoseAcception");
        socket.in(r).emit("ReqLoseBeAccepted");
    });
    socket.on("askForLose", room => {
        console.log("lose");
        socket.in(room).emit("askForLose_req");
    });
    socket.on("start-chat", (room, name, avt) => {
        console.log("start chat", room, name, avt);
        socket.in(room).emit("start-chat", name, avt);
    });
    socket.on("chat", (room, mess) => {
        console.log("chat", room, mess);
        socket.in(room).emit("chat", mess);
    });
    socket.on("have-enough", () => {});
    socket.on("winner", (turn, room) => {
        console.log(turn, room);
    });
    socket.on("request", (room, num) => {
        console.log(room, num, "request_undo");
        socket.in(room).emit("requestForUndo", num);
    });
    socket.on("play", (value, room) => {
        console.log("olapy", value);
        console.log(room);
        socket.in(room).emit("play", value);
    });
    socket.on("accept-request", room => {
        console.log("accept");
        socket.in(room).emit("accept-request");
    });
    socket.on("reject", room => {
        console.log("Reject");
        socket.in(room).emit("beRejected");
    });
    socket.on("leaveRoom", room => {
        socket.in(room).emit("YouAreAlone");
        delete socket;
    });

    socket.on("endGame", Id => {
        delete room[Id];
    });
});
io.on("createGame", function(data) {
    socket.join("room-" + ++rooms);
    socket.emit("newGame", {name: data.name, room: "room-" + rooms});
});

/**N
 * Connect the Player 2 to the room he requested. Show error if room full.
 */
io.on("joinGame", function(data) {
    var room = io.nsps["/"].adapter.rooms[data.room];
    if (room && room.length == 1) {
        socket.join(data.room);
        socket.broadcast.to(data.room).emit("player1", {});
        socket.emit("player2", {name: data.name, room: data.room});
    } else {
        socket.emit("err", {message: "Sorry, The room is full!"});
    }
});

let allowCrossDomain = function(_req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT,    PATCH, DELETE",
    );
    next();
};

app.use(allowCrossDomain);

app.options("*", (_req, res) => {
    res.sendStatus(200);
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(logger("dev"));
app.use(cookieParser());
app.use((req, res, next) => {
    try {
        req.body = JSON.parse(req.body);
    } catch (e) {}
    next();
});

//------------------------------------------------------------routes
app.use("/", require("./routes/index"));
app.use("/user", require("./user/userRoute"));
app.use(
    "/me",
    passport.authenticate("jwt", {session: true}),
    require("./user/meRouter"),
);
//------------------------------------------------------------catch 404 and forward to error handler
app.use((_req, _res, next) => {
    next(createError(404));
});

//------------------------------------------------------------error handler
app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.send(err);
});

/**
 * Module dependencies.
 */

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    debug("Listening on " + bind);
}
module.exports = server;
