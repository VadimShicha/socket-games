# Socket Games

## App Description
This app allows you play singleplayer games and invite friends to play multiplayer. It uses ReactJS for the frontend, NodeJS for the backend and MySQL for data management.

## Requirements:
- NodeJS installed
- MySQL database setup called `socket_games`

## Setup
1. Clone this repository
2. run `npm install` in the `backend` and `frontend` directories
3. Create a file called `credentials.js` in the `backend` directory and paste in the following code:
    ``` JavaScript
    //MySQL credentials
    exports.sqlHost = "";
    exports.sqlPort = "";
    exports.sqlUser = "";
    exports.sqlPassword = "";
    ```
4. Fill in your MySQL credentials

## Running the app
To run this app you need two terminals one for the frontend and another for the backend
- Terminal 1 (frontend): 
    1. `cd frontend`
    2. `npm run start`
- Terminal 2 (backend):
    1. `cd backend`
    2. `npm run start`