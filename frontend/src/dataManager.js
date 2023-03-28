import React, {createRef} from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import PopText from "./components/PopText";

class DataManager
{
    static popTextRef = createRef();
    static redirectRef = createRef();
    static gameUrlToTitle = function(gameUrl)
    {
        if(gameUrl == "first")
            return "First";
        else if(gameUrl == "tic_tac_toe")
            return "Tic Tac Toe";
        return "";
    }
}

export default DataManager;