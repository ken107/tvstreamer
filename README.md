# TV Streamer

### Requirements
- Hauppauge HVR-955Q
- Ubuntu 14.04.4 or later
- nginx --with-http_dav_module

### Setup
1. sudo apt-get install w-scan
2. w_scan -fa -A1 -c US -X > channels.conf

### Run
1. sh capture.sh [channel-name]
2. sh transcode.sh
3. node uploader.js
