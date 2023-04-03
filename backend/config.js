const lowerAlphabet = "abcdefghijklmnopqrstuvwxyz";
const digits = "0123456789";
const symbols = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";

//MySQL config
exports.database = "trumpetgames";
exports.usersTable = "users";
exports.loginTokensTable = "login_tokens";

//server config
exports.port = 5000;

//other config
exports.gameInviteCheckDelay = 10 * 1000; //delay in milliseconds of checking if a game invite expired
exports.gameInviteExpiration = 3 * 1 * 1000 //amount of milliseconds a game invite last before expiring

exports.loginTokenExpiration = 5 * 60 * 60 * 1000 //the amount of milliseconds a login token lasts for in the database

exports.tokenLength = 16;
exports.tokenChars = lowerAlphabet + lowerAlphabet.toUpperCase() + digits;

exports.nameMinLength = 1;
exports.nameMaxLength = 30;

exports.usernameMinLength = 3;
exports.usernameMaxLength = 16;

exports.passwordMinLength = 5;
exports.passwordMaxLength = 30;

exports.nameChars = lowerAlphabet + lowerAlphabet.toUpperCase(); //characters which are allowed for first and last names
exports.usernameChars = lowerAlphabet + digits; //characters which are allowed for usernames
exports.passwordChars = lowerAlphabet + lowerAlphabet.toUpperCase() + digits + symbols + " "; //characters which are allowed for passwords