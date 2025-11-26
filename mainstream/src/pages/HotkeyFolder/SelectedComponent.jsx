import React, { useEffect, useState } from "react"
import blacktriangle from '../../assets/Black_triangle.svg'

export const SelectComponent = ({ options, placeholder = "", onChange, selectedOption, open, setOpen , setSelectedOption}) => {

    const [inputValue, setInputValue] = useState('');

    useEffect(
        () => {
            if (selectedOption) {
                setInputValue(options.find((o) => o.value === selectedOption).value);
                setSelectedOption(inputValue)
                console.log(selectedOption)

            }
        }, [selectedOption, options]
    );

    const onInputChange = (e) => {
        setInputValue(e.target.value);
    };
    const onItemSelected = (option) => {
        onChange !== undefined && onChange(option.hotkey);
        onChange !== undefined && setInputValue(option.value);
        setOpen(false);
        // setSelectedOption(option);
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
                {selectedOption || inputValue ? (<div onClick={clearDropDown} className="input-clear-container ">
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