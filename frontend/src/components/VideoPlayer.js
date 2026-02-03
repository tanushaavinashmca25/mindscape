import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ lecture, onProgress }) => {
  const [duration, setDuration] = useState(0);
  const lastTimeRef = useRef(0);
  const accumulatedWatchTimeRef = useRef(0);
  const SKIP_THRESHOLD = 2; // Maximum allowed seconds difference to consider as continuous playback

const handleProgress = (state) => {
  const { playedSeconds } = state;

  const delta = playedSeconds - lastTimeRef.current;

  // accumulate only forward play
  if (delta > 0) {
    accumulatedWatchTimeRef.current += delta;
  }

  lastTimeRef.current = playedSeconds;

  onProgress({
    playedSeconds,
    accumulated: accumulatedWatchTimeRef.current,
    duration,
  });
};


  return (
    <div className="player-wrapper">
      <ReactPlayer
        url={`https://mindscape-ghx1.onrender.com${lecture.video_path}`}
        width="100%"
        height="100%"
        controls
        onProgress={handleProgress}
        onDuration={(d) => setDuration(d)}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload',
              onContextMenu: (e) => e.preventDefault(),
            },
          },
        }}
        className="react-player"
      />
    </div>
  );
};

export default VideoPlayer;
