var videoPlayers = [];

function initVideoPlayer(stream) {
    var videoPlayer = document.createElement('video');
    videoPlayer.muted = true;
    videoPlayer.volume = 0;
    videoPlayer.src = URL.createObjectURL(stream);

    videoPlayer.play();

    videoPlayers.push(videoPlayer);
}
