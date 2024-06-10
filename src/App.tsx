// App.tsx
import { useState } from 'react';
import './App.css';
import { useTorrentStream } from './useTorrentStream';

function App() {
  const [torrentId, setTorrentId] = useState(
    'https://webtorrent.io/torrents/sintel.torrent'
  );

  const {
    torrent,
    progress,
    downloadSpeed,
    uploadSpeed,
    numPeers,
    downloaded,
    total,
    remaining,
  } = useTorrentStream(torrentId);

  return (
    <div className="app">
      <div>
        <div id="progressBar" style={{ width: `${progress}%` }}></div>
        <video id="output" controls autoPlay></video>
      </div>
      <div id="status">
        <div>
          <span className={torrent?.done ? 'show-seed' : 'show-leech'}>
            {torrent?.done ? 'Seeding' : 'Downloading'}
          </span>
          <code>
            <a id="torrentLink" href={torrentId}>
              {torrentId}
            </a>
          </code>
          <span className={torrent?.done ? 'show-seed' : 'show-leech'}>
            {torrent?.done ? ' to ' : ' from '}
          </span>
          <code id="numPeers">{numPeers} peers</code>.
        </div>
        <div>
          <code id="downloaded">{downloaded}</code>
          of <code id="total">{total}</code>—{' '}
          <span id="remaining">{remaining}</span>
          <br />
          &#x2198;<code id="downloadSpeed">{downloadSpeed}/s</code>/ &#x2197;
          <code id="uploadSpeed">{uploadSpeed}/s</code>
        </div>
      </div>
    </div>
  );
}

export default App;
