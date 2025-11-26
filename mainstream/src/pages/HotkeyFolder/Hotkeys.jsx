import { useState } from "react";
import { SelectComponent } from "./SelectedComponent";
import './Hotkeys.css';
export const Hotkey = () => {
    let actions = [
        {action: "action 1", hotkey: "a"},
        {action: "action 2", hotkey: "b"},
        {action: "action 3", hotkey: "c"},
        {action: "action 4", hotkey: "d"},
    ];

    const [selectedOption, setSelectedOption] = useState("")
    return (<div>
        <SelectComponent 
        options={actions}
        onChange={(item)=> setSelectedOption(item)}
        selectedKey={selectedOption}
        placeholder={"type to search"}
        />
        <h1>Hotkeys</h1>
        <button>trigger events</button>
        <div><div>placeholder for drop down menu</div><div>placeholder for key</div>
        </div>
        <div>{actions.map(act => 
            <div className="hotkeylist-action">
                <div>{act.action}</div>
                <div>{act.hotkey}</div>
            </div>
        )}</div>

        
    </div>)
}