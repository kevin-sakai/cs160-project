import React, { useState } from "react"
import blacktriangle from '../../assets/Black_triangle.svg'

export const SelectComponent = ({options, placeholder = "", onChange, selectedKey, open, setOpen}) => {

    const [inputValue, setInputValue] = useState('');

    const onInputChange = (e) => {
        setInputValue(e.target.value);
    };
    const onItemSelected = (option) => {
        onChange !== undefined && onChange(option.hotkey);
        onChange !== undefined && setInputValue(option.value);
        setOpen(false);
    }
    console.log(options);

    return (
        <div className="dropdown-container">
            <div className="input-container">
                <input type="text"
                    value={inputValue}
                    placeholder={placeholder}
                    onChange={onInputChange} />
                <div className="input-arrow-container">
                    <img className="input-arrow" src={blacktriangle}></img>
                </div>
            </div>

        <div>{options.map(act =>
            <div className="hotkeylist-action">
                <div>{act.action}</div>
                <div>{act.hotkey}</div>
            </div>
        )}</div>
        </div>)
}