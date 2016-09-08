node fifo.js < /dev/dvb/adapter0/dvr0 | ffmpeg -loglevel info -i - \
  -s 704x480 -f hls -hls_time 10 -hls_list_size 5 -hls_wrap 100 -strict -2 media/a480p.m3u8 \
  -s 352x240 -f hls -hls_time 10 -hls_list_size 5 -hls_wrap 100 -strict -2 media/a240p.m3u8
