from flask import Flask, request, jsonify
import mysql.connector
import string
import json
import random
from tools import *

#MySQL config
USERS_TABLE = "users"
LOGIN_TOKENS_TABLE = "login_tokens"

db = None
db_cursor = None

#server config
PORT = 5000
SERVER_NAME = __name__

#OTHER CONFIG
LOGIN_TOKEN_EXPIRATION = 30 * 60000 #the amount of milliseconds a login token lasts for in the database

LOGIN_TOKEN_LENGTH = 16
LOGIN_TOKEN_CHARS = string.ascii_letters + string.digits

NAME_MIN_LENGTH = 1
NAME_MAX_LENGTH = 30

USERNAME_MIN_LENGTH = 3
USERNAME_MAX_LENGTH = 16

PASSWORD_MIN_LENGTH = 5
PASSWORD_MAX_LENGTH = 30

NAME_CHARS = string.ascii_letters #characters which are allowed for first and last names
USERNAME_CHARS = string.ascii_lowercase + string.digits #characters which are allowed for usernames
PASSWORD_CHARS = string.ascii_letters + string.digits + string.punctuation + " " #characters which are allowed for passwords

#create a new user (returns a string of format: '##message')
# 00 - success
# 01 - an arg is empty
# 02 - first name has unallowed chars
# 03 - last name has unallowed chars
# 04 - username has unallowed chars
# 05 - password has unallowed chars
# 06 - first name too short or long
# 07 - last name too short or long
# 08 - username too short or long
# 09 - username taken
# 10 - password too short or long
# 11 - password and confirm password don't match
def create_user(first_name, last_name, username, password, confirm_password):
    if first_name == "" or last_name == "" or username == "" or password == "" or confirm_password == "":
        return "01Field not filled out"

    #check if any of the fields have characters that aren't allowed
    if is_string_legal(first_name, NAME_CHARS) == False:
        return "02First name has characters which aren't allowed"
    if is_string_legal(last_name, NAME_CHARS) == False:
        return "03Last name has characters which aren't allowed"
    if is_string_legal(username, USERNAME_CHARS) == False:
        return "04Username name has characters which aren't allowed"
    if is_string_legal(password, PASSWORD_CHARS) == False:
        return "05Password name has characters which aren't allowed"

    #check if any of the fields have lengthes which is are too small or big
    if len(first_name) < NAME_MIN_LENGTH or len(first_name) > NAME_MAX_LENGTH:
        return "06First name needs to be " + str(NAME_MIN_LENGTH) + " - " + str(NAME_MAX_LENGTH) + " characters"
    if len(last_name) < NAME_MIN_LENGTH or len(last_name) > NAME_MAX_LENGTH:
        return "07Last name needs to be " + str(NAME_MIN_LENGTH) + " - " + str(NAME_MAX_LENGTH) + " characters"
    if len(username) < USERNAME_MIN_LENGTH or len(username) > USERNAME_MAX_LENGTH:
        return "08Username needs to be " + str(USERNAME_MIN_LENGTH) + " - " + str(USERNAME_MAX_LENGTH) + " characters"
    if len(password) < PASSWORD_MIN_LENGTH or len(password) > PASSWORD_MAX_LENGTH:
        return "10Password needs to be " + str(PASSWORD_MIN_LENGTH) + " - " + str(PASSWORD_MAX_LENGTH) + " characters"

    #check if password and confirm password match
    if password != confirm_password:
        return "11Password and confirm password don't match"

    #make first and last names have proper capitalization
    first_name = first_name[0].upper() + first_name[1:].lower()
    last_name = last_name[0].upper() + last_name[1:].lower()

    cmd = f"SELECT username FROM {USERS_TABLE} WHERE username = %s" #command to check if the username given is already taken
    cmd_args = (username, ) #args for the command

    result = run_sql(cmd, cmd_args)

    #result = db_cursor.fetchone() #get result from the cmd

    #check if the username already exists
    if result != None:
        return "09Username is already taken"

    cmd = f"INSERT INTO {USERS_TABLE} VALUES (%s, %s, %s, %s, %s)" #command to add the user to the table
    cmd_args = (first_name, last_name, username, password, '{"friends": [], "friend_requests": []}')

    run_sql(cmd, cmd_args, commit=True) #run the cmd
    #db.commit() #apply the changes

    return "00Success"

