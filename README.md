<!--
    Modifications copyright (C) 2017 David Ćavar
 -->
# This is a legacy project now. New project is at https://github.com/Palethorn/nas-extension

Forked from https://github.com/gramk/chrome-hls and added additional features.

# Native HLS + MPEG-Dash Extension

Allows HLS and MPEG-Dash native playback in chrome and firefox browsers

# Usage

1. Install extension from [chrome webstore](https://chrome.google.com/webstore/detail/native-mpeg-dash-%2B-hls-pl/cjfbmleiaobegagekpmlhmaadepdeedn)/[mozilla addons](https://addons.mozilla.org/en-US/firefox/addon/native-mpeg-dash-hls-playback/)
2. Click on any m3u8 or mpd link inside chrome/firefox to play it directly in a new tab

The extension can be disabled by clicking on the icon if the request filter on m3u8 links is too disruptive.

# Build instructions
Requirements:
 - python2
 - jinja2
 - pyyaml

Build targets
 - chrome_debug - Full version including console logs
 - chrome_prod - Full version without console logs
 - firefox_debug - Stripped down version with console logs
 - firefox_prod - Stripped down version without console logs

 AMO(addons.mozilla.org) has some restrictions for publishing the extension on store which requires disabling some functionality 
 such as version selection on extension config. 
 You can still build and use full unpacked chrome version of the extension on Firefox.

Build for Firefox
python build.py -e firefox_debug

Build for Chrome
python build.py -e chrome_debug

Load unpacked extension to Firefox:
 - Type in about:debugging into address bar
 - Click Load Temporary Add-on
 - Navigate to /project_path/dist/debug/firefox/manifest.json

Load unpacked extension to Chrome:
 - Type chrome://extensions/ into address bar
 - Click Load Unpacked
 - Navigate to /project_path/dist/debug/chrome
 - Click Open

build.py is the simple pre-processing script using jinja2 for code inclusion or exclusion based on target. 

# Some Developer Notes

By default, the browser downloads any m3u8 and mpd files that were requested. This plugin checks any links to see if
they match.
If that's the case, it opens a new tab on a video player that uses the [hlsjs][] and [dashjs][] library. This extension
is just a wrapper those players for chrome.

[hlsjs]: https://github.com/dailymotion/hls.js
[dashjs]: https://github.com/Dash-Industry-Forum/dash.js

#License
Released under [Apache 2.0 License](LICENSE)
