import { useState } from "react";
import "./Hotkeys.css";
import { Link } from "react-router-dom";
import help from "../../assets/help.png";
import { useHotkeys } from "react-hotkeys-hook";
import { func } from "prop-types";

export const HotkeyPage = ({ keyMap, setKeyMap }) => {
  const [displayedActions, setDisplayedActions] = useState([
    { key: "alt+p", value: "addNotePage" },
    { key: "a", value: "action 1" },
    { key: "b", value: "action 2" },
  ]);
  const [selectedOption, setSelectedOption] = useState(Object.keys(keyMap)[0]);
  const [selectedKey, setSelectedKey] = useState("");
  const [needHelp, setNeedHelp] = useState(false);

  const clickHelp = () => {
    setNeedHelp((prevValue) => !prevValue);
  };
  const saveClick = () => {
    setDisplayedActions(...displayedActions, {
      key: selectedKey,
      value: selectedOption,
    });
    console.log(displayedActions);
  };

  return (
    <div id="hotkey-page">
      <div id="title">
        <h1>Hotkeys</h1>
        <Link to="../obspage">
          <button>Obs Page</button>
        </Link>
      </div>

      <p>selected option: {selectedOption} </p>
      <p>selected key: {selectedKey} </p>
      <div>
        <select
          name="actions"
          onChange={(e) => {
            setSelectedOption(e.target.value);
          }}
        >
          {keyMap.map((a) => {
            return (
              <div key={a.hotkey}>
                <option>{a.name}</option>
              </div>
            );
          })}
        </select>
        <p>Type Key</p>

        <input
          placeholder="key"
          onChange={(e) => {
            setSelectedKey(e.target.value);
          }}
        ></input>

        <button
          onClick={() => {
            console.log(a, selectedOption);
            setKeyMap(
              keyMap.map((a) => {
                if (a.name == selectedOption) {
                  return {
                    name: selectedOption,
                    hotkey: selectedKey,
                    func: a.func,
                  };
                } else {
                  return a;
                }
              })
            );
          }}
        >
          Save
        </button>
      </div>

      <div id="hotkey-display-list">
        {" "}
        {keyMap.map((a) => {
          if (a.hotkey != "") {
            return (
              <div className="hotkeylist-action" key={a.hotkey}>
                <div>{a.name}</div>
                <div>{a.hotkey}</div>
                <button
                  onClick={() => {
                    setKeyMap(
                      keyMap.map((act) => {
                        console.log("delete key", a);
                        console.log(keyMap);
                        if (a.name == act.name) {
                          return {
                            name: act.name,
                            hotkey: "",
                            func: act.func,
                          };
                        } else {
                          return act;
                        }
                      })
                    );
                  }}
                >
                  X
                </button>
              </div>
            );
          }
        })}
      </div>

      <img className="helpicon" src={help} onClick={clickHelp} />
      {needHelp ? (
        <div>
          <p>
            Use this page to change or set up hotkeys for actions you created on
            the obs page
          </p>
        </div>
      ) : null}
    </div>
  );
};
