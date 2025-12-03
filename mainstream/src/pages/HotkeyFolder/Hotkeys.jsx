<<<<<<< HEAD
import { useState } from "react";
import './Hotkeys.css';
import { Link } from "react-router-dom";
import help from '../../assets/help.png'

export const HotkeyPage = ({ keyMap }) => {


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
        setDisplayedActions(...displayedActions, { key: selectedKey, value: selectedOption })
        console.log(displayedActions)
    };


    return (<div id="hotkey-page">
        <div id="title">
            <h1>Hotkeys</h1>
            <Link to="../obspage"><button>Obs Page</button></Link>
        </div>



        <p>selected option: {selectedOption} </p>
        <p>selected key: {selectedKey} </p>
        <div>

            <select name="actions" onChange={(e) => { setSelectedOption(e.target.value) }}>{
                Object.keys(keyMap).map((act, index) => {
                
                    return (
                        <div key={index}>
                            <option>{act}</option>
                        </div>)
                }

                )
            }
            </select>
            <p>Type Key</p>

            <input placeholder="key"
                onChange={(e) => { setSelectedKey(e.target.value) }}
            ></input>

            <button onClick={() => {
                setDisplayedActions([
                    ...displayedActions,
                    { key: selectedKey, value: selectedOption }
                ]);
            }}>Save</button>

        </div>

        <div id="hotkey-display-list"> {displayedActions.map(act =>
            <div className="hotkeylist-action" key={act.key}>
                <div>{act.value}</div>
                <div>{act.key}</div>
            </div>
        )}</div>




        <img className="helpicon" src={help} onClick={clickHelp} />
        {
            needHelp ? (<div><p>Use this page to change or set up hotkeys for actions you created on the obs page</p></div>) : null
        }

    </div>)


}
=======
import { useEffect, useState } from "react";
import "./Hotkeys.css";
import { Link } from "react-router-dom";
import help from "../../assets/help.png";
import { useHotkeys, useRecordHotkeys } from "react-hotkeys-hook";
import { func } from "prop-types";

export const HotkeyPage = ({ keyMap, setKeyMap }) => {
  const [selectedOption, setSelectedOption] = useState(keyMap[0].name);
  const [selectedKey, setSelectedKey] = useState("");
  const [needHelp, setNeedHelp] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState("");
  const [isDone, setIsDone] = useState(false);

  const clickHelp = () => {
    setNeedHelp((prevValue) => !prevValue);
  };

  const [keys, { start, stop, isRecording }] = useRecordHotkeys();
  return (
    <div id="hotkey-page">
      <div id="title">
        <h1>Hotkeys</h1>
        <Link to="../TriggerEventsPage">
          <button>Trigger Events</button>
        </Link>
      </div>

      {/* <p>selected option: {selectedOption} </p>
      <p>selected key: {selectedKey} </p> */}
      <p>Selected action:</p>
      <div>
        <select
          name="actions"
          onChange={(e) => {
            setSelectedOption(e.target.value);
          }}
          value = {selectedOption}
        >
          {keyMap.map((a) => {
            return (
              <div key={a.hotkey}>
                <option>{a.name}</option>
              </div>
            );
          })}
        </select>
        <p>Type the key combination you'd like to set for {selectedOption}</p>

        <input
          placeholder="type key combination"
          onChange={(e) => {
            // setSelectedKey(e.target.value);
            setRecordedKeys(Array.from(keys).join(" + "));
            console.log("input changing: ", recordedKeys, e.target.value);
          }}
          onClick={start}
          value={Array.from(keys).join(" + ")}
        ></input>
        <button
          onClick={() => {
            stop();
            setRecordedKeys(Array.from(keys).join(" + "));
            setIsDone(true)
          }}
        >
          done
        </button>
        {isDone ? <button
          onClick={() => {
            // setRecordedKeys(Array.from(keys).join(" + "));
            setKeyMap(
              keyMap.map((a) => {
                console.log(a.name, selectedOption);
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

            console.log("clicked save: ", recordedKeys);
            setIsDone(!isDone);
          }}
        >
          Save
        </button> : null}
      </div>
      {/* <div>
        <p>Is recording: {isRecording ? "yes" : "no"}</p>
        <p>Recorded keys: {Array.from(keys).join(" + ")}</p>
        <br />
        <button onClick={start}>Record</button>
        <button onClick={stop}>Stop</button>
      </div> */}

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
            the Trigger Events page.
          </p>
        </div>
      ) : null}
    </div>
  );
};
>>>>>>> 3e3fdd089715ffbfd3b3faa785d3628b63a7c8f6
