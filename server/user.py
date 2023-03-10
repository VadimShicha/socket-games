from config import *
from tools import *
import json
import random

#create a new user (returns message, code)
""" CODE - MESSAGE
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
"""
def create_user(first_name, last_name, username, password, confirm_password):
    if first_name == "" or last_name == "" or username == "" or password == "" or confirm_password == "":
        return "Field not filled out", 1

    #check if any of the fields have characters that aren't allowed
    if is_string_legal(first_name, NAME_CHARS) == False:
        return "First name has characters which aren't allowed", 2
    if is_string_legal(last_name, NAME_CHARS) == False:
        return "Last name has characters which aren't allowed", 3
    if is_string_legal(username, USERNAME_CHARS) == False:
        return "Username has characters which aren't allowed", 4
    if is_string_legal(password, PASSWORD_CHARS) == False:
        return "Password has characters which aren't allowed", 5

    #check if any of the fields have lengthes which is are too small or big
    if len(first_name) < NAME_MIN_LENGTH or len(first_name) > NAME_MAX_LENGTH:
        return "First name needs to be " + str(NAME_MIN_LENGTH) + " - " + str(NAME_MAX_LENGTH) + " characters", 6
    if len(last_name) < NAME_MIN_LENGTH or len(last_name) > NAME_MAX_LENGTH:
        return "Last name needs to be " + str(NAME_MIN_LENGTH) + " - " + str(NAME_MAX_LENGTH) + " characters", 7
    if len(username) < USERNAME_MIN_LENGTH or len(username) > USERNAME_MAX_LENGTH:
        return "Username needs to be " + str(USERNAME_MIN_LENGTH) + " - " + str(USERNAME_MAX_LENGTH) + " characters", 8
    if len(password) < PASSWORD_MIN_LENGTH or len(password) > PASSWORD_MAX_LENGTH:
        return "Password needs to be " + str(PASSWORD_MIN_LENGTH) + " - " + str(PASSWORD_MAX_LENGTH) + " characters", 10

    #check if password and confirm password match
    if password != confirm_password:
        return "Password and confirm password don't match", 11

    #make first and last names have proper capitalization
    first_name = first_name[0].upper() + first_name[1:].lower()
    last_name = last_name[0].upper() + last_name[1:].lower()

    cmd = f"SELECT username FROM {USERS_TABLE} WHERE username = %s" #command to check if the username given is already taken
    cmd_args = (username, ) #args for the command

    result = run_sql(cmd, cmd_args)

    #check if the username already exists
    if result != None:
        return "Username is already taken", 9

    cmd = f"INSERT INTO {USERS_TABLE} VALUES (%s, %s, %s, %s, %s)" #command to add the user to the table
    cmd_args = (first_name, last_name, username, password, '{"friends": [], "friend_requests": [], "game_invites": []}')

    run_sql(cmd, cmd_args, commit=True) #run the cmd

    return "Success", 0

#login into a user (returns message, code)
""" CODE - MESSAGE
    0 - success
    1 - username doesn't exist
    2 - password is incorrect
"""
def login_user(username, password):
    cmd = f"SELECT username FROM {USERS_TABLE} WHERE username = %s"
    cmd_args = (username, )

    res = run_sql(cmd, cmd_args)

    if res == None:
        return "Username doesn't exist", 1
    
    cmd = f"SELECT password FROM {USERS_TABLE} WHERE password = %s"
    cmd_args = (password, )

    res = run_sql(cmd, cmd_args)

    if res == None:
        return "Password is incorrect", 2
    
    return "Success", 0

#deletes a users login token
def delete_login_token(username):
    cmd = f"DELETE FROM {LOGIN_TOKENS_TABLE} WHERE username = %s"
    cmd_args = (username, )

    run_sql(cmd, cmd_args, commit=True)

