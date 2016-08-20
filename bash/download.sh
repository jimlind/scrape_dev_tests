export DISPLAY=:1

url=${1:?Error: First argument (url) not passed}
path=${2:?Error: Second argument (path) not passed}

surfLoadTime=15
sourceLoadTime=300

if [ "$3" == "slow" ]
then
  surfLoadTime=30
  sourceLoadTime=600
fi

printf "Running."

# Remove Previous Files
rm "$path" &> /dev/null
sleep 5

# Disable Scripts, Plugins, and Images
surf -ips "http://proxy-bg.com/index.php?b=24" &> /dev/null &
sleep "$surfLoadTime"

# Type URL in the Input Field and Press Return
xdotool key --delay 500 "Tab" "Tab"
sleep 1
xdotool type "$1"
sleep 1
xdotool key "Return"
sleep "$surfLoadTime"

# View Source
xdotool key --clearmodifiers "ctrl+o"

SECONDS=0
while [ ! -s "$2" -a "$SECONDS" -lt "$sourceLoadTime" ]
do
  printf '.'
  sleep 15

  xdotool key --clearmodifiers "ctrl+a"
  sleep 1

  xdotool key --clearmodifiers "ctrl+c"
  sleep 5

  xclip -o 1> "$2" 2> /dev/null
  sleep 5
done

sleep 10

printf "\n"
exec &> /dev/null
pkill surf
sleep 5
