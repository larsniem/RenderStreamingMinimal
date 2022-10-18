import { getServerConfig, getRTCConfiguration } from "../../js/config.js";
import { VideoPlayer } from "../../js/videoplayer.js";
import { RenderStreaming } from "../../module/renderstreaming.js";
import { Signaling, WebSocketSignaling } from "../../module/signaling.js";

/** @type {Element} */
let playButton;
/** @type {RenderStreaming} */
let renderstreaming;
/** @type {boolean} */
let useWebSocket;

const playerDiv = document.getElementById('player');
const lockMouseCheck = document.getElementById('lockMouseCheck');
const videoPlayer = new VideoPlayer();

setup();

window.document.oncontextmenu = function () {
  return false;     // cancel default menu
};

window.addEventListener('resize', function () {
  videoPlayer.resizeVideo();
}, true);

window.addEventListener('beforeunload', async () => {
  if(!renderstreaming)
    return;
  await renderstreaming.stop();
}, true);

async function setup() {
  const res = await getServerConfig();
  useWebSocket = res.useWebSocket;
  showPlayButton();
}

function showPlayButton() {
  if (!document.getElementById('playButton')) {
    const elementPlayButton = document.createElement('img');
    elementPlayButton.id = 'playButton';
    elementPlayButton.src = '../../images/Play.png';
    elementPlayButton.alt = 'Start Streaming';
    playButton = document.getElementById('player').appendChild(elementPlayButton);
    playButton.addEventListener('click', onClickPlayButton);
  }
}

function onClickPlayButton() {
  playButton.style.display = 'none';

  // add video player
  videoPlayer.createPlayer(playerDiv, lockMouseCheck);
  setupRenderStreaming();
}

async function setupRenderStreaming() {
  const signaling = useWebSocket ? new WebSocketSignaling() : new Signaling();
  const config = getRTCConfiguration();
  renderstreaming = new RenderStreaming(signaling, config);
  renderstreaming.onConnect = onConnect;
  renderstreaming.onDisconnect = onDisconnect;
  renderstreaming.onTrackEvent = (data) => videoPlayer.addTrack(data.track);
  renderstreaming.onGotOffer = setCodecPreferences;

  await renderstreaming.start();
  await renderstreaming.createConnection();
}

function onConnect() {
  const channel = renderstreaming.createDataChannel("input");
  videoPlayer.setupInput(channel);
}

async function onDisconnect(connectionId) {
  console.log(`Disconnect: ${connectionId}.`);
  await renderstreaming.stop();
  renderstreaming = null;
  videoPlayer.deletePlayer();
  showPlayButton();
}

function setCodecPreferences() {
  /** @type {RTCRtpCodecCapability[] | null} */
  let selectedCodecs = null;


  if (selectedCodecs == null) {
    return;
  }
  const transceivers = renderstreaming.getTransceivers().filter(t => t.receiver.track.kind == "video");
  if (transceivers && transceivers.length > 0) {
    transceivers.forEach(t => t.setCodecPreferences(selectedCodecs));
  }
}