#gets a login token for the username or creates one if it doesn't exist
def get_login_token(username):

    cmd = f"SELECT token, username FROM {LOGIN_TOKENS_TABLE} WHERE username = %s" #command to check if there already is a token for the username
    cmd_args = (username, )

    result = run_sql(cmd, cmd_args)

    if result != None:
        return result[0]

    token = ""

    #generate a random token by the length and characters configured
    for _ in range(LOGIN_TOKEN_LENGTH):
        token += random.choice(LOGIN_TOKEN_CHARS) #add a random character from the string configured to the token

    cmd = f"SELECT token FROM {LOGIN_TOKENS_TABLE} WHERE token = %s" #command to check if the token already exists (VERY RARE)
    cmd_args = (token, )

    result = run_sql(cmd, cmd_args)

    #check if the token doesn't already exist
    if result == None:
        cmd = f"INSERT INTO {LOGIN_TOKENS_TABLE} VALUES (%s, %s, %s)" #command to add a new row to the login tokens table
        cmd_args = (token, username, current_epoch_time())
        
        run_sql(cmd, cmd_args, commit=True)
        return token

    return False

#checks if a token is valid (if valid returns username. if not valid returns False)
def auth_login_token(token):
    cmd = f"SELECT username, date FROM {LOGIN_TOKENS_TABLE} WHERE token = %s"
    cmd_args = (token, )

    result = run_sql(cmd, cmd_args)
    if result == False:
        return False

    #check if the cmd didn't succeed
    if result == None:
        return False
    
    #check if the login token expired
    if result[1] + LOGIN_TOKEN_EXPIRATION < current_epoch_time():
        log_message("EXPIRED TOKEN")
        cmd = f"DELETE FROM {LOGIN_TOKENS_TABLE} WHERE token = %s"
        cmd_args = (token, )

        run_sql(cmd, cmd_args, commit=True)
        return False

    return result[0]

#checks if a username exists
def user_exists(username):
    cmd = f"SELECT username FROM {USERS_TABLE} WHERE username = %s"
    cmd_args = (username, )

    result = run_sql(cmd, cmd_args)

    if result == None:
        return False
    
    return True

#sends a friend request to a user (returns message, code)
""" CODE - MESSAGE
0 - success
1 - user doesn't exist
2 - request already sent
3 - user already sent friend request to user sending
4 - user is already your friend
5 - request sent to self
"""
def send_friend_request(to_username, from_username):
    #check if the user sent a friend request to themselves
    if to_username == from_username:
        return "Can't send a friend request to yourself", 5
    
    #check if the username given is an actual user
    if user_exists(to_username) == False:
        return "Username doensn't exist", 1
    
    #check if the user that tried to send a request does already have one from the other person
    cmd = f"SELECT data FROM {USERS_TABLE} WHERE username = %s"
    cmd_args = (from_username, )

    result = run_sql(cmd, cmd_args)

    text = json.loads(result[0])
    requests_arr = text["friend_requests"]
    friends_arr = text["friends"]

    if to_username in requests_arr:
        return "User already sent a friend request to you", 3
    
    #check if the user is already your friend
    if to_username in friends_arr:
        return "User is already your friend", 4

    cmd = f"SELECT data FROM {USERS_TABLE} WHERE username = %s"
    cmd_args = (to_username, )

    result = run_sql(cmd, cmd_args)

    text = json.loads(result[0])
    arr = text["friend_requests"]

    for i in range(len(arr)):
        if arr[i] == from_username:
            return "Request already sent", 2

    arr.append(str(from_username))
    text["friend_requests"] = arr

    cmd = f"UPDATE {USERS_TABLE} SET data = %s WHERE username = %s"
    cmd_args = (json.dumps(text), to_username, )

    run_sql(cmd, cmd_args, fetch="none", commit=True)
    
    return "Friend request sent!", 0

#get all friend requests of a user
def get_friend_requests(username):
    cmd = f"SELECT data FROM {USERS_TABLE} WHERE username = %s"
    cmd_args = (username, )

    result = run_sql(cmd, cmd_args)

    try:
        text = json.loads(result[0])["friend_requests"]
    except:
        log_error("get_friend_requests", "Failed to parse JSON")
        return False
    
    return text

