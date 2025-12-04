import { useEffect, useState } from "react";
import "./Hotkeys.css";
import { Link } from "react-router-dom";
import help from "../../assets/help.png";
import { useHotkeys, useRecordHotkeys } from "react-hotkeys-hook";
import { func } from "prop-types";
import x from "../../assets/x.png";
export const HotkeyPage = ({ keyMap, setKeyMap }) => {
  const [selectedOption, setSelectedOption] = useState(keyMap[0].name);
  const [selectedKey, setSelectedKey] = useState("");
  const [needHelp, setNeedHelp] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [isCancel, setIsCancel] = useState(false);
  const [listClick, setListClick] = useState(false);

  const clickHelp = () => {
    setNeedHelp((prevValue) => !prevValue);
  };

  const [keys, { start, stop, isRecording }] = useRecordHotkeys();
  return (
    <div id="hotkey-page">
      <div id="title">
        <h1>Hotkeys</h1>
        <Link to="../TriggerEventsPage">
          <button className="butt" id="trigbutt">
            Trigger Events
          </button>
        </Link>
      </div>

      {/* <p>selected option: {selectedOption} </p>
      <p>selected key: {selectedKey} </p> */}
      <p>Selected action:</p>
      <div>
        <select
          id={listClick ? "flash" : "select-box"}
          name="actions"
          onChange={(e) => {
            setSelectedOption(e.target.value);
          }}
          value={selectedOption}
        >
          {keyMap.map((a) => {
            return (
              <div className="optdiv" key={a.hotkey}>
                <option className="opt">{a.name}</option>
              </div>
            );
          })}
        </select>
        <p>Selected key(s):</p>

        <input
          className="inp"
          placeholder="Begin typing"
          onChange={(e) => {
            // setSelectedKey(e.target.value);
            setRecordedKeys(Array.from(keys).join(" + "));
          }}
          onClick={() => {
            start();
            setIsCancel(false);
          }}
          value={!isCancel ? Array.from(keys).join(" + ") : ""}
        ></input>
        <div id="triplebutt">
          <button
            className="butt"
            onClick={() => {
              stop();
              setRecordedKeys(Array.from(keys).join(" + "));
              setIsDone(true);
              setListClick(false);
            }}
          >
            Done
          </button>

          <div>
            <button
              className="butt"
              onClick={() => {
                if (recordedKeys == "") {
                  setIsDone(!isDone);
                  return;
                }

                // setRecordedKeys(Array.from(keys).join(" + "));
                setKeyMap(
                  keyMap.map((a) => {
                    if (a.name == selectedOption) {
                      return {
                        name: selectedOption,
                        hotkey: recordedKeys,
                        funcname: a.funcname,
                      };
                    } else {
                      return a;
                    }
                  })
                );

                setRecordedKeys("");
                setIsDone(!isDone);
                setListClick(false);
              }}
              disabled={!isDone}
            >
              Save
            </button>
          </div>
          <button
            className="butt"
            onClick={() => {
              setRecordedKeys("");
              stop();
              setIsCancel(true);
              setIsDone(false);
              setListClick(false);
            }}
          >
            Clear
          </button>
        </div>
      </div>
      {/* <div>
        <p>Is recording: {isRecording ? "yes" : "no"}</p>
        <p>Recorded keys: {Array.from(keys).join(" + ")}</p>
        <br />
        <button onClick={start}>Record</button>
        <button onClick={stop}>Stop</button>
      </div> */}
      {keyMap.length > 0 ? (
        <div id="hotkey-display-list">
          {keyMap.map((a) => {
            if (a.hotkey != "") {
              return (
                <div
                  // className="hotkeylist-action"
                  className= "hotkeylist-action"
                  key={a.hotkey}
                  onClick={() => {
                    setSelectedOption(a.name);
                    setListClick(true);
                  }}
                >
                  <div className="displayname">{a.name}</div>
                  <div className="displaykey"
                  
                  >{a.hotkey}</div>
                  <button
                    className="butt"
                    onClick={() => {
                      setKeyMap(
                        keyMap.map((act) => {
                          if (a.name == act.name) {
                            return {
                              name: act.name,
                              hotkey: "",
                              funcname: act.funcname,
                            };
                          } else {
                            return act;
                          }
                        })
                      );
                    }}
                  >
                    <img className="x" src={x} />
                  </button>
                </div>
              );
            }
          })}
        </div>
      ) : (
        <div id="hotkey-display-list">You have no Hotkeys</div>
      )}

      <img className="helpicon" src={help} onClick={clickHelp} />
      {needHelp ? (
        <div>
          <p>
            Use this page to change or set up hotkeys for actions you created on
            the Trigger Events page or set new hotkeys for existing actions.
          </p>
        </div>
      ) : null}
    </div>
  );
};
