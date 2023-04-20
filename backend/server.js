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
const tools = require("./tools");

const TicTacToe = require("./TicTacToe");

const rateLimiter = rateLimit({
    windowMs: 5 * 1000,
    max: 20,
    message: "You have reached the maximun number of requests"
});

const corsConfig = {
    origin: process.env.CLIENT_URL,
    credentials: true
};

setInterval(async function()
{
    await user.deleteExpiredTokens();
}, 30 * 1000);

let games = {}; //[gameUrl, [sockets], gameData]

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

function isValidGameUrl(gameUrl)
{
    if(gameUrl == "first" || gameUrl == "tic_tac_toe")
        return true;
    return false;
}

function setupGame(game)
{
    if(game[0] == "first")
    {
        let boxA = Matter.Bodies.rectangle(400, 200, 80, 80);
        let ground = Matter.Bodies.rectangle(400, 610, 810, 60, {isStatic: true});

        let engine = Matter.Engine.create();

        Matter.Composite.add(engine.world, [ground, boxA]);

        let runner = Matter.Runner.create();

        game[2] = {boxA: boxA, ground: ground, runner: runner, engine: engine};

        Matter.Runner.run(runner, engine);
    }
    else if(game[0] == "tic_tac_toe")
    {
        game[2] = new TicTacToe();

        game[2].startTime();

        game[2].onLoseTime(function()
        {
            for(let i = 0; i < 2; i++)
                game[1][i].emit("tic_tac_toe_tick", {turnIndex: game[2].getTurn()});
        }.bind(game));
    }
}

app.post("/server", async function(req, res)
{
    let cookieManager = CookieParser.parseFrom(!req.headers.cookie ? "" : req.headers.cookie);

    if(req.body["requestID"] == "sign_up")
    {
        let data = await user.createUser(req.body["firstName"], req.body["lastName"], req.body["username"], req.body["password"], req.body["confirmPassword"]);
        
        console.log(data);
        let success = false;

        if(data[1] == 0)
        {
            let token = await user.getLoginToken(req.body["username"]);
            console.log("token: ", token);

            if(token == null)
            {
                res.send({message: "A database error occurred", success: false});
                return;
            }

            cookieManager.setCookieBy("logged_in", "true");
            cookieManager.getCookieBy("logged_in").setMaxAge(config.loginTokenExpiration / 1000);
            cookieManager.setCookieBy("token", token);
            cookieManager.getCookieBy("token").setHttpOnly(true);
            cookieManager.getCookieBy("token").setMaxAge(config.loginTokenExpiration / 1000);
            cookieManager.setHeaders(res);
            success = true;
        }

        res.send({message: data[0], code: data[1], success: success});
    }
    else if(req.body["requestID"] == "login")
    {
        let result = await user.loginUser(req.body["username"], req.body["password"]);

        let success = false;

        if(result[1] == 0)
        {
            let token = await user.getLoginToken(req.body["username"]);
            console.log("token: ", token);

            if(token == null)
            {
                res.send({message: "A database error occurred", success: false});
                return;
            }
            
            cookieManager.setCookieBy("logged_in", "true");
            cookieManager.getCookieBy("logged_in").setMaxAge(config.loginTokenExpiration / 1000);
            cookieManager.setCookieBy("token", token);
            cookieManager.getCookieBy("token").setHttpOnly(true);
            cookieManager.getCookieBy("token").setMaxAge(config.loginTokenExpiration / 1000);
            cookieManager.setHeaders(res);
            success = true;
        }

        res.send({message: result[0], code: result[1], success: success});
    }
    else if(req.body["requestID"] == "logout")
    {
        let result = await user.getUsernameWithToken(getCookieValue(cookieManager.getCookieBy("token")));

        if(result[1] == 0)
        {
            let logoutResult = await user.logoutUser(result[0]);

            if(logoutResult)
            {
                cookieManager.getCookieBy("logged_in").setMaxAge(1);
                cookieManager.getCookieBy("token").setMaxAge(1);
                cookieManager.setHeaders(res);
                res.send({success: true});
                return;
            }

            res.send({success: false});
        }
        else
            res.send({success: false});
    }
    else if(req.body["requestID"] == "get_login_token")
    {
        res.send({token: getCookieValue(cookieManager.getCookieBy("token"))});
    }
    else if(req.body["requestID"] == "send_friend_request")
    {
        let result = await user.getUsernameWithToken(getCookieValue(cookieManager.getCookieBy("token")));
        console.log(result);

        if(result[1] == 0)
        {
            let requestResult = await user.sendFriendRequest(req.body["username"], result[0]);
            let success = false;

            if(requestResult[1] == 0)
                success = true;
        
            res.send({message: requestResult[0], code: requestResult[1], success: success});
        }
        else
            res.send({success: false});
    }
    else if(req.body["requestID"] == "get_friends")
    {
        let result = await user.getUsernameWithToken(getCookieValue(cookieManager.getCookieBy("token")));

        if(result[1] == 0)
        {
            console.log("GET_FRIENDS")
            console.log(result);
            let friends = await user.getFriends(result[0]);
        
            if(friends[1] == 0)
                res.send({result: friends[0], success: true});
            else
                res.send({success: false});
        }
        else
            res.send({success: false});
    }
    else if(req.body["requestID"] == "get_friend_requests")
    {
        let result = await user.getUsernameWithToken(getCookieValue(cookieManager.getCookieBy("token")));

        if(result[1] == 0)
        {
            let requests = await user.getFriendRequests(result[0]);
            console.log("SDHDH");
            console.log(requests);
        
            if(requests[1] == 0)
                res.send({result: requests[0], success: true});
            else
                res.send({success: false});
        }
        else
            res.send({success: false});
    }
    else if(req.body["requestID"] == "accept_friend_request")
    {
        let result = await user.getUsernameWithToken(getCookieValue(cookieManager.getCookieBy("token")));

        if(result[1] == 0)
        {
            let acceptResult = await user.acceptFriendRequest(result[0], req.body["username"]);

            if(acceptResult[1] == 0)
                res.send({success: true});
            else
                res.send({success: false});
        }
        else
            res.send({success: false});
    }
    else if(req.body["requestID"] == "decline_friend_request")
    {
        let result = await user.getUsernameWithToken(getCookieValue(cookieManager.getCookieBy("token")));

        if(result[1] == 0)
        {
            let acceptResult = await user.declineFriendRequest(result[0], req.body["username"]);
            
            if(acceptResult[1] == 0)
                res.send({success: true});
            else
                res.send({success: false});
        }
        else
            res.send({success: false});
    }
    else
    {
        res.send({success: false});
    }
});

