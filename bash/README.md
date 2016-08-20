Bash Downloader 
So this is a really odd piece of stuff. Ends up being way over engineered.

Some sites that block bots don't like it if you don't use a real browser, so we need to hit them with a 
real browser and control the browser with keyboard shortcuts. The whole point is that this runs headless
and the hardware I've been testing it on is a BeagleBone.

Tools Needed:
Xvfb - Virtual frame buffer doesn't require us to have a display for X Window System
xdotool - Send keys to the that X Window System
xclip - Allows easy manipulation of the clipboard
surf - Super lightweight scriptable browser


Usage:
Second command allows a larger wait time before quitting
Third theoretically kills everything and restarts the BeagleBone

bash download.sh http://www.google.com /tmp/google.txt
bash download.sh http://www.google.com /tmp/google.txt slow
bash kill.sh
