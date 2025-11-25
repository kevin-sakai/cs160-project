import { useState } from 'react';
import './Notepad.css';

const NUM_TEXT_ROWS = 25;

export default function Notepad() {
  const [text, setText] = useState("");
  return (
    <div id="notepad-page">
      <div id="title">
        <h1>Notepad</h1>
      </div>
      <div id="notepad-text-entry">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start Writing A Note!"
            rows={NUM_TEXT_ROWS}>
          </textarea>
        </div>
    </div>
  );
}