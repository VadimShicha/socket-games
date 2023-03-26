const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const http = require("http");
const server = http.createServer(app);
const config = require("./config");
const user = require("./user");
const socketio = require("socket.io");
const cookie = require("cookie");

const rateLimiter = rateLimit({
    windowMs: 5 * 1000,
    max: 50
});

setInterval(function()
{
    user.deleteExpiredTokens(function(){});
}, 30 * 1000);

let gameInvites = []; //[gameName, toUser, fromUser]

app.use(rateLimiter);
app.use(express.json());

app.post("/server", function(req, res)
{
    if(req.body["requestID"] == "sign_up")
    {
        user.createUser(req.body["firstName"], req.body["lastName"], req.body["username"], req.body["password"], req.body["confirmPassword"], function(err, data)
        {
            res.send({message: data[0], code: data[1], success: data[1] == 0});
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
    else if(req.body["requestID"] == "get_game_invites")
    {
        user.getUsernameWithToken(req.body["token"], function(err, data)
        {
            if(!err)
            {
                let invites = gameInvites.filter(invite => invite[1] == data);
                console.log(invites);
                console.log(gameInvites);
                res.send({success: true, result: invites});
            }
            else
            {
                res.send({success: false});
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
    socket.emit()


    socket.on("send_game_invite", (args, callback) =>
    {
        console.log(args);
        user.getUsernameWithToken(args["token"], function(err, data)
        {
            if(!err)
            {
                //check if the user already sent an invite
                for(let i = 0; i < gameInvites.length; i++)
                    if(gameInvites[i][1] == args["toUser"] && gameInvites[i][2] == data)
                    {
                        callback(["Already sent an invite to " + args["toUser"], 1]);
                        return;
                    }
                    else if(gameInvites[i][1] == data && gameInvites[i][2] == args["toUser"])
                    {
                        callback([args["toUser"] + " has already sent an invite to you", 2]);
                        return;
                    }

                for(let i = 0; i < sockets.length; i++)
                {
                    if(sockets[i][1] == args["toUser"])
                    {
                        
                        //gameInvites.push([args["gameName"], args["toUser"], data]);
                        sockets[i][0].emit("game_invite_sent", {gameName: args["gameName"], fromUser: data});
                        console.log("SENT");
                        callback(["Sent request to " + args["toUser"], 0])
                        return;
                    }
                }

                callback(["User isn't online", 3]);
            }
        });
    });

    socket.on("accept_game_invite", (args, callback) =>
    {
        user.getUsernameWithToken(args["token"], function(err, data)
        {
            if(!err)
            {
                // let gameSockets = [];
                // console.log(data);
                // console.log(args["fromUser"]);

                // for(let i = 0; i < sockets.length; i++)
                //     if(sockets[i][1] == data || sockets[i][1] == args["fromUser"])
                //     {
                //         sockets[i][0].emit("send_to_game", {gameName: args["gameName"]});
                //         //sockets[i][0].join("game");//gameSockets.push(sockets[i]);
                //         console.log(sockets[i][1]);
                //     }
                
                // //console.log(io.of("game").clients.length);
                // gameInvites = gameInvites.filter(invite => !(invite[1] == data && invite[2] == args["fromUser"])); //remove the game invite
                // io.to("game").emit("send_to_game", {gameName: args["gameName"]});

                for(let i = 0; i < sockets.length; i++)
                    if(sockets[i][1] == args["fromUser"])
                    {
                        sockets[i][0].emit("send_to_game", {gameName: args["gameName"], toUser: data});
                        //sockets[i][0].join("game");//gameSockets.push(sockets[i]);
                        //console.log(sockets[i][1]);
                    }
            }
        });
    });

    socket.on("decline_game_invite", (args, callback) =>
    {
        user.getUsernameWithToken(args["token"], function(err, data)
        {
            if(!err)
            {
                for(let i = 0; i < sockets.length; i++)
                    if(sockets[i][1] == args["fromUser"])
                    {
                        sockets[i][0].emit("game_invite_declined", {gameName: args["gameName"], toUser: data});
                    }
                //gameInvites = gameInvites.filter(invite => !(invite[1] == data && invite[2] == args["fromUser"]));
            }
        });
    });

    socket.on("set_username", (args) =>
    {
        user.getUsernameWithToken(args["token"], function(err, data)
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
    console.log("Socket Count: " + sockets.length);
}, 500);

console.log("\x1b[36mServer started on port " + config.port + "\x1b[0m");