import React, {createRef} from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import PopText from "./components/PopText";

class DataManager
{
    static popTextRef = createRef();
    static redirectRef = createRef();
}

export default DataManager;