const tools = require("./tools");
const config = require("./config");
const crypto = require("crypto");
const {MongoClient} = require("mongodb");
const client = new MongoClient(process.env.MONGO_URL);

//create a new user (returns message, code)
/* CODE - MESSAGE
    0 - success
    1 - an arg is empty
    2 - first name has unallowed chars
    3 - last name has unallowed chars
    4 - username has unallowed chars
    5 - password has unallowed chars
    6 - first name too short or long
    7 - last name too short or long
    8 - username too short or long
    9 - username taken
    10 - password too short or long
    11 - password and confirm password don't match
*/
exports.createUser = async function(firstName, lastName, username, password, confirmPassword, callback)
{
    if(firstName == "" || lastName == "" || username == "" || password == "" || confirmPassword == "")
        {callback(true, ["Field not filled out", 1]); return;}

    //check if any of the fields have characters that aren't allowed
    if(!tools.isStringLegal(firstName, config.nameChars))
        {callback(true, ["First name has characters which aren't allowed", 2]); return;}
    if(!tools.isStringLegal(lastName, config.nameChars))
        {callback(true, ["Last name has characters which aren't allowed", 3]); return;}
    if(!tools.isStringLegal(username, config.usernameChars))
        {callback(true, ["Username has characters which aren't allowed", 4]);return;}
    if(!tools.isStringLegal(password, config.passwordChars))
        {callback(true, ["Password has characters which aren't allowed", 5]);return;}

    //check if any of the fields have lengthes which is are too small or big
    if(firstName.length < config.nameMinLength || firstName.length > config.nameMaxLength)
        {callback(true, ["First name needs to be " + config.nameMinLength.toString() + " - " + config.nameMinLength.toString() + " characters", 6]); return;}
    if(lastName.length < config.nameMinLength || lastName.length > config.nameMaxLength)
        {callback(true, ["Last name needs to be " + config.nameMinLength.toString() + " - " + config.nameMaxLength.toString() + " characters", 7]); return;}
    if(username.length < config.usernameMinLength || username.length > config.usernameMaxLength)
        {callback(true, ["Username needs to be " + config.usernameMinLength.toString() + " - " + config.usernameMaxLength.toString() + " characters", 8]); return;}
    if(password.length < config.passwordMinLength || password.length > config.passwordMaxLength)
        {callback(true, ["Password needs to be " + config.passwordMinLength.toString() + " - " + config.passwordMaxLength.toString() + " characters", 10]); return;}

    //check if password and confirm password match
    if (password != confirmPassword)
        {callback(true, ["Password and confirm password don't match", 11]); return;}

    //make first and last names have proper capitalization
    firstName = firstName[0].toUpperCase() + firstName.slice(1).toLowerCase();
    lastName = lastName[0].toUpperCase() + lastName.slice(1).toLowerCase();

    await client.connect();

    client.db(config.database).collection(config.usersTable).insertOne(
    {
        uuid: crypto.randomUUID(),
        firstName: firstName,
        lastName: lastName,
        username: username,
        password: password
    });
    client.close();

    tools.runSQL(`SELECT username FROM ${config.usersTable} WHERE username = "${username}"`, function(err, data)
    {
        if(!err)
        {
            if(data.length == 0)
            {
                //'{"friends": [], "friend_requests": [], "game_invites": []}'
                tools.runSQL(`INSERT INTO ${config.usersTable} VALUES ("${firstName}", "${lastName}", "${username}", "${password}", '{"friends": [], "friend_requests": [], "game_invites": []}')`, function(err, data)
                {
                    if(!err)
                    {
                        console.log(data);
                        callback(null, ["Success", 0]);
                    }
                });
            }
            else
                callback(true, ["Username is already taken", 9]);
        }
    });
};

//login into a user (returns message, code)
/* CODE - MESSAGE
    0 - success
    1 - username doesn't exist
    2 - password is incorrect
*/
exports.loginUser = function(username, password, callback)
{
    tools.runSQL(`SELECT username FROM ${config.usersTable} WHERE username = "${username}"`, function(err, data)
    {
        if(!err)
        {
            if(data.length == 0)
                {callback(true, ["Username doesn't exist", 1]); return;}

            tools.runSQL(`SELECT password FROM ${config.usersTable} WHERE password = "${password}"`, function(err, data)
            {
                if(!err)
                {
                    if(data.length == 0)
                        {callback(true, ["Password is incorrect", 2]); return;}

                    callback(null, ["Success", 0]);
                }
            })
        }
    });
};

