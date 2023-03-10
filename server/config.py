import string

#MySQL config
USERS_TABLE = "users"
LOGIN_TOKENS_TABLE = "login_tokens"

#server config
PORT = 5000
SERVER_NAME = "server"

#OTHER CONFIG
LOGIN_TOKEN_EXPIRATION = 2 * 60 * 60 * 1000 #the amount of milliseconds a login token lasts for in the database

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