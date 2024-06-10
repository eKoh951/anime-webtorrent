import { useEffect, useState } from 'react';
import './App.css';
import WebTorrent from 'webtorrent';
import moment from 'moment';

function App() {
  const [torrent, setTorrent] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [numPeers, setNumPeers] = useState(0);
  const [downloaded, setDownloaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const client = new WebTorrent();
    const torrentId = 'https://webtorrent.io/torrents/sintel.torrent';

    navigator.serviceWorker.register('/sw.min.js', { scope: './' }).then(reg => {
      const worker = reg.active || reg.waiting || reg.installing;
      function checkState(worker: ServiceWorker) {
        return worker.state === 'activated' && client.createServer({ controller: reg }) && download();
      }

      if (!checkState(worker)) {
        worker.addEventListener('statechange', ({ target }: Event) => checkState(target as ServiceWorker));
      }
    });

    function download() {
      client.add(torrentId, (torrent: any) => {
        setTorrent(torrent);

        const file = torrent.files.find((file: any) => file.name.endsWith('.mp4'));
        file.streamTo(document.querySelector('#output'));

        torrent.on('done', onDone);
        setInterval(onProgress, 500);
        onProgress();

        function onProgress() {
          setNumPeers(torrent.numPeers);
          setProgress(Math.round(torrent.progress * 100 * 100) / 100);
          setDownloaded(torrent.downloaded);
          setTotal(torrent.length);
          setDownloadSpeed(torrent.downloadSpeed);
          setUploadSpeed(torrent.uploadSpeed);

          let remaining;
          if (torrent.done) {
            remaining = 'Done.';
          } else {
            remaining = moment.duration(torrent.timeRemaining / 1000, 'seconds').humanize();
            remaining = remaining[0].toUpperCase() + remaining.substring(1) + ' remaining.';
          }
          setRemaining(remaining);
        }

        function onDone() {
          onProgress();
        }
      });
    }

    return () => {
      client.destroy();
    };
  }, []);

  function prettyBytes(num: number) {
    const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const neg = num < 0;
    if (neg) num = -num;
    if (num < 1) return (neg ? '-' : '') + num + ' B';
    const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
    const unit = units[exponent];
    num = Number((num / Math.pow(1000, exponent)).toFixed(2));
    return (neg ? '-' : '') + num + ' ' + unit;
  }

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
            <a id="torrentLink" href="https://webtorrent.io/torrents/sintel.torrent">
              sintel.torrent
            </a>
          </code>
          <span className={torrent?.done ? 'show-seed' : 'show-leech'}>
            {torrent?.done ? ' to ' : ' from '}
          </span>
          <code id="numPeers">{numPeers} peers</code>.
        </div>
        <div>
          <code id="downloaded">{prettyBytes(downloaded)}</code>
          of <code id="total">{prettyBytes(total)}</code>
          — <span id="remaining">{remaining}</span>
          <br />
          &#x2198;<code id="downloadSpeed">{prettyBytes(downloadSpeed)}/s</code>
          / &#x2197;<code id="uploadSpeed">{prettyBytes(uploadSpeed)}/s</code>
        </div>
      </div>
    </div>
  );
}

export default App;