//logs out (callback only has 1 argument)
exports.logoutUser = function(token, callback)
{
    exports.getUsernameWithToken(token, function(err, data)
    {
        if(!err)
        {
            exports.deleteLoginToken(data);
            callback(null);
            return;
        }
    });
};

//checks if a username exists
exports.userExists = function(username, callback)
{
    tools.runSQL(`SELECT username FROM ${config.usersTable} WHERE username = "${username}"`, function(err, data)
    {
        if(!err)
        {
            if(data.length == 0)
            {
                callback(true, false);
                return;
            }
            
            callback(null, true);
        }
    });
};

//deletes a users login token
exports.deleteLoginToken = function(username)
{
    tools.runSQL(`DELETE FROM ${config.loginTokensTable} WHERE username = ${username}`, function(err, data){});
};

//generates a random token
exports.createToken = function()
{
    let token = "";

    for(let i = 0; i < config.tokenLength; i++)
        token += config.tokenChars[Math.floor(Math.random() * config.tokenChars.length)];

    return token;
};

exports.deleteExpiredTokens = function(callback)
{
    tools.runSQL(`DELETE FROM ${config.loginTokensTable} WHERE date < ${Date.now() - config.loginTokenExpiration}`, function(err, data)
    {
        callback(err, data);
    });
};

//gets a login token for the username or creates one if it doesn't exist
exports.getLoginToken = function(username, callback)
{
    //command to check if there already is a token for the username
    tools.runSQL(`SELECT token, username FROM ${config.loginTokensTable} WHERE username = "${username}"`, function(err, data)
    {
        if(!err)
        {
            if(data.length != 0)
                {callback(null, data[0]["token"]); return;}

            let token = exports.createToken();

            tools.runSQL(`INSERT INTO ${config.loginTokensTable} VALUES ("${token}", "${username}", ${Date.now()})`, function(err, data)
            {
                if(!err)
                {
                    callback(null, token);
                    return;
                }
            });
        }
    });
};

//checks if a token is valid and returns it in the callback. If it fails returns the errors below:
/* CODE - MESSAGE
    1 - wrong token
    2 - expired token
*/
exports.getUsernameWithToken = function(token, callback)
{
    tools.runSQL(`SELECT username, date FROM ${config.loginTokensTable} WHERE token = "${token}"`, function(err, data)
    {
        if(!err)
        {
            console.log(data);
            if(data.length == 0)
            {
                callback(true, ["Wrong token", 1]);
                return;
            }

            if(data[0]["date"] + config.loginTokenExpiration < Date.now())
            {
                callback(true, ["Token has expired", 2])
                return;
            }

            callback(null, data[0]["username"]);
        }
    });
};

//sends a friend request to a user
/* CODE - MESSAGE
    0 - success
    1 - to user doesn't exist
    2 - request already sent
    3 - user already sent friend request to user sending
    4 - user is already your friend
    5 - request sent to self
*/
exports.sendFriendRequest = function(toUsername, fromUsername, callback)
{
    if(toUsername == fromUsername)
        {callback(true, ["Can't send a friend request to yourself", 5]); return;}

    exports.userExists(toUsername, function(err, data)
    {
        if(data == false)
            {callback(true, ["Username doensn't exist", 1]); return;}

        //check if the user that tried to send a request does already have one from the other person
        tools.runSQL(`SELECT data FROM ${config.usersTable} WHERE username = "${fromUsername}"`, function(err, data)
        {
            if(!err)
            {
                let parsedData = JSON.parse(data[0]["data"]);
                let requestsArr = parsedData["friend_requests"];
                let friendsArr = parsedData["friends"];

                for(let i = 0; i < requestsArr.length; i++)
                {
                    if(toUsername == requestsArr[i])
                        {callback(true, ["User already sent a friend request to you", 3]); return;}
                }

                for(let i = 0; i < friendsArr.length; i++)
                {
                    if(toUsername == friendsArr[i])
                        {callback(true, ["User is already your friend", 4]); return;}
                }

                tools.runSQL(`SELECT data FROM ${config.usersTable} WHERE username = "${toUsername}"`, function(toUserErr, toUserData)
                {
                    if(!toUserErr)
                    {
                        let toUserText = JSON.parse(toUserData[0]["data"]);
                        let toUserFriendsArr = toUserText["friend_requests"];

                        for(let i = 0; i < toUserFriendsArr.length; i++)
                        {
                            if(toUserFriendsArr[i] == fromUsername)
                                {callback(true, ["Request already sent", 2]); return;}
                        }

                        toUserFriendsArr.push(fromUsername);
                        toUserText["friend_requests"] = toUserFriendsArr;

                        tools.runSQL(`UPDATE ${config.usersTable} SET data = '${JSON.stringify(toUserText)}' WHERE username = "${toUsername}"`, function(err, data)
                        {
                            if(!err)
                                {callback(null, ["Friend request sent!", 0]); return;}
                        });
                    }
                });
            }
        });
    });
};

