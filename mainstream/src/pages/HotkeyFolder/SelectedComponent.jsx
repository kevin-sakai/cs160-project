import React, { useEffect, useState } from "react"
import blacktriangle from '../../assets/Black_triangle.svg'

export const SelectComponent = ({ options, placeholder = "", onChange, selectedKey, open, setOpen, selectedOption, setSelectedOption }) => {

    const [inputValue, setInputValue] = useState('');

    useEffect(
        () => {
            if (selectedKey) {
                setInputValue(options.find((o) => o.value === selectedKey).value);
                // setSelectedOption(options.find((o) => o.value === selectedKey).value);
            }
        }, [selectedKey, options]
    );

    const onInputChange = (e) => {
        setInputValue(e.target.value);
    };
    const onItemSelected = (option) => {
        onChange !== undefined && onChange(option.hotkey);
        onChange !== undefined && setInputValue(option.value);
        setOpen(false);
    }

    const clearDropDown = () => {
        setInputValue("");
        onChange("");
    }
    const onInputClick = () => {
        setOpen((prevValue) => !prevValue);

    };

    return (
        <div className="dropdown-container">
            <div className="input-container" onClick={onInputClick}>
                <input type="text"
                    value={inputValue}
                    placeholder={placeholder}
                    onChange={onInputChange} />
                <div className="input-arrow-container">
                    <img className="input-arrow" src={blacktriangle}></img>
                </div>
                {selectedKey || inputValue ? (<div onClick={clearDropDown} className="input-clear-container ">
                    x
                </div>) : null}
            </div>

            <div className={`dropdown ${open ? 'visible' : ""}`}> 
                {options.map(act => {
                return (
                    <div
                        key={act.key}
                        onClick={() => onItemSelected(act)}
                        className="option">

                        <div>{act.value}</div>
               
                    </div>
                );
            }

            )}</div>
        </div>)
}