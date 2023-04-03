import React, {createRef, useState} from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import PopText from "./components/PopText";

class DataManager
{
    static popTextRef = createRef();
    static redirectRef = createRef();
    
    static token = "";
    static gameUrlToTitle = function(gameUrl)
    {
        if(gameUrl == "first")
            return "First";
        else if(gameUrl == "tic_tac_toe")
            return "Tic Tac Toe";
        return "";
    };

    static navUrlToIndex = function(url)
    {
        if(url == "/" || url == "")
            return 0;
        if(url == "/multiplayer")
            return 1;
        if(url == "/social")
            return 2;
        if(url == "/settings")
            return 3;
        return -1;
    };
}

export default DataManager;