//get all the friends of a user
exports.getFriends = function(username, callback)
{
    tools.runSQL(`SELECT data FROM ${config.usersTable} WHERE username = "${username}"`, function(err, data)
    {
        if(!err)
        {
            callback(null, JSON.parse(data[0]["data"])["friends"]);
            return;
        }

        callback(true, err);
    });
};

//get all the friends of a user
exports.getFriends = function(username, callback)
{
    tools.runSQL(`SELECT data FROM ${config.usersTable} WHERE username = "${username}"`, function(err, data)
    {
        if(!err)
        {
            callback(null, JSON.parse(data[0]["data"])["friends"]);
            return;
        }

        callback(true, err);
    });
};

//get all friend requests of a user
exports.getFriendRequests = function(username, callback)
{
    tools.runSQL(`SELECT data FROM ${config.usersTable} WHERE username = "${username}"`, function(err, data)
    {
        if(!err)
        {
            callback(null, JSON.parse(data[0]["data"])["friend_requests"]);
            return;
        }

        callback(true, err);
    });
};

//accepts a friend request
//acceptUsername is the user that got accepted by the username
//(callback only has 1 argument)
exports.acceptFriendRequest = function(username, acceptUsername, callback)
{
    tools.runSQL(`SELECT username, data FROM ${config.usersTable} WHERE username IN ("${username}", "${acceptUsername}")`, function(err, data)
    {
        console.log(data);
        if(!err)
        {
            if(data.length == 0)
                {callback(true); return;}

            let usernameText = "";
            let acceptUsernameText = "";

            console.log("SDHDJ");
            console.log(usernameText);
            //console.log(data[0]["username"]);


            for(let i = 0; i < 2; i++)
            {
                if(data[i]["username"] == username)
                    usernameText = JSON.parse(data[i]["data"]);
                else if(data[i]["username"] == acceptUsername)
                    acceptUsernameText = JSON.parse(data[i]["data"]);
            }
            console.log(usernameText);

            //remove the friend request
            for(let i = 0; i < usernameText["friend_requests"].length; i++)
                if(usernameText["friend_requests"][i] == acceptUsername)
                    usernameText["friend_requests"].splice(i, 1);

            console.log(usernameText);
            usernameText["friends"].push(acceptUsername);
            acceptUsernameText["friends"].push(username);
            console.log(usernameText);

            tools.runSQL(`UPDATE ${config.usersTable} SET data = '${JSON.stringify(usernameText)}' WHERE username = "${username}"`, function(err, data)
            {
                console.log(data);
                if(!err)
                    tools.runSQL(`UPDATE ${config.usersTable} SET data = '${JSON.stringify(acceptUsernameText)}' WHERE username = "${acceptUsername}"`, function(err, data)
                    {
                        if(!err)
                            {callback(null); return;}
                    });
            });
        }
    });
};

//declines a friend request
//(callback only has 1 argument)
exports.declineFriendRequest = function(username, declineUsername, callback)
{
    tools.runSQL(`SELECT data FROM ${config.usersTable} WHERE username = "${username}"`, function(err, data)
    {
        
        if(!err)
        {
            let text = JSON.parse(data[0]["data"]);

            let found = false;
            for(let i = 0; i < text["friend_requests"].length; i++)
                if(text["friend_requests"][i] == declineUsername)
                    found = true;

            if(!found)
                {callback(true); return;}
            
            //remove the friend request
            for(let i = 0; i < text["friend_requests"].length; i++)
                if(text["friend_requests"][i] == declineUsername)
                    text["friend_requests"].splice(i, 1);
            
            tools.runSQL(`UPDATE ${config.usersTable} SET data = '${JSON.stringify(text)}' WHERE username = "${username}"`, function(err, data)
            {
                if(!err)
                    {callback(null); return;}
            });
        }
    });
};

//