import mysql.connector
import time

#config
LOG_MESSAGES = True

#print a message if logging is on
def log_message(message):
    if LOG_MESSAGES:
        print(f"\033[94mMESSAGE: {message}\033[0m")

#print an error if logging is on
def log_error(type, message):
    if LOG_MESSAGES:
        print(f"\033[91mERROR {type}: {message}\033[0m")

#get milliseconds since Jan 1, 1970
def current_epoch_time():
    return round(time.time() * 1000)

#returns False if the string has a char missing from look for string else True
def is_string_legal(string, look_for_string):
	for i in range(len(string)):
		if string[i] not in look_for_string:
			return False

	return True

#runs an sql command by opening and closing a connection
#OPTIONS:
# fetch: None, "one", "many", "all"
# commit: True, False
def run_sql(cmd, cmd_args="", fetch="one", commit=False):
    try:
        db = mysql.connector.connect(
            host="127.0.0.1",
            port=3006,
            user="root",
            password="Vadim120",
            database="socket_games"
        )

        cursor = db.cursor(buffered=True)
        cursor.execute(cmd, cmd_args)

        cursor_result = ""

        if fetch == "one":
            cursor_result = cursor.fetchone()
        elif fetch == "many":
            cursor_result = cursor.fetchmany()
        elif fetch == "all":
            cursor_result = cursor.fetchall()

        if commit:
            db.commit()

        cursor.close()
        db.close()

        return cursor_result
    except Exception as e:
        log_error(f"run_sql({cmd}, {cmd_args})", "Failed to execute SQL command")
        log_error("EXCEPTION:" , str(e))