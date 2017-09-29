var hls;
var debug;
var currentVersion = "0.8.2";
var supportedVersions = ["0.5.52", "0.6.21","0.7.3","0.7.4", "0.7.7", "0.7.8", "0.7.9", "0.7.10", "0.8.0", "0.8.1", "0.8.2"]
var recoverDecodingErrorDate,recoverSwapAudioCodecDate;
var dash;

function handleMediaError(hls) {
  var now = performance.now();
  if(!recoverDecodingErrorDate || (now - recoverDecodingErrorDate) > 3000) {
    recoverDecodingErrorDate = performance.now();
    var msg = "trying to recover from media Error ..."
    console.warn(msg);
    hls.recoverMediaError();
  } else {
    if(!recoverSwapAudioCodecDate || (now - recoverSwapAudioCodecDate) > 3000) {
      recoverSwapAudioCodecDate = performance.now();
      var msg = "trying to swap Audio Codec and recover from media Error ..."
      console.warn(msg);
      hls.swapAudioCodec();
      hls.recoverMediaError();
    } else {
      var msg = "cannot recover, last media error recovery failed ..."
      console.error(msg);
    }
  }
}

function reloadPlayer(e) {
    la_url = document.querySelector("#la-url").value;
    console.log(la_url);
    if(la_url != null && la_url != '') {
        playMpd(window.location.href.split("#")[1], la_url);
    } else {
        playMpd(window.location.href.split("#")[1], null);
    }
}

function prepareLaUrlInput() {
    document.querySelector("#la-url-input").style.visibility = 'visible';
    document.querySelector("#reload-source").addEventListener('click', reloadPlayer);
}

function reset() {

    if(hls) { hls.destroy(); }
    if(dash) { dash.reset(); dash = null; }

    document.querySelector("#la-url-input").style.visibility = 'collapse';
    document.querySelector("#reload-source").removeEventListener('click', reloadPlayer);
}

function playMpd(url, la_url) {

    if(dash) { dash.reset(); dash = null; }
    var video_el = document.querySelector('video');
    video_element = video_el;
    dash = dashjs.MediaPlayer().create();

    dash.on(dashjs.MediaPlayer.events.ERROR, function (e) {
        console.error(e.error + ' : ' + e.event.message);
        if(e.error == 'key_session') {
            prepareLaUrlInput();
        }
    });

    if(la_url != null) {
        var protData = { "com.widevine.alpha": { "serverURL": la_url}};
        dash.setProtectionData(protData);
    }

    dash.initialize();

    dash.label = "mpd";
    dash.attachView(video_el);
    dash.setAutoPlay(true);
    dash.attachSource(url);
}

function playM3u8(url){
  var video = document.getElementById('video');
  if(native){
    video.classList.add("native_mode");
    video.classList.remove("zoomed_mode");
  } else {
    video.classList.remove("native_mode");
    video.classList.add("zoomed_mode");
  }

  if(hls){ hls.destroy(); }
  hls = new Hls({debug:debug});
  hls.on(Hls.Events.ERROR, function(event,data) {
    var  msg = "Player error: " + data.type + " - " + data.details;
    console.error(msg);
    if(data.fatal) {
      switch(data.type) {
        case Hls.ErrorTypes.MEDIA_ERROR:
          handleMediaError(hls);
          break;
        case Hls.ErrorTypes.NETWORK_ERROR:
           console.error("network error ...");
          break;
        default:
          console.error("unrecoverable error");
          hls.destroy();
          break;
      }
    }
   });
  var m3u8Url = decodeURIComponent(url)
  hls.loadSource(m3u8Url);
  hls.attachMedia(video);
  hls.on(Hls.Events.MANIFEST_PARSED,function() {
    video.play();
  });
  document.title = url
}

chrome.storage.local.get({
  hlsjs: currentVersion,
  debug: false,
  native: false
}, function(settings) {
  debug = settings.debug;
  native = settings.native;
  var s1 = document.createElement('script');
  var s2 = document.createElement('script');
  var version = currentVersion
  if (supportedVersions.includes(settings.hlsjs)) {
    version = settings.hlsjs
  }

    var url = window.location.href.split("#")[1];

    s1.src = chrome.runtime.getURL('dash.all.min.js');
    (document.head || document.documentElement).appendChild(s1);

    s2.src = chrome.runtime.getURL('hls.' + version + '.min.js');
    (document.head || document.documentElement).appendChild(s2);

    if(url.indexOf(".mpd") > -1) {
        s1.onload = function() { playMpd(url, null); };
    } else {
        s2.onload = function() { playM3u8(url); };
    }
});

$(window).bind('hashchange', function() {
    var url = window.location.href.split("#")[1];

    reset();

    if(url.indexOf(".mpd") > -1) {
        playMpd(url, null);
    } else {
        playM3u8(url);
    }
});