server.listen(config.port, () => {});

const io = socketio(server, {cors: corsConfig});

let sockets = {};
let socketsSearching = [];
let guestAmount = 0;

io.on("connection", async(socket) =>
{
    const cookie = socket.handshake.headers.cookie;
    console.log(tools.parseCookie(cookie, "token"));

    let giveGuest = false; //indicator of whether to give a guest accound or not

    //if the user doesn't have a token cookie then give a guest account
    if(tools.parseCookie(cookie, "token") == null)
        giveGuest = true;
    else
    {
        let username = await user.getUsernameWithToken(tools.parseCookie(cookie, "token"));
        console.log(username);

        if(username[1] == 0)
        {
            sockets[username[0]] = socket;
            socket.data.username = username[0];
        }
        else
            giveGuest = true; //if the user's token is invalid give a guest account
    }

    if(giveGuest)
    {
        let guestName = "guest" + guestAmount;
        sockets[guestName] = socket;
        socket.data.username = guestName;
        guestAmount++;
    }

    socket.on("search_for_game", async(args, callback) =>
    {
        if(!isValidGameUrl(args.gameUrl))
        {
            callback(["Not a valid game URL", 1]);
            return;
        }

        for(let i = 0; i < socketsSearching.length; i++)
            if(socketsSearching[i] == socket)
            {
                callback(["Already searching", 1]);
                return;
            }

        socketsSearching.push(socket);

        if(socketsSearching.length >= 2)
        {
            let gameID = user.createToken(); //generate a game id

            games[gameID] = [args.gameUrl, [socketsSearching[0], socketsSearching[1]], {}];

            for(let i = 0; i < 2; i++)
            {
                socketsSearching[i].join("game-" + gameID);
                socketsSearching[i].data.gameID = gameID;
                socketsSearching[i].emit("send_to_game", {gameUrl: args.gameUrl});
            }

            setupGame(games[gameID]);

            socketsSearching.splice(0, 2);
        }
        
        callback(["Searching", 0]);
    });

    socket.on("send_game_invite", async(args, callback) =>
    {
        let result = await user.getUsernameWithToken(tools.parseCookie(cookie, "token"));
        console.log("BLAH: ", result);

        if(result[1] == 0)
        {
            if(sockets[args.toUser] != undefined)
            {
                sockets[args.toUser].emit("game_invite_sent", {gameUrl: args.gameUrl, fromUser: result[0]});
                console.log("SENT");
                callback(["Sent request to " + args.toUser, 0]);
                return;
            }

            callback(["User isn't online", 3]);
        }
        else
            callback(["Fail", -1]);
    });

    socket.on("accept_game_invite", async(args, callback) =>
    {
        if(args.fromUser == undefined || args.gameUrl == undefined || !isValidGameUrl(args.gameUrl))
            return;

        let result = await user.getUsernameWithToken(tools.parseCookie(cookie, "token"));

        if(result[1] == 0)
        {
            let gameID = user.createToken(); //generate a game id

            if(sockets[args.fromUser] != undefined)
            {
                let fromUserSocket = sockets[args.fromUser];
                games[gameID] = [args.gameUrl, [fromUserSocket, socket], {}]; //create a new game

                fromUserSocket.join("game-" + gameID); //from-user joins
                fromUserSocket.data.gameID = gameID;
                fromUserSocket.emit("send_to_game", {gameUrl: args.gameUrl, toUser: result[0]});
            }
            else
            {
                callback(["Failed to send game invite", 1]);
                return;
            }

            socket.data.gameID = gameID;
            sockets[socket.data.username].data.gameID = gameID; //must be done this way. The gameID needs to be updated in the sockets list
            socket.join("game-" + gameID); //to-user joins

            setupGame(games[gameID]);

            callback(["Success", 0]);
        }
    });

    socket.on("decline_game_invite", async(args, callback) =>
    {
        let result = await user.getUsernameWithToken(tools.parseCookie(cookie, "token"));

        if(result[1] == 0)
        {
            if(sockets[args.fromUser] != undefined)
                sockets[args.fromUser].emit("game_invite_declined", {gameUrl: args.gameUrl, toUser: result[0]});
            
        }
    });

    socket.on("cancel_game_invite", async(args, callback) =>
    {
        let result = await user.getUsernameWithToken(tools.parseCookie(cookie, "token"));

        if(result[1] == 0)
        {
            if(sockets[args.username] != undefined)
            {
                sockets[args.username].emit("game_invite_canceled", {gameUrl: args.gameUrl, username: result[0]});
                callback(["Success", 0]);
            }
        }
    });

    socket.on("first_game_move", (args) =>
    {
        // for(let i = 0; i < games.length; i++)
        // {
        //     if(games[i][0] == args.gameID)
        //     {
        //         Matter.Body.applyForce(games[i][3].boxA, games[i][3].boxA.position, Matter.Vector.create(0, -0.3));
        //         io.to("game-" + games[i][0]).emit("game_tick", {boxA: games[i][3].boxA.velocity});
        //     }
        // }
    });

    socket.on("rematch", async(args) =>
    {
        // let result = await user.getUsernameWithToken(tools.parseCookie(cookie, "token"));

        // if(result[1] == 0)
        // {
        //     for(let i = 0; i < games.length; i++)
        //     {
        //         if(games[i][0] == socket.data.gameID)
        //         {
        //             for(let j = 0; j < 2; j++)
        //             {
        //                 if(games[i][2][i].data.username != socket.data.username)
        //                     sockets[i].emit("game_invite_sent", {gameUrl: games[i][1], fromUser: result[0]});
        //             }
        //         }
        //     }
        // }
    });

    socket.on("tic_tac_toe_is_turn", async(args, callback) =>
    {
        // let result = await user.getUsernameWithToken(tools.parseCookie(cookie, "token"));

        // if(result[1] == 0)
        // {
        //     for(let i = 0; i < games.length; i++)
        //         if(games[i][0] == socket.data.gameID)
        //         {
        //             if(games[i][2][games[i][3].turn].data.username == result[0])
        //                 callback(true);
        //             else
        //                 callback(false);
        //         }
        // }
    });

    socket.on("get_game_load", async(callback) =>
    {
        console.log("tic_tac_toe_get_load");
        console.log(sockets[socket.data.username].data);
        //console.log(games[sockets[socket.data.username].data.gameID] == undefined);
        //check if the user exists and if the game exists
        if(sockets[socket.data.username] == undefined || games[sockets[socket.data.username].data.gameID] == undefined)
            callback({success: false});
        else
        {
            let game = games[sockets[socket.data.username].data.gameID];
            let names = [game[1][0].data.username, game[1][1].data.username];

            if(game[0] == "tic_tac_toe")
            {
                let playerIndex = 0;

                if(game[1][1].data.username == socket.data.username)
                    playerIndex = 1;

                console.log("LOAD: " + playerIndex + " TURN: " + game[2].getTurn());
                
                callback({success: true, usernames: names, playerIndex: playerIndex, turnIndex: game[2].getTurn()});
            }
        }
    });

    socket.on("tic_tac_toe_move", async(args, callback) =>
    {
        if(args.row < 0 || args.row > 3 || args.column < 0 || args.column > 3)
        {
            callback(["Coords given are out of bounds", -1]);
            return;
        }

        //let result = await user.getUsernameWithToken(tools.parseCookie(cookie, "token"));

        //if(result[1] == 0)
        {
            let game = games[socket.data.gameID];

            console.log(game);
            console.log(socket.data);

            //check if the game ID is invalid
            if(game == undefined)
                return;
            
            let turnIndex = game[2].getTurn();

            let thisTurn = 0; //the turn of the player who sent the request
            if(game[1][1].data.username == socket.data.username)
                thisTurn = 1;

            if(!game[2].move(thisTurn, args.row, args.column))
                return;

            let status = game[2].getStatus();
            game[2].switchTurn();

            game[2].startTime();

            for(let playerIndex = 0; playerIndex < 2; playerIndex++)
            {
                let statusMessage = "";

                if(status == playerIndex)
                    statusMessage = "You won!";
                else if(status == game[2].getOppositePlayer(playerIndex))
                    statusMessage = "You lost";
                else if(status == -1)
                    statusMessage = "The game is still going";
                else if(status == -2)
                    statusMessage = "The game is a draw";

                //if the game ended
                if(status != -1)
                {
                    delete game[1][playerIndex].gameID;
                }

                game[1][playerIndex].emit("tic_tac_toe_tick", {board: game[2].getBoard(), turnIndex: game[2].getTurn(), status: status, statusMessage: statusMessage});
            }

            //game[2].turn = TicTacToe.getOppositePlayer(turnIndex); //change the turn to the next player

            //io.to("game-" + game[0]).emit("tic_tac_toe_tick", {board: game[2].getBoard(), turnIndex: game[2].getTurn()});

            // // check if it's the users turn
            // if(turnName == result[0])
            // {
            //     // console.log(game[2].board[args.row][args.column]);
            //     // //check if the spot is empty
            //     // if(game[2].board[args.row][args.column] == -1)
            //     // {
            //     //     game[2].board[args.row][args.column] = turnIndex; //place where the player selected

            //     //     let status = TicTacToe.checkStatus(game[2].board);

            //     //     for(let playerIndex = 0; playerIndex < 2; playerIndex++)
            //     //     {
            //     //         let statusMessage = "";

            //     //         if(status == playerIndex)
            //     //             statusMessage = "You won!";
            //     //         else if(status == TicTacToe.getOppositePlayer(playerIndex))
            //     //             statusMessage = "You lost";
            //     //         else if(status == -1)
            //     //             statusMessage = "The game is still going";
            //     //         else if(status == -2)
            //     //             statusMessage = "The game is a draw";

            //     //         game[1][playerIndex].emit("tic_tac_toe_status", {status: status, statusMessage: statusMessage});
            //     //     }

            //     //     // setTimeout(function()
            //     //     // {
            //     //     //     game[2].turn = TicTacToe.getOppositePlayer(turnIndex);
            //     //     // }, 8000, [games, turnIndex]);

            //     //     game[2].turn = TicTacToe.getOppositePlayer(turnIndex); //change the turn to the next player

            //     //     io.to("game-" + game[0]).emit("tic_tac_toe_tick", {board: game[2].board, turnIndex: game[2].turn});
            //     // }
            // }
            
        }
    });

    socket.on("disconnect", (args) =>
    {
        delete sockets[socket.data.username];

        console.log(`\x1b[35msocket ${socket.data.username} has diconnected (${socket.handshake.address})\x1b[0m`);
    });

    console.log(`\x1b[32msocket ${socket.data.username} has connected (${socket.handshake.address})\x1b[0m`);
});

setInterval(function()
{
    console.log("Socket Count: " + sockets.length + " | Game Count: " + games.length);
}, 750);

console.log("\x1b[36mServer started on port " + config.port + "\x1b[0m");