#login into a user (returns a string of format: '#message')
# 0 - success
# 1 - username doesn't exist
# 2 - password is incorrect
def login_user(username, password):
    cmd = f"SELECT username FROM {USERS_TABLE} WHERE username = %s"
    cmd_args = (username, )

    res = run_sql(cmd, cmd_args)

    if res == None:
        
        return "1Username doesn't exist"
    

    cmd = f"SELECT password FROM {USERS_TABLE} WHERE password = %s"
    cmd_args = (password, )

    res = run_sql(cmd, cmd_args)

    if res == None:
        return "2Password is incorrect"
    
    

    return "0Success"

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
        #log_message(f"TOKEN ALREADY EXISTS ({result[0]})")
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
        #db.commit() #apply the changes to the database

        return token

    return False

#checks if a token is valid (if valid returns username. if not valid returns False)
def auth_login_token(token):
    cmd = f"SELECT username, date FROM {LOGIN_TOKENS_TABLE} WHERE token = %s"
    cmd_args = (token, )

    result = run_sql(cmd, cmd_args)
    if result == False:
        return False


    #result = db_cursor.fetchone()
    #db.close()
    #db_cursor.close()

    log_message("AUTH LOGIN:")
    log_message(result)

    #check if the cmd didn't succeed
    if result == None:
        return False
    
    #check if the login token expired
    if result[1] + LOGIN_TOKEN_EXPIRATION < current_epoch_time():
        log_message("EXPIRED TOKEN")
        cmd = f"DELETE FROM {LOGIN_TOKENS_TABLE} WHERE token = %s"
        cmd_args = (token, )

        run_sql(cmd, cmd_args, commit=True)
        #db.commit()

        #log_message(db_cursor.fetchone())
        # db.close()
        # db_cursor.close()

        return False

    return result[0]

#checks if a username exists
def user_exists(username):
    cmd = f"SELECT username FROM {USERS_TABLE} WHERE username = %s"
    cmd_args = (username, )

    result = run_sql(cmd, cmd_args)

    # result = db_cursor.fetchone()

    if result == None:
        return False
    
    return True

#sends a friend request to a user
# 0 - success
# 1 - user doesn't exist
# 2 - request already sent
# 3 - user already sent friend request to user sending
# 4 - request sent to self
def send_friend_request(to_username, from_username):
    #check if the user sent a friend request to themselves
    if to_username == from_username:
        return "4Can't send a friend request to yourself"
    
    #check if the username given is an actual user
    if user_exists(to_username) == False:
        return "1Username doensn't exist"
    
    #check if the user that tried to send a request does already have one from the other person
    cmd = f"SELECT data FROM {USERS_TABLE} WHERE username = %s"
    cmd_args = (from_username, )

    result = run_sql(cmd, cmd_args)

    text = json.loads(result[0])
    arr = text["friend_requests"]

    if to_username in arr:
        return "3User already sent a friend request to you"
    

    
    cmd = f"SELECT data FROM {USERS_TABLE} WHERE username = %s"
    cmd_args = (to_username, )

    result = run_sql(cmd, cmd_args)

    log_message("SDGHBSDG:")
    log_message(result)

    text = json.loads(result[0])
    arr = text["friend_requests"]

    for i in range(len(arr)):
        if arr[i] == from_username:
            return "2Request already sent"

    arr.append(str(from_username))
    text["friend_requests"] = arr

    cmd = f"UPDATE {USERS_TABLE} SET data = %s WHERE username = %s"
    cmd_args = (json.dumps(text), to_username, )

    run_sql(cmd, cmd_args, fetch="none", commit=True)
    
    return "0Friend request sent!"

def get_friend_requests(username):
    cmd = f"SELECT data FROM {USERS_TABLE} WHERE username = %s"
    cmd_args = (username, )

    result = run_sql(cmd, cmd_args)

    #result = db_cursor.fetchone()

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
    
    log_message("ACCEPT")
    log_message(result)
    log_message(result[0][0])

    username_text = ""
    accept_username_text = ""

    for i in range(2):
        if result[i][0] == username:
            username_text = json.loads(result[i][1])
        elif result[i][0] == accept_username:
            accept_username_text = json.loads(result[i][1])

    log_message(username_text)
    log_message(accept_username_text)

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

    log_message("DCLINE")
    log_message(result[0])

    if decline_username not in text["friend_requests"]:
        return False
    
    text["friend_requests"].remove(decline_username)

    cmd = f"UPDATE {USERS_TABLE} SET data = %s WHERE username = %s"
    cmd_args = (json.dumps(text), username)

    run_sql(cmd, cmd_args, fetch=None, commit=True)

