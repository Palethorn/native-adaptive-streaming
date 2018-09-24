<!--
    Modifications copyright (C) 2017 David Ćavar
 -->
Forked from https://github.com/gramk/chrome-hls and added additional features.

# Native HLS + MPEG-Dash Extension

Allows HLS and MPEG-Dash native playback in chrome and firefox browsers

# Usage

1. Install extension from [chrome webstore](https://chrome.google.com/webstore/detail/native-mpeg-dash-%2B-hls-pl/cjfbmleiaobegagekpmlhmaadepdeedn)/[mozilla addons]()
2. Click on any m3u8 or mpd link inside chrome/firefox to play it directly in a new tab

The extension can be disabled by clicking on the icon if the request filter on m3u8 links is too disruptive.

[chrome webstore]: not yet available
[mozilla addons]: not yet available

# Some Developer Notes

By default, the browser downloads any m3u8 and mpd files that were requested. This plugin checks any links to see if
they match.
If that's the case, it opens a new tab on a video player that uses the [hlsjs][] and [dashjs][] library. This extension
is just a wrapper those players for chrome.

[hlsjs]: https://github.com/dailymotion/hls.js
[dashjs]: https://github.com/Dash-Industry-Forum/dash.js

#License
Released under [Apache 2.0 License](LICENSE)