#accepts a friend request
#accept_username is the user that got accepted by the username
def accept_friend_request(username, accept_username):

    cmd = f"SELECT username, data FROM {USERS_TABLE} WHERE username IN (%s, %s)"
    cmd_args = (username, accept_username)

    result = run_sql(cmd, cmd_args, fetch="all")

    if result == None:
        return False

    username_text = ""
    accept_username_text = ""

    for i in range(2):
        if result[i][0] == username:
            username_text = json.loads(result[i][1])
        elif result[i][0] == accept_username:
            accept_username_text = json.loads(result[i][1])

    username_text["friend_requests"].remove(accept_username) #remove the friend request

    username_text["friends"].append(accept_username)
    accept_username_text["friends"].append(username)

    cmd = f"UPDATE {USERS_TABLE} SET data = %s WHERE username = %s"
    cmd_args = (json.dumps(username_text), username)

    run_sql(cmd, cmd_args, fetch=None, commit=True)

    cmd = f"UPDATE {USERS_TABLE} SET data = %s WHERE username = %s"
    cmd_args = (json.dumps(accept_username_text), accept_username)

    run_sql(cmd, cmd_args, fetch=None, commit=True)

#declines a friend request
def decline_friend_request(username, decline_username):
    cmd = f"SELECT data FROM {USERS_TABLE} WHERE username = %s"
    cmd_args = (username, )

    result = run_sql(cmd, cmd_args)

    try:
        text = json.loads(result[0])
    except:
        log_error("decline_friend_request", "Failed to parse JSON")
        return False

    if decline_username not in text["friend_requests"]:
        return False
    
    text["friend_requests"].remove(decline_username)

    cmd = f"UPDATE {USERS_TABLE} SET data = %s WHERE username = %s"
    cmd_args = (json.dumps(text), username)

    run_sql(cmd, cmd_args, fetch=None, commit=True)

#get all the friends of a user
def get_friends(username):
    cmd = f"SELECT data FROM {USERS_TABLE} WHERE username = %s"
    cmd_args = (username, )

    result = run_sql(cmd, cmd_args)

    try:
        text = json.loads(result[0])["friends"]
    except:
        log_error("get_friends", "Failed to parse JSON")
        return False
    
    return text

#get all the game invites of a user
def get_game_invites(username):
    cmd = f"SELECT data FROM {USERS_TABLE} WHERE username = %s"
    cmd_args = (username, )

    result = run_sql(cmd, cmd_args)

    try:
        text = json.loads(result[0])["game_invites"]
    except:
        log_error("get_friends", "Failed to parse JSON")
        return False
    
    return text

#sends a friend request to a user (returns message, code)
""" CODE - MESSAGE
0 - success
1 - already sent invite
2 - can't send because that user already sent to you
3 - other error (error caused by running this function with the web console)
"""
def send_game_invite(to_username, from_username):
    #check if the user sent a game invite to themselves
    if to_username == from_username:
        return "Error", 3
    
    #check if the username given is an actual user
    if user_exists(to_username) == False:
        return "Error", 3
        
    #check if the user that tried to send a game invite does already have one from the other person
    cmd = f"SELECT data FROM {USERS_TABLE} WHERE username = %s"
    cmd_args = (from_username, )

    result = run_sql(cmd, cmd_args)

    text = json.loads(result[0])
    invite_arr = text["game_invites"]

    if to_username in invite_arr:
        return "User already sent a game invite to you", 2

    cmd = f"SELECT data FROM {USERS_TABLE} WHERE username = %s"
    cmd_args = (to_username, )

    result = run_sql(cmd, cmd_args)

    text = json.loads(result[0])
    arr = text["game_invites"]

    for i in range(len(arr)):
        if arr[i] == from_username:
            return "Game invite already sent", 1

    arr.append(str(from_username))
    text["game_invites"] = arr

    cmd = f"UPDATE {USERS_TABLE} SET data = %s WHERE username = %s"
    cmd_args = (json.dumps(text), to_username, )

    run_sql(cmd, cmd_args, fetch="none", commit=True)
    
    return "Game invite sent!", 0
