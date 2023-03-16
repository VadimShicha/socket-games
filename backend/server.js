const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const http = require("http");
const server = http.createServer(app);
const config = require("./config");
const tools = require("./tools");
const user = require("./user");

const rateLimiter = rateLimit({
    windowMs: 10 * 1000,
    max: 50
});

setInterval(function()
{
    user.deleteExpiredTokens(function(){});
}, 30 * 1000);

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
            if(!err)
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
            console.log(data);
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
console.log("\x1b[36mServer started on port " + config.port + "\x1b[0m");