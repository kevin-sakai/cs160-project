import { act, useState } from "react";
import "./Hotkeys.css";
import { Link } from "react-router-dom";
import help from "../../assets/help.png";
import { useHotkeys } from "react-hotkeys-hook";


export const HotkeyItem = ({ hotkey, func }) => {
    useHotkeys(hotkey, func);
}