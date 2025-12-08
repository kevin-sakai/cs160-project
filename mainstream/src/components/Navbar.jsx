import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export const Navbar = ({ currPage, setCurrPage }) => {
  return (
    <div id="navbar">
      <ul>
        <Link to="/">
          <img id="logo" src={logo} />
        </Link>
        <Link to="/">
          <li
            className={currPage == "home" ? "onPage" : ""}
            onClick={() => {
              setCurrPage("home");
            }}
          >
            Home
          </li>
        </Link>
        <Link to="Notepad">
          <li
            className={currPage == "notepad" ? "onPage" : ""}
            onClick={() => {
              setCurrPage("notepad");
            }}
          >
            Notepad
          </li>
        </Link>
        <Link to="obspage">
          <li
            className={currPage == "obspage" ? "onPage" : ""}
            onClick={() => {
              setCurrPage("obspage");
            }}
          >
            Obs Page
          </li>
        </Link>
        <Link to="graphs">
          <li
            className={currPage == "graphs" ? "onPage" : ""}
            onClick={() => {
              setCurrPage("graphs");
            }}
          >
            Graphs
          </li>
        </Link>
        <Link to="TriggerEventsPage">
          <li
            className={currPage == "triggereventspage" ? "onPage" : ""}
            onClick={() => {
              setCurrPage("triggereventspage");
            }}
          >
            Trigger Events
          </li>
        </Link>
        <Link to="Hotkeys">
          <li
            className={currPage == "hotkeys" ? "onPage" : ""}
            onClick={() => {
              setCurrPage("hotkeys");
            }}
          >
            Hotkeys
          </li>
        </Link>
      </ul>
    </div>
  );
};
