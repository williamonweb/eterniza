'use client';
import { useEffect, useRef, useState } from 'react';

let apiPromise;
function loadPlayerApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === 'function') previous();
      resolve(window.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = () => { apiPromise = null; reject(new Error('Não foi possível carregar a prévia.')); };
    document.head.appendChild(script);
  });
  return apiPromise;
}

export default function MusicPreview({ track, playing, onPlayingChange, onClose }) {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const playingRef = useRef(playing);
  const callbackRef = useRef(onPlayingChange);
  const [error, setError] = useState('');
  playingRef.current = playing;
  callbackRef.current = onPlayingChange;

  useEffect(() => {
    let cancelled = false;
    let player;
    setError('');
    loadPlayerApi().then(YT => {
      if (cancelled || !mountRef.current) return;
      player = new YT.Player(mountRef.current, {
        videoId: track.id,
        width: '100%', height: '100%',
        playerVars: { playsinline: 1, origin: window.location.origin, rel: 0 },
        events: {
          onReady: () => { if (!cancelled && playingRef.current) player.playVideo(); },
          onStateChange: event => {
            if (cancelled) return;
            if (event.data === YT.PlayerState.PLAYING) callbackRef.current(true);
            if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) callbackRef.current(false);
          },
          onError: () => { if (!cancelled) setError('Esta música não permite reprodução aqui. Tente outra.'); },
        },
      });
      playerRef.current = player;
    }).catch(err => { if (!cancelled) setError(err.message); });
    return () => {
      cancelled = true;
      if (playerRef.current === player) playerRef.current = null;
      try { player?.destroy(); } catch {}
    };
  }, [track.id]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || typeof player.playVideo !== 'function') return;
    if (playing) player.playVideo();
    else player.pauseVideo();
  }, [playing]);

  return <section className="normal-music-preview" aria-label={`Prévia de ${track.title}`}>
    <div className="normal-music-preview-head"><div><strong>{track.title}</strong><small>{track.channel}</small></div><button type="button" onClick={onClose} aria-label="Fechar prévia">×</button></div>
    <div className="normal-music-preview-video" ref={mountRef} />
    {error && <p role="alert">{error}</p>}
    <p className="normal-hint">Se o navegador bloquear o início automático, toque no Play do vídeo.</p>
    <div className="normal-music-preview-actions"><button type="button" className="normal-button secondary" onClick={() => onPlayingChange(!playing)}>{playing ? '❚❚ Pausar' : '▶ Reproduzir'}</button><button type="button" className="normal-button" onClick={() => { track.choose(); onClose(); }}>Escolher esta música</button></div>
  </section>;
}
