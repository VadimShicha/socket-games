const tools = require("./tools");
const config = require("./config");
const crypto = require("crypto");
const dbClient = require("./databaseClient");

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
    12 - Database error
*/
exports.createUser = async function(firstName, lastName, username, password, confirmPassword)
{
    if(firstName == "" || lastName == "" || username == "" || password == "" || confirmPassword == "")
        return ["Field not filled out", 1];

    //check if any of the fields have characters that aren't allowed
    if(!tools.isStringLegal(firstName, config.nameChars))
        return ["First name has characters which aren't allowed", 2];
    if(!tools.isStringLegal(lastName, config.nameChars))
        return ["Last name has characters which aren't allowed", 3];
    if(!tools.isStringLegal(username, config.usernameChars))
        return ["Username has characters which aren't allowed", 4];
    if(!tools.isStringLegal(password, config.passwordChars))
        return ["Password has characters which aren't allowed", 5];

    //check if any of the fields have lengthes which is are too small or big
    if(firstName.length < config.nameMinLength || firstName.length > config.nameMaxLength)
        return ["First name needs to be " + config.nameMinLength.toString() + " - " + config.nameMinLength.toString() + " characters", 6];
    if(lastName.length < config.nameMinLength || lastName.length > config.nameMaxLength)
        return ["Last name needs to be " + config.nameMinLength.toString() + " - " + config.nameMaxLength.toString() + " characters", 7];
    if(username.length < config.usernameMinLength || username.length > config.usernameMaxLength)
        return ["Username needs to be " + config.usernameMinLength.toString() + " - " + config.usernameMaxLength.toString() + " characters", 8];
    if(password.length < config.passwordMinLength || password.length > config.passwordMaxLength)
        return ["Password needs to be " + config.passwordMinLength.toString() + " - " + config.passwordMaxLength.toString() + " characters", 10];

    //check if password and confirm password match
    if (password != confirmPassword)
        return ["Password and confirm password don't match", 11];

    //make first and last names have proper capitalization
    firstName = firstName[0].toUpperCase() + firstName.slice(1).toLowerCase();
    lastName = lastName[0].toUpperCase() + lastName.slice(1).toLowerCase();

    let result = await dbClient.findOne(config.usersTable, {username: username});

    //check if the username given is taken
    if(result)
        return ["Username is already taken", 9];

    //add the user to the database
    await dbClient.insertOne(config.usersTable,
    {
        uuid: crypto.randomUUID(),
        firstName: firstName,
        lastName: lastName,
        username: username,
        password: password
    });

    return ["Success", 0];
};

//login into a user (returns message, code)
/* CODE - MESSAGE
    0 - success
    1 - username doesn't exist
    2 - password is incorrect
*/
exports.loginUser = async function(username, password)
{
    let result = await dbClient.findOne(config.usersTable, {username: username, password: password});

    if(result == null)
        return ["Username or password is incorrect"];
    return ["Success", 0];
};

//logs out a user
exports.logoutUser = async function(username)
{
    let result = await dbClient.deleteOne(config.loginTokensTable, {username: username});

    if(result.deletedCount > 0)
        return true;
    return false;
    
};

//checks if a username exists
exports.userExists = async function(username)
{
    let result = await dbClient.findOne(config.usersTable, {username: username});
    return result;
};

//deletes a users login token
exports.deleteLoginToken = function(username)
{
    //tools.runSQL(`DELETE FROM ${config.loginTokensTable} WHERE username = ${username}`, function(err, data){});
};

//generates a random token
exports.createToken = function()
{
    let token = "";

    for(let i = 0; i < config.tokenLength; i++)
        token += config.tokenChars[Math.floor(Math.random() * config.tokenChars.length)];

    return token;
};

exports.deleteExpiredTokens = async function()
{
    let result = await dbClient.deleteMany(config.loginTokensTable, {date: {$lt: Date.now() - config.loginTokenExpiration}});
    console.log("Deleted ", result.deletedCount, " expired tokens");
    // tools.runSQL(`DELETE FROM ${config.loginTokensTable} WHERE date < ${Date.now() - config.loginTokenExpiration}`, function(err, data)
    // {
    //     callback(err, data);
    // });
};

//gets a login token for the username or creates one if it doesn't exist
exports.getLoginToken = async function(username)
{
    //query to check if there already is a token for the username
    let result = await dbClient.findOne(config.loginTokensTable, {username: username});
    
    //check if the token exists
    if(result)
        return result.token;
    

    let token = exports.createToken();

    //add the user to the database
    await dbClient.insertOne(config.loginTokensTable,
    {
        username: username,
        token: token,
        date: Date.now()
    });

    return token;
};

