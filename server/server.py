from flask import Flask, request, jsonify
import mysql.connector
from user import *
from tools import *
from config import *

db = None
db_cursor = None

app = Flask(SERVER_NAME)

#handle all post requests at the url '/server'
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
            
            message, code = login_user(json["username"], json["password"])

            send_json["code"] = code
            send_json["message"] = message

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
            
            message, code = create_user(json["firstName"], json["lastName"], json["username"], json["password"], json["confirmPassword"])
            
            send_json["code"] = code
            send_json["message"] = message

            if code == 0:
                result = get_login_token(json["username"])

                if result == False:
                    return request_fail

                send_json["token"] = result
                send_json["success"] = True
            else:
                send_json["success"] = False
                

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
            
            message, code = send_friend_request(json["username"], auth_result)

            if code == 0:
                send_json["success"] = True
            else:
                send_json["success"] = False

            send_json["message"] = message
            send_json["code"] = code

            return send_json
        case "get_friends":
            #check if a token was sent
            if json.get("token") == None:
                return request_fail
            
            auth_result = auth_login_token(json["token"])

            if auth_result == False:
                return request_fail
            
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
        case "get_game_invites":
            #check if a token was sent
            if json.get("token") == None:
                return request_fail
            
            auth_result = auth_login_token(json["token"])

            if auth_result == False:
                return request_fail
            
            log_message(auth_result)
            
            result = get_game_invites(auth_result)

            if result == False:
                return request_fail
            
            send_json["result"] = result
            return send_json
        case "send_game_invite":
            #check if a token was sent
            if json.get("token") == None or json.get("username") == None:
                return request_fail
            
            auth_result = auth_login_token(json["token"])
            if auth_result == False:
                return request_fail
            
            message, code = send_game_invite(json["username"], auth_result)
            send_json["message"] = message
            send_json["code"] = code

            if code == 0:
                send_json["success"] = True
            else:
                send_json["success"] = False

            return send_json

    return jsonify(json)
    

app.run(port=PORT)