def get_friends(username):
    cmd = f"SELECT data FROM {USERS_TABLE} WHERE username = %s"
    cmd_args = (username, )

    result = run_sql(cmd, cmd_args)

    #result = db_cursor.fetchone()

    try:
        text = json.loads(result[0])["friends"]
    except:
        log_error("get_friends", "Failed to parse JSON")
        return False
    
    return text

app = Flask(SERVER_NAME)

@app.route('/server', methods=['POST'])
def POST_listen():
    json = request.get_json(force=True)
    request_fail = jsonify({"success": False}) #use 'return request_fail' to return and send an unsuccessful response
    send_json = {"success": True}

    if json == None or json.get("requestID") == None:
        return request_fail

    match json["requestID"]:
        case "login":
            #check if the username and password were sent
            if json.get("username") == None or json.get("password") == None:
                return request_fail
            
            result = login_user(json["username"], json["password"])
            code = int(result[0])

            send_json["code"] = code
            send_json["message"] = result[1:]

            if code == 0:
                result = get_login_token(json["username"])

                if result == False:
                    return request_fail

                send_json["token"] = result
            else:
                send_json["success"] = False

            return send_json
        case "logout":
            #check if the token was sent
            if json.get("token") == None:
                return request_fail
            
            auth_result = auth_login_token(json["token"])

            if auth_result == False:
                return request_fail
            
            result = delete_login_token(auth_result)
            if result == False:
                return request_fail
            
            send_json["success"] = True
            return send_json
        case "create_user":
            #check if all the properties were sent
            if json.get("firstName") == None or json.get("lastName") == None or json.get("username") == None or json.get("password") == None or json.get("confirmPassword") == None:
                return request_fail
            
            result = create_user(json["firstName"], json["lastName"], json["username"], json["password"], json["confirmPassword"])

            code = int(result[:2])

            if code == 0:
                result = get_login_token(json["username"])

                if result == False:
                    return request_fail

                send_json["token"] = result
            else:
                send_json["success"] = False
                
            send_json["code"] = code
            send_json["message"] = result[2:]

            return send_json
        case "auth_token":
            #check if a token was sent
            if json.get("token") == None:
                return request_fail
            
            result = auth_login_token(json["token"])
            if result == False:
                return request_fail
            
            send_json["success"] = True
            
            return send_json
        case "user_exists":
            #check if a username was sent
            if json.get("username") == None:
                return request_fail
            
            send_json["success"] = user_exists(json["username"])
            return send_json
        case "send_friend_request":
            #check if a token was sent
            if json.get("token") == None:
                return request_fail
            
            auth_result = auth_login_token(json["token"])
            if auth_result == False:
                return request_fail
            
            result = send_friend_request(json["username"], auth_result)
            code = int(result[0])

            if code == 0:
                send_json["success"] = True
            else:
                send_json["success"] = False

            send_json["message"] = result[1:]
            send_json["code"] = code

            return send_json
        case "get_friends":
            #check if a token was sent
            if json.get("token") == None:
                return request_fail
            
            auth_result = auth_login_token(json["token"])

            if auth_result == False:
                return request_fail
            
            log_message(auth_result)
            
            result = get_friends(auth_result)

            if result == False:
                return request_fail
            
            send_json["result"] = result
            return send_json
        case "get_friend_requests":
            #check if a token was sent
            if json.get("token") == None:
                return request_fail
            
            auth_result = auth_login_token(json["token"])

            if auth_result == False:
                return request_fail
            
            result = get_friend_requests(auth_result)

            if result == False:
                return request_fail
            
            send_json["result"] = result
            return send_json
        case "accept_friend_request":
            #check if a token and username were sent
            if json.get("token") == None or json.get("username") == None:
                return request_fail
            
            username = auth_login_token(json["token"])
            if username == False:
                return request_fail

            result = accept_friend_request(username, json["username"])

            if result == False:
                return request_fail
            
            send_json["success"] = True
            
            return send_json
        case "decline_friend_request":
            #check if a token and username were sent
            if json.get("token") == None or json.get("username") == None:
                return request_fail

            username = auth_login_token(json["token"])
            if username == False:
                return request_fail

            result = decline_friend_request(username, json["username"])

            if result == False:
                return request_fail
            
            send_json["success"] = True
            
            return send_json

    return jsonify(json)
    

app.run(port=PORT)