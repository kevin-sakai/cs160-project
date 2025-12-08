import { useState } from 'react';
import './Home.css';
import introVideo from "../assets/WebsocketTutorial.mp4";

export default function Home() {
  return (
    <div id='home-page'>
      
      {/* Intro Title */}
      <h1 id="home">Home</h1>

      {/* Welcome Message */}
      <p>
        Welcome to Mainstream! We aim to help beginner streamers introduce
        themselves to essential streaming tools that enhance the overall stream
        experience.
      </p>


      {/* OBS WebSocket Instructions */}
      <div className="obs-info">
        <div className="obs-instructions">
          <h2>How to Get Your OBS WebSocket Server Info</h2>
          <p>
            To connect Mainstream to OBS, you'll need your WebSocket server's 
            <strong> IP Address</strong>, <strong>Port</strong>, and 
            <strong> Password</strong>. Here’s how to find them:
          </p>

          <ol>
            <li>Open <strong>OBS Studio</strong>.</li>
            <li>Go to <strong>Tools → WebSocket Server Settings</strong>.</li>
            <li>
              Make sure <strong>"Enable WebSocket Server"</strong> is checked.
            </li>
            <li>
              Click <strong>"Show Connect Info"</strong>. You will see:
              <ul>
                <li>Server IP (e.g., <code>127.0.0.1</code> or an IPv6 address)</li>
                <li>Server Port (default: <code>4455</code>)</li>
                <li>Password (if enabled)</li>
              </ul>
            </li>
            <li>
              Enter those values on the <strong>OBS</strong> page inside Mainstream.
            </li>
          </ol>
          <p>
            Once connected, you’ll be able to create overlays, trigger events, and
            automate scenes directly from Mainstream!
          </p>
        </div>
        
         {/* Intro Video Section */}
        <div className="intro-video-container">
          <video 
            src={introVideo}
            autoPlay
            loop
            muted
            playsInline
            className="intro-video"
          />
        </div>
      </div>

    </div>
  );
}
