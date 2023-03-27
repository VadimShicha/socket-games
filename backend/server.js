const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const http = require("http");
const server = http.createServer(app);
const config = require("./config");
const user = require("./user");
const socketio = require("socket.io");
const cookie = require("cookie");
const Matter = require("matter-js");

const rateLimiter = rateLimit({
    windowMs: 5 * 1000,
    max: 50
});

setInterval(function()
{
    user.deleteExpiredTokens(function(){});
}, 30 * 1000);

// let gameInvites = []; //[gameName, toUser, fromUser]
let games = []; //[gameID/roomID, gameName, [sockets], gameData]

app.use(rateLimiter);
app.use(express.json());

app.post("/server", function(req, res)
{
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
                        res.send({message: data[0], code: data[1], token: newData, success: true});
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
            {
                res.send({message: data[0], code: data[1], success: false})
            }
            else
            {
                user.getLoginToken(req.body["username"], function(err, newData)
                {
                    let success = false;

                    if(!err)
                        success = true;

                    res.send({message: data[0], code: data[1], token: newData, success: success});
                });
            }
        });
    }
    else if(req.body["requestID"] == "logout")
    {
        user.logoutUser(req.body["token"], function(err)
        {
            if(!err)
                res.send({success: true});
        });
    }
    else if(req.body["requestID"] == "auth_token")
    {
        user.getUsernameWithToken(req.body["token"], function(err, data)
        {
            if(err)
                res.send({success: false});
            else
                res.send({success: true});
        });
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
        user.getUsernameWithToken(req.body["token"], function(err, data)
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
        user.getUsernameWithToken(req.body["token"], function(err, data)
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
        user.getUsernameWithToken(req.body["token"], function(err, data)
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
        user.getUsernameWithToken(req.body["token"], function(err, data)
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
        user.getUsernameWithToken(req.body["token"], function(err, data)
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

const io = new socketio.Server(server,
{
    cors:
    {
        origin: "http://192.168.0.94:3000"
    }
});

let sockets = []; //[socket, username]

io.on("connection", (socket) =>
{
    socket.on("send_game_invite", (args, callback) =>
    {
        console.log(args);
        user.getUsernameWithToken(args.token, function(err, data)
        {
            if(!err)
            {
                //check if the user already sent an invite
                // for(let i = 0; i < gameInvites.length; i++)
                //     if(gameInvites[i][1] == args["toUser"] && gameInvites[i][2] == data)
                //     {
                //         callback(["Already sent an invite to " + args["toUser"], 1]);
                //         return;
                //     }
                //     else if(gameInvites[i][1] == data && gameInvites[i][2] == args["toUser"])
                //     {
                //         callback([args["toUser"] + " has already sent an invite to you", 2]);
                //         return;
                //     }

                for(let i = 0; i < sockets.length; i++)
                {
                    if(sockets[i][1] == args.toUser)
                    {
                        sockets[i][0].emit("game_invite_sent", {gameName: args.gameName, fromUser: data});
                        console.log("SENT");
                        callback(["Sent request to " + args.toUser, 0])
                        return;
                    }
                }

                callback(["User isn't online", 3]);
            }
        });
    });

    socket.on("accept_game_invite", (args, callback) =>
    {
        user.getUsernameWithToken(args.token, function(err, data)
        {
            if(!err)
            {
                let gameID = user.createToken(); //generate a game id

                for(let i = 0; i < sockets.length; i++)
                    if(sockets[i][1] == args.fromUser)
                    {
                        games.push([gameID, args.gameName, [[sockets[i][0], sockets[i][1]], [socket, data]], {}]); //create a new game

                        sockets[i][0].join("game-" + gameID); //from-user joins
                        sockets[i][0].emit("send_to_game", {gameName: args.gameName, toUser: data, gameID: gameID});
                    }

                socket.join("game-" + gameID); //to-user joins

                if(args.gameName == "First")
                {
                    let boxA = Matter.Bodies.rectangle(400, 200, 80, 80);
                    let ground = Matter.Bodies.rectangle(400, 610, 810, 60, {isStatic: true});

                    let engine = Matter.Engine.create();

                    Matter.Composite.add(engine.world, [ground, boxA]);

                    let runner = Matter.Runner.create();

                    games[games.length - 1][3] = {boxA: boxA, ground: ground, runner: runner, engine: engine};

                    Matter.Runner.run(runner, engine);
                }
                else if(args.gameName == "Tic-Tac-Tac")
                {
                    games[games.length - 1][3] = {board: [[-1, -1, -1],[-1, -1, -1],[-1, -1, -1]], turn: Math.floor(Math.random() * 2)};
                }
                
                callback({gameID: gameID});
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
                    if(sockets[i][1] == args.fromUser)
                    {
                        sockets[i][0].emit("game_invite_declined", {gameName: args.gameName, toUser: data});
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
            if(!err)
            {
                for(let i = 0; i < games.length; i++)
                {
                    if(games[i][0] == args.gameID)
                    {
                        let turn = games[i][2][games[i][3].turn][1];

                        //check if it's the users turn
                        if(turn == data)
                        {
                            //check if the spot is empty
                            if(games[i][3].board[args.row][args.column] == -1)
                            {
                                games[i][3].board[args.row][args.column] = turn;
                                
                                if(turn == 0)
                                    games[i][3].turn = 1;
                                else
                                    games[i][3].turn = 0;

                                io.to(games[i][0]).emit("tic_tac_toe_tick", {board: games[i][3].board});
                            }
                        }
                    }
                }
            }
        });
    });

    socket.on("set_username", (args) =>
    {
        user.getUsernameWithToken(args.token, function(err, data)
        {
            let username = null;

            if(!err)
                username = data;
            
            for(let i = 0; i < sockets.length; i++)
                if(sockets[i][0] == socket)
                    sockets[i][1] = username;
        });
    });

    socket.on("disconnect", (args) =>
    {
        for(let i = 0; i < sockets.length; i++)
        {
            if(sockets[i][0].handshake.address == socket.handshake.address)
            {
                sockets.splice(i, 1);
                break;
            }
        }

        console.log(`socket ${socket.id} has diconnected (${socket.handshake.address})`);
    });

    sockets.push([socket, null]);

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