//checks if a token is valid and returns it in the callback. If it fails returns the errors below:
/* CODE - MESSAGE
    1 - wrong token
    2 - expired token
*/
exports.getUsernameWithToken = async function(token)
{
    let result = await dbClient.findOne(config.loginTokensTable, {token: token});

    if(result == null)
        return ["Token doesn't exist", 1];

    if(result.date + config.loginTokenExpiration < Date.now())
        return ["Token has expired", 2];
    
    return [result.username, 0];
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
exports.sendFriendRequest = async function(toUsername, fromUsername)
{
    if(toUsername == fromUsername)
        return ["Can't send a friend request to yourself", 5];

    let userExists = await exports.userExists(toUsername);

    if(!userExists)
        return ["Username doensn't exist", 1];
    
    let fromUser = await dbClient.findOne(config.usersTable, {username: fromUsername});

    if(fromUser.hasOwnProperty("friend_requests"))
        //check if the user that tried to send a request already has one from the other person
        for(let i = 0; i < fromUser.friend_requests.length; i++)
            if(toUsername == fromUser.friend_requests[i])
                return ["User already sent a friend request to you", 3];

    if(fromUser.hasOwnProperty("friends"))
        for(let i = 0; i < fromUser.friends.length; i++)
            if(toUsername == fromUser.friends[i])
                return ["User is already your friend", 4];

    let toUser = await dbClient.findOne(config.usersTable, {username: toUsername});
    let toUserFriendRequests = toUser.friend_requests;
    
    if(!toUser.hasOwnProperty("friend_requests"))
        toUserFriendRequests = [];

    for(let i = 0; i < toUserFriendRequests.length; i++)
        if(fromUsername == toUserFriendRequests[i])
            return ["Request already sent", 2];

    toUserFriendRequests.push(fromUsername);
    await dbClient.updateOne(config.usersTable, {username: toUsername}, {$set: {friend_requests: toUserFriendRequests}});

    return ["Friend request sent!", 0];
};

//get all the friends of a user
exports.getFriends = async function(username)
{
    let result = await dbClient.findOne(config.usersTable, {username: username});

    if(!result.hasOwnProperty("friends"))
        return ["User doesn't exist", 1];

    if(!result.friends)
        return [[], 0];

    return [result.friends, 0];
};

//get all friend requests of a user
exports.getFriendRequests = async function(username)
{
    let result = await dbClient.findOne(config.usersTable, {username: username});

    if(!result.hasOwnProperty("friend_requests"))
        return ["User doesn't exist", 1];

    if(!result.friend_requests)
        return [[], 2];

    return [result.friend_requests, 0]; 
};

//accepts a friend request
//acceptUsername is the user that got accepted by the username
exports.acceptFriendRequest = async function(username, acceptUsername)
{
    let userData = await dbClient.findOne(config.usersTable, {username: username});
    let acceptUserData = await dbClient.findOne(config.usersTable, {username: acceptUsername});

    if(userData == null || acceptUserData == null)
        return ["Username doesn't exist", 1];

    if(!userData.hasOwnProperty("friend_requests"))
        return ["Request wasn't sent from user", 1];

    let newRequests = userData.friend_requests; //array of the new requests that will be updated for the user
    let newUserFriends = userData.hasOwnProperty("friends") ? userData.friends : [];
    let newAcceptUserFriends = acceptUserData.hasOwnProperty("friends") ? acceptUserData.friends : [];

    //remove the friend request
    for(let i = 0; i < userData.friend_requests.length; i++)
    {
        if(userData.friend_requests[i] == acceptUsername)
        {
            newRequests.splice(i, 1);
            break;
        }
    }

    newUserFriends.push(acceptUsername);
    newAcceptUserFriends.push(username);

    await dbClient.updateOne(config.usersTable, {username: username}, {$set: {friend_requests: newRequests, friends: newUserFriends}});
    await dbClient.updateOne(config.usersTable, {username: acceptUsername}, {$set: {friends: newAcceptUserFriends}});

    return ["Success", 0];
};

//declines a friend request
exports.declineFriendRequest = async function(username, declineUsername)
{
    let userData = await dbClient.findOne(config.usersTable, {username: username});

    if(userData == null)
        return ["User doesn't exist", 1];

    //check if the user have any friend requests
    if(!userData.hasOwnProperty("friend_requests"))
        return ["User doesn't have any friend requests", 1];

    let requestFound = false; //indicates whether a request was sent to user

    //check if the request was sent to the user
    for(let i = 0; i < text["friend_requests"].length; i++)
        if(text["friend_requests"][i] == declineUsername)
            requestFound = true;

    if(!requestFound)
        return ["Request wasn't sent from user", 1];

    let newRequests = userData.friend_requests; //array of the new requests that will be updated for the user

    //remove the friend request
    for(let i = 0; i < userData.friend_requests.length; i++)
    {
        if(userData.friend_requests[i] == declineUsername)
        {
            newRequests.splice(i, 1);
            break;
        }
    }

    await dbClient.updateOne(config.usersTable, {username: username}, {$set: {friend_requests: newRequests}});
    return ["Success", 0];
};