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

app.use(function(request, response, next) {
    request.io = io;
    next();
});
let roomId = 0;
let pairs = 0;
let room = [];
let slot = [];
io.on("connection", (socket,i) => {
    console.log(i)
    socket.join(roomId);
    socket.emit("get-room", roomId, "you are the " + (pairs + 1));
    if (pairs === 0) {
        slot[0] = socket;
        pairs++;
    } else {
        slot[1] = socket;
        room[roomId] = slot;
        socket.nsp.in(roomId).emit(`have-enough`, roomId);
        socket.in(roomId).emit("nickname");
        pairs = 0;
        roomId++;
    }
    socket.on("have-enough", () => {});
    socket.on("endGame", Id => {
        delete room[Id];
    });
});
io.on("createGame", function(data) {
    socket.join("room-" + ++rooms);
    socket.emit("newGame", {name: data.name, room: "room-" + rooms});
});

/**
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

const bodyParser = require("body-parser");

let allowCrossDomain = function(_req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT,    PATCH, DELETE",
    );
    next();
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: "20mb"}));
app.use(bodyParser.urlencoded({extended: true, limit: "20mb"}));
app.use(allowCrossDomain);
app.options("*", (_req, res) => {
    res.sendStatus(200);
});
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

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
