node fifo.js < /dev/dvb/adapter0/dvr0 | ffmpeg -loglevel warning -i - -f hls -hls_time 10 -hls_list_size 5 -hls_wrap 100 -strict -2 media/a.m3u8
