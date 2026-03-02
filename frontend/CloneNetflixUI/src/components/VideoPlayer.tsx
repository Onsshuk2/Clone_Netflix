import React, { useRef } from "react";

interface VideoPlayerProps {
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    videoRef.current?.play();
  };

  const handlePause = () => {
    videoRef.current?.pause();
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      } else if ((videoRef.current as any).msRequestFullscreen) {
        (videoRef.current as any).msRequestFullscreen();
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center bg-black rounded-2xl shadow-2xl p-4">
      <video
        ref={videoRef}
        src={src}
        controls
        className="w-full max-w-3xl rounded-xl bg-black"
        poster="/no-image.png"
      />
      <div className="flex gap-4 mt-4">
        <button onClick={handlePlay} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">Play</button>
        <button onClick={handlePause} className="px-4 py-2 bg-gray-700 text-white rounded-lg font-bold">Pause</button>
        <button onClick={handleFullscreen} className="px-4 py-2 bg-purple-700 text-white rounded-lg font-bold">Fullscreen</button>
      </div>
    </div>
  );
};

export default VideoPlayer;
