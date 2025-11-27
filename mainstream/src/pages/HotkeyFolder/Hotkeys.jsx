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