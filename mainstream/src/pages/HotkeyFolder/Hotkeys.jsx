import { useState } from "react";
import { SelectComponent } from "./SelectedComponent";
import './Hotkeys.css';

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
    const [open, setOpen] = useState(false)
    return (<div>

        <h1>Hotkeys</h1>



        <button>trigger events</button>
        <p>selected option: {selectedOption} </p>
        <div>        
            <SelectComponent
            options={actions}
            onChange={(item) => {
                console.log('ITEM IS: ', item)
                setSelectedOption(item)}}
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


    </div>)
}