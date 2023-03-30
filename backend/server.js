require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const app = express();
const http = require("http");
const server = http.createServer(app);
const config = require("./config");
const user = require("./user");
const socketio = require("socket.io");
const Matter = require("matter-js");
const CookieParser = require("http-cookie-manager");

const TicTacToe = require("./TicTacToe");

const rateLimiter = rateLimit({
    windowMs: 5 * 1000,
    max: 60,
    message: "You have reached the maximun number of requests"
});

const corsConfig = {
    origin: process.env.CLIENT_URL,
    credentials: true
};

setInterval(function()
{
    user.deleteExpiredTokens(function(){});
}, 30 * 1000);

let games = []; //[gameID/roomID, gameUrl, [sockets], gameData]

app.use(cors(corsConfig));

app.use(rateLimiter);
app.use(express.json());

//if the cookie exists, returns the cookie's value else returns null
function getCookieValue(cookie)
{
    if(cookie)
        return cookie._value;
    return null;
}

app.post("/server", function(req, res)
{
    let cookieManager = CookieParser.parseFrom(!req.headers.cookie ? "" : req.headers.cookie);

    if(req.body["requestID"] == "sign_up")
    {
        user.createUser(req.body["firstName"], req.body["lastName"], req.body["username"], req.body["password"], req.body["confirmPassword"], function(err, data)
        {
            if(data[1] == 0)
            {
                user.getLoginToken(req.body["username"], function(err, newData)
                {
                    if(!err)
                    {
                        cookieManager.setCookieBy("token", newData);
                        cookieManager.getCookieBy("token").setHttpOnly(true);
                        cookieManager.setHeaders(res);

                        res.send({message: data[0], code: data[1], success: true});
                    }
                });
            }
            else
            {
                res.send({message: data[0], code: data[1], success: false});
            }
        });
    }
    else if(req.body["requestID"] == "login")
    {
        user.loginUser(req.body["username"], req.body["password"], function(err, data)
        {
            if(err)
                res.send({message: data[0], code: data[1], success: false});
            else
            {
                user.getLoginToken(req.body["username"], function(err, newData)
                {
                    cookieManager.setCookieBy("token", newData);
                    cookieManager.getCookieBy("token").setHttpOnly(true);
                    cookieManager.setHeaders(res);

                    res.send({message: data[0], code: data[1], success: true});
                });
            }
        });
    }
    else if(req.body["requestID"] == "logout")
    {
        user.logoutUser(getCookieValue(cookieManager.getCookieBy("token")), function(err)
        {
            if(!err)
            {
                cookieManager.getCookieBy("token").setMaxAge(1);
                cookieManager.setHeaders(res);

                res.send({success: true});
            }
        });
    }
    else if(req.body["requestID"] == "auth_token")
    {
        user.getUsernameWithToken(getCookieValue(cookieManager.getCookieBy("token")), function(err, data)
        {
            if(err)
                res.send({success: false});
            else
                res.send({success: true});
        });
    }
    else if(req.body["requestID"] == "get_login_token")
    {
        res.send({token: getCookieValue(cookieManager.getCookieBy("token"))});
    }
    else if(req.body["requestID"] == "user_exists")
    {
        user.userExists(req.body["username"], function(err, data)
        {
            if(!err)
                res.send({success: true});
        })
    }
    else if(req.body["requestID"] == "send_friend_request")
    {
        user.getUsernameWithToken(getCookieValue(cookieManager.getCookieBy("token")), function(err, data)
        {
            if(!err)
            {
                user.sendFriendRequest(req.body["username"], data, function(err, data)
                {
                    let success = false;
                    if(!err)
                        success = true;
                    res.send({message: data[0], code: data[1], success: success});
                });
            }
        });
    }
    else if(req.body["requestID"] == "get_friends")
    {
        user.getUsernameWithToken(getCookieValue(cookieManager.getCookieBy("token")), function(err, data)
        {
            if(!err)
            {
                user.getFriends(data, function(err, friendsData)
                {
                    if(!err)
                        res.send({result: friendsData, success: true});
                    else
                        res.send({success: false});
                });
            }
        });
    }
    else if(req.body["requestID"] == "get_friend_requests")
    {
        user.getUsernameWithToken(getCookieValue(cookieManager.getCookieBy("token")), function(err, data)
        {
            if(!err)
            {
                user.getFriendRequests(data, function(err, requestsData)
                {
                    if(!err)
                        res.send({result: requestsData, success: true});
                    else
                        res.send({success: false});
                });
            }
        });
    }
    else if(req.body["requestID"] == "accept_friend_request")
    {
        user.getUsernameWithToken(getCookieValue(cookieManager.getCookieBy("token")), function(err, data)
        {
            if(!err)
            {
                user.acceptFriendRequest(data, req.body["username"], function(err, data)
                {
                    if(!err)
                        res.send({success: true});
                    else
                        res.send({success: false});
                });
            }
        });
    }
    else if(req.body["requestID"] == "decline_friend_request")
    {
        user.getUsernameWithToken(getCookieValue(cookieManager.getCookieBy("token")), function(err, data)
        {
            if(!err)
            {
                user.declineFriendRequest(data, req.body["username"], function(err, data)
                {
                    if(!err)
                        res.send({success: true});
                    else
                        res.send({success: false});
                });
            }
        });
    }
    else
    {
        res.send({success: false});
    }
});

server.listen(config.port, () => {});

const io = socketio(server, {cors: corsConfig});

let sockets = []; //list of sockets that are currently online

io.on("connection", (socket) =>
{
    socket.on("send_game_invite", (args, callback) =>
    {
        user.getUsernameWithToken(args.token, function(err, data)
        {
            if(err)
                return;
            
            for(let i = 0; i < sockets.length; i++)
            {
                if(sockets[i].data.username == args.toUser)
                {
                    sockets[i].emit("game_invite_sent", {gameUrl: args.gameUrl, fromUser: data});
                    console.log("SENT");
                    callback(["Sent request to " + args.toUser, 0])
                    return;
                }
            }

            callback(["User isn't online", 3]);
        });
    });

    socket.on("auth_user", (args, callback) =>
    {
        user.getUsernameWithToken(args.token, function(err, data)
        {
            if(err)
                return;
            
            socket.data.username = data;
        });
    });
    
    socket.on("accept_game_invite", (args, callback) =>
    {
        if(args.token == undefined || args.fromUser == undefined || args.gameUrl == undefined)
            return;

        user.getUsernameWithToken(args.token, function(err, data)
        {
            console.log(args);
            if(!err)
            {
                let gameID = user.createToken(); //generate a game id

                for(let i = 0; i < sockets.length; i++)
                    if(sockets[i].data.username == args.fromUser)
                    {
                        games.push([gameID, args.gameUrl, [sockets[i], socket], {}]); //create a new game

                        sockets[i].join("game-" + gameID); //from-user joins
                        sockets[i].data.gameID = gameID;
                        sockets[i].emit("send_to_game", {gameUrl: args.gameUrl, toUser: data});
                    }

                socket.join("game-" + gameID); //to-user joins
                socket.data.gameID = gameID;

                if(args.gameUrl == "first")
                {
                    let boxA = Matter.Bodies.rectangle(400, 200, 80, 80);
                    let ground = Matter.Bodies.rectangle(400, 610, 810, 60, {isStatic: true});

                    let engine = Matter.Engine.create();

                    Matter.Composite.add(engine.world, [ground, boxA]);

                    let runner = Matter.Runner.create();

                    games[games.length - 1][3] = {boxA: boxA, ground: ground, runner: runner, engine: engine};

                    Matter.Runner.run(runner, engine);
                }
                else if(args.gameUrl == "tic_tac_toe")
                {
                    games[games.length - 1][3] = {board: [[-1, -1, -1],[-1, -1, -1],[-1, -1, -1]], turn: Math.floor(Math.random() * 2)};
                }
            }
        });
    });

    socket.on("decline_game_invite", (args, callback) =>
    {
        user.getUsernameWithToken(args.token, function(err, data)
        {
            if(!err)
            {
                for(let i = 0; i < sockets.length; i++)
                    if(sockets[i].data.username == args.fromUser)
                    {
                        sockets[i].emit("game_invite_declined", {gameUrl: args.gameUrl, toUser: data});
                    }
            }
        });
    });

    socket.on("cancel_game_invite", (args, callback) =>
    {
        user.getUsernameWithToken(args.token, function(err, data)
        {
            if(!err)
            {
                for(let i = 0; i < sockets.length; i++)
                    if(sockets[i].data.username == args.username)
                    {
                        sockets[i].emit("game_invite_canceled", {gameUrl: args.gameUrl, username: data});
                        callback(["Success", 0]);
                    }
            }
        });
    });

    socket.on("first_game_move", (args) =>
    {
        for(let i = 0; i < games.length; i++)
        {
            if(games[i][0] == args.gameID)
            {
                
                Matter.Body.applyForce(games[i][3].boxA, games[i][3].boxA.position, Matter.Vector.create(0, -0.3));
                io.to("game-" + games[i][0]).emit("game_tick", {boxA: games[i][3].boxA.velocity});
            }
        }
    });

    socket.on("tic_tac_toe_is_turn", (args, callback) =>
    {
        user.getUsernameWithToken(args.token, function(err, data)
        {
            if(!err)
            {
                for(let i = 0; i < games.length; i++)
                    if(games[i][0] == socket.data.gameID)
                    {
                        if(games[i][2][games[i][3].turn].data.username == data)
                            callback(true);
                        else
                            callback(false);
                    }
            }  
        });
    });

    socket.on("tic_tac_toe_move", (args, callback) =>
    {
        if(args.row < 0 || args.row > 3 || args.column < 0 || args.column > 3)
        {
            callback(["Coords given are out of bounds", -1]);
            return;
        }

        user.getUsernameWithToken(args.token, function(err, data)
        {
            console.log(data);
            if(err)
                return;
            
            for(let i = 0; i < games.length; i++)
            {
                if(games[i][0] == socket.data.gameID)
                {
                    let turnName = games[i][2][games[i][3].turn].data.username;
                    let turnIndex = games[i][3].turn;
                    console.log(turnName);
                    console.log(turnIndex);

                    //check if it's the users turn
                    if(turnName == data)
                    {
                        console.log(games[i][3].board[args.row][args.column]);
                        //check if the spot is empty
                        if(games[i][3].board[args.row][args.column] == -1)
                        {
                            games[i][3].board[args.row][args.column] = turnIndex; //place where the player selected

                            let status = TicTacToe.checkStatus(games[i][3].board);

                            for(let playerIndex = 0; playerIndex < 2; playerIndex++)
                            {
                                let statusMessage = "";

                                if(status == playerIndex)
                                    statusMessage = "You won!";
                                else if(status == TicTacToe.getOppositePlayer(playerIndex))
                                    statusMessage = "You lost";
                                else if(status == -1)
                                    statusMessage = "The game is still going";
                                else if(status == -2)
                                    statusMessage = "The game is a draw";

                                games[i][2][playerIndex].emit("tic_tac_toe_status", {status: status, statusMessage: statusMessage});
                            }

                            games[i][3].turn = TicTacToe.getOppositePlayer(turnIndex); //change the turn to the next player

                            io.to("game-" + games[i][0]).emit("tic_tac_toe_tick", {board: games[i][3].board});
                        }
                    }
                }
            }
        });
    });

    socket.on("disconnect", (args) =>
    {
        //find the socket that disconnected
        for(let i = 0; i < sockets.length; i++)
            if(sockets[i].handshake.address == socket.handshake.address)
            {
                sockets.splice(i, 1); //remove the socket from the socket list
                break;
            }
        

        console.log(`socket ${socket.id} has diconnected (${socket.handshake.address})`);
    });

    sockets.push(socket);

    console.log(`socket ${socket.id} has connected (${socket.handshake.address})`);
});

setInterval(function()
{
    console.log("Socket Count: " + sockets.length + " | Game Count: " + games.length);
}, 500);

setInterval(function()
{
    // for(let i = 0; i < games.length; i++)
    // {
    //     if(games[i][1] == "First")
    //     {
    //         // console.log(games[i][3].boxA.position);
    //         // console.log(games[i][0]);
    //         io.to("game-" + games[i][0]).emit("game_tick", {boxA: games[i][3].boxA.position});
    //     }
    // }
}, 0);

console.log("\x1b[36mServer started on port " + config.port + "\x1b[0m");