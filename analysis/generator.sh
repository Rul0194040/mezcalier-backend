#!/bin/bash

#You'll need https://git-quick-stats.sh/ to be installed in your system

# check if command exists and fail otherwise
command_exists() {
  command -v "$1" >/dev/null 2>&1
  if [[ $? -ne 0 ]]; then
    echo "I require $1 but it's not installed. Aborting."
    exit 1
  fi
}

for COMMAND in "git-quick-stats" "mkdir"; do
    command_exists "${COMMAND}"
done

BASEPATH="/home/erik/dev"
STATS="mezcalier-back/analysis/stats"

#al principio no habia nada, solo existia el back
PREFIX="01-2aNov"
echo "Generating $PREFIX..."
mkdir -p $BASEPATH/$STATS/$PREFIX
export _GIT_SINCE="2020-11-16"
export _GIT_UNTIL="2020-11-30"
cd $BASEPATH/mezcalier-back
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/back.txt

#Después continuamos con el front
PREFIX="02-1aDic"
echo "Generating $PREFIX..."
mkdir -p $BASEPATH/$STATS/$PREFIX
export _GIT_SINCE="2020-12-01"
export _GIT_UNTIL="2020-12-15"
cd $BASEPATH/mezcalier-front
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/front.txt
cd $BASEPATH/mezcalier-back
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/back.txt

PREFIX="03-2aDic"
echo "Generating $PREFIX..."
mkdir -p $BASEPATH/$STATS/$PREFIX
export _GIT_SINCE="2020-12-16"
export _GIT_UNTIL="2020-12-31"
cd $BASEPATH/mezcalier-front
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/front.txt
cd $BASEPATH/mezcalier-back
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/back.txt

PREFIX="04-1aEne"
echo "Generating $PREFIX..."
mkdir -p $BASEPATH/$STATS/$PREFIX
export _GIT_SINCE="2021-01-01"
export _GIT_UNTIL="2021-01-15"
cd $BASEPATH/mezcalier-front
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/front.txt
cd $BASEPATH/mezcalier-back
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/back.txt

PREFIX="05-2aEne"
echo "Generating $PREFIX..."
mkdir -p $BASEPATH/$STATS/$PREFIX
export _GIT_SINCE="2021-01-16"
export _GIT_UNTIL="2021-01-31"
cd $BASEPATH/mezcalier-admin
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/admin.txt
cd $BASEPATH/mezcalier-front
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/front.txt
cd $BASEPATH/mezcalier-back
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/back.txt

PREFIX="06-1aFeb"
echo "Generating $PREFIX..."
mkdir -p $BASEPATH/$STATS/$PREFIX
export _GIT_SINCE="2021-02-01"
export _GIT_UNTIL="2021-02-15"
cd $BASEPATH/mezcalier-admin
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/admin.txt
cd $BASEPATH/mezcalier-front
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/front.txt
cd $BASEPATH/mezcalier-back
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/back.txt

PREFIX="07-2aFeb"
echo "Generating $PREFIX..."
mkdir -p $BASEPATH/$STATS/$PREFIX
export _GIT_SINCE="2021-02-16"
export _GIT_UNTIL="2021-02-28"
cd $BASEPATH/mezcalier-admin
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/admin.txt
cd $BASEPATH/mezcalier-front
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/front.txt
cd $BASEPATH/mezcalier-back
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/back.txt

PREFIX="08-1aMar"
echo "Generating $PREFIX..."
mkdir -p $BASEPATH/$STATS/$PREFIX
export _GIT_SINCE="2021-03-01"
export _GIT_UNTIL="2021-03-15"
cd $BASEPATH/mezcalier-admin
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/admin.txt
cd $BASEPATH/mezcalier-front
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/front.txt
cd $BASEPATH/mezcalier-back
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/back.txt



#el 28 de enero se adquieren las plantillas admin y front
PREFIX="0X-StartTemplates"
echo "Generating $PREFIX..."
mkdir -p $BASEPATH/$STATS/$PREFIX
export _GIT_SINCE="2021-01-28"
export _GIT_UNTIL="2021-02-15"
cd $BASEPATH/mezcalier-admin
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/admin.txt
cd $BASEPATH/mezcalier-front
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/front.txt
cd $BASEPATH/mezcalier-back
git-quick-stats -T>$BASEPATH/$STATS/$PREFIX/back.txt




#!/bin/bash

#You'll need https://github.com/ejwa/gitinspector to be installed in your system

# check if command exists and fail otherwise
command_exists() {
  command -v "$1" >/dev/null 2>&1
  if [[ $? -ne 0 ]]; then
    echo "I require $1 but it's not installed. Aborting."
    exit 1
  fi
}

for COMMAND in "gitinspector" "mkdir"; do
    command_exists "${COMMAND}"
done

BASEPATH="/home/erik/dev"
STATS="labs-back/analysis/stats"

PREFIX="01-1aMarzo"
echo "Generating $PREFIX..."
mkdir -p $BASEPATH/$STATS/$PREFIX
export SINCE="2021-03-01"
export UNTIL="2021-03-15"
cd $BASEPATH/labs-back
gitinspector -HlmrTw -F html -f ts,html,css,scss,json --since $SINCE --until $UNTIL >$BASEPATH/$STATS/$PREFIX/back.html

cd $BASEPATH/labs-admin
gitinspector -HlmrTw -F html -f ts,html,css,scss,json --since $SINCE --until $UNTIL >$BASEPATH/$STATS/$PREFIX/admin.html


PREFIX="02-2aMarzo"
echo "Generating $PREFIX..."
mkdir -p $BASEPATH/$STATS/$PREFIX
export SINCE="2021-03-16"
export UNTIL="2021-03-31"
cd $BASEPATH/labs-back
gitinspector -HlmrTw -F html -f ts,html,css,scss,json --since $SINCE --until $UNTIL >$BASEPATH/$STATS/$PREFIX/back.html

cd $BASEPATH/labs-admin
gitinspector -HlmrTw -F html -f ts,html,css,scss,json --since $SINCE --until $UNTIL >$BASEPATH/$STATS/$PREFIX/admin.html

PREFIX="03-1aAbril"
echo "Generating $PREFIX..."
mkdir -p $BASEPATH/$STATS/$PREFIX
export SINCE="2021-04-01"
export UNTIL="2021-04-15"
cd $BASEPATH/labs-back
gitinspector -HlmrTw -F html -f ts,html,css,scss,json --since $SINCE --until $UNTIL >$BASEPATH/$STATS/$PREFIX/back.html

cd $BASEPATH/labs-admin
gitinspector -HlmrTw -F html -f ts,html,css,scss,json --since $SINCE --until $UNTIL >$BASEPATH/$STATS/$PREFIX/admin.html

PREFIX="04-2aAbril"
echo "Generating $PREFIX..."
mkdir -p $BASEPATH/$STATS/$PREFIX
export SINCE="2021-04-16"
export UNTIL="2021-04-30"
cd $BASEPATH/labs-back
gitinspector -HlmrTw -F html -f ts,html,css,scss,json --since $SINCE --until $UNTIL >$BASEPATH/$STATS/$PREFIX/back.html

cd $BASEPATH/labs-admin
gitinspector -HlmrTw -F html -f ts,html,css,scss,json --since $SINCE --until $UNTIL >$BASEPATH/$STATS/$PREFIX/admin.html