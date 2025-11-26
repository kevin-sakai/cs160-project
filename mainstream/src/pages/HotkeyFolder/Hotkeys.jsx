import { useState } from "react";
import { SelectComponent } from "./SelectedComponent";
import './Hotkeys.css';
import { Link } from "react-router-dom";
import help from '../../assets/help.png'

export const Hotkey = () => {

    let actions = [

        { key: "a", value: "action 1" },
        { key: "b", value: "action 2" },
        { key: "c", value: "action 3" },
        { key: "d", value: "action 4" },
    ];
    let displayedActions = [
        { key: "a", value: "action 1" },
        { key: "b", value: "action 2" },

    ];
    const [selectedOption, setSelectedOption] = useState("action 1");
    const [open, setOpen] = useState(false);
    const [needHelp, setNeedHelp] = useState(false);


    const clickHelp = () => {
        setNeedHelp((prevValue) => !prevValue);

    };


    return (<div id="hotkey-page">

        <h1>Hotkeys</h1>



        <Link to="../obspage"><button>Obs Page</button></Link>
        <p>selected option: {selectedOption} </p>
        <div>
            <SelectComponent
                options={actions}
                onChange={(item) => {
                    console.log('ITEM IS: ', item)
                    setSelectedOption(item)
                }}
                selectedKey={selectedOption}
                placeholder={"type to search"}
                open={open}
                setOpen={setOpen}
                selectedOption={selectedOption}
                setSelectedOption={selectedOption}
            />
            <p>Type Key</p>

            <input placeholder="key"></input>

            <button>Save</button>
        </div>
        <div>{displayedActions.map(act =>
            <div className="hotkeylist-action">
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