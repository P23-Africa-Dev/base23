'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
    messageId: number;
    audioUrl: string;
    isOwner: boolean;
    playingAudio: number | null;
    onSetPlayingAudio: (id: number | null) => void;
};

export default function VoiceNotePlayer({ messageId, audioUrl, isOwner, playingAudio, onSetPlayingAudio }: Props) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => {
            setIsPlaying(false);
            onSetPlayingAudio(null);
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [onSetPlayingAudio]);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
            onSetPlayingAudio(null);
        } else {
            if (playingAudio && playingAudio !== messageId) {
                const otherAudio = document.querySelector(`audio[data-message-id="${playingAudio}"]`) as HTMLAudioElement;
                if (otherAudio) otherAudio.pause();
            }
            audio.play();
            setIsPlaying(true);
            onSetPlayingAudio(messageId);
        }
    };

    const fmt = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const generateWaveform = () => {
        const bars = [];
        for (let i = 0; i < 25; i++) {
            const height = Math.random() * 16 + 4;
            const progress = duration > 0 ? currentTime / duration : 0;
            const isActive = i / 25 <= progress;
            bars.push(
                <div
                    key={i}
                    className={`w-0.5 flex-shrink-0 rounded-full transition-colors duration-150 ${
                        isActive ? (isOwner ? 'bg-white' : 'bg-purple-600') : isOwner ? 'bg-white/30' : 'bg-gray-300'
                    }`}
                    style={{ height: `${height}px` }}
                />,
            );
        }
        return bars;
    };

    return (
        <div
            className={`flex w-full max-w-[250px] min-w-0 items-center space-x-2 rounded-2xl p-3 ${
                isOwner ? 'bg-[#6E28D9] text-white' : 'border-2 border-[#A47AF0] bg-white'
            }`}
        >
            <audio ref={audioRef} data-message-id={messageId} preload="metadata">
                <source src={audioUrl} type="audio/webm" />
                <source src={audioUrl} type="audio/mp4" />
                <source src={audioUrl} type="audio/wav" />
            </audio>

            <button
                onClick={togglePlayPause}
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                    isOwner ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                }`}
            >
                {isPlaying ? (
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                ) : (
                    <svg className="ml-0.5 h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                )}
            </button>

            <div className="flex h-5 min-w-0 flex-1 items-center justify-center space-x-0.5 overflow-hidden">{generateWaveform()}</div>

            <div className={`flex-shrink-0 text-xs font-medium ${isOwner ? 'text-white/80' : 'text-gray-500'}`}>
                <div className="text-right whitespace-nowrap">
                    {fmt(currentTime)}
                    <br />
                    <span className="text-xs opacity-70">{fmt(duration)}</span>
                </div>
            </div>
        </div>
    );
}
