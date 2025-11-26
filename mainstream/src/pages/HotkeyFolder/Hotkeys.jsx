import { useState } from "react";
import { SelectComponent } from "./SelectedComponent";
import './Hotkeys.css';
import { Link } from "react-router-dom";
import help from '../../assets/help.png'

export const Hotkey = () => {
    let nextId = 0;


    let actions = [

        { key: "a", value: "action 1" },
        { key: "b", value: "action 2" },
        { key: "c", value: "action 3" },
        { key: "d", value: "action 4" },
    ];
    const [displayedActions, setDisplayedActions] = useState([
        { key: "a", value: "action 1" },
        { key: "b", value: "action 2" },
    ]);
    const [selectedOption, setSelectedOption] = useState("action 1");
    const [selectedKey, setSelectedKey] = useState("a");
    const [open, setOpen] = useState(false);
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
            {/* <SelectComponent
                options={actions}
                onChange={(item) => {
                    console.log('ITEM IS: ', item)
                    console.log('selected item IS: ', selectedOption)
                    setSelectedOption(item)
                    console.log('selected option after item IS: ', selectedOption)
                }}
                selectedOption={selectedOption}
                placeholder={"type to search"}
                open={open}
                setOpen={setOpen}

                setSelectedOption={setSelectedOption}
            /> */}
            <select name="actions" onChange={(e)=>{setSelectedOption(e.target.value)}}>{
                actions.map(act =>
                    <div>
                        <option>{act.value}</option>
                    </div>
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