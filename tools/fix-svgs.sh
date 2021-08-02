#!/usr/bin/env bash

# couldn't figure out how to get Figma to do this at export time, so we just do
# it ourselves. this is to be run manually on svgs when we import them. this is
# not not part of any automated process

# assume svgs without <title> need to be processed
for i in `grep -L "<title>" libs/ui/assets/*.svg`; do
  filename=`basename $i .svg`
  title="${filename^}"

  # remove width and height and any fill colors, add role="img"
  sed -i '' 's/ width="16" height="16"//g' $i
  sed -i '' -E 's/fill="#[A-F0-9]+"//g' $i
  sed -i '' 's/<svg /<svg role="img" /' $i
  
  # insert title attr on second line
  sed -i '' "1a\\
<title>$title</title>\\
" $i
done