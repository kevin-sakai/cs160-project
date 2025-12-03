import React from "react"
import { Link } from "react-router-dom"
import logo from "../assets/logo.png";

export const Navbar = () => {
    return (
        <div id="navbar">
            <ul>
                
                <Link to='/'><img id="logo" src={logo}/></Link>
                <Link to='/'><li>Home</li></Link>
                <Link to='Notepad'><li>Notepad</li></Link>
                <Link to='Hotkeys'><li>Hotkeys</li></Link>
                <Link to='obspage'><li>Obs Page</li></Link>
                <Link to='TriggerEventsPage'><li>Trigger Events</li></Link>
            </ul>
        </div>)
}