#!/bin/bash

# check if command exists and fail otherwise
command_exists() {
  command -v "$1" >/dev/null 2>&1
  if [[ $? -ne 0 ]]; then
    echo "I require $1 but it's not installed. Aborting."
    exit 1
  fi
}

#read values from .env vile
read_var() {
  if [ -z "$1" ]; then
    echo "Environment variable name is required"
    return
  fi

  local ENV_FILE='.env'
  if [ ! -z "$2" ]; then
    ENV_FILE="$2"
  fi

  local VAR
  VAR=$(grep $1 "$ENV_FILE" | xargs)
  IFS="=" read -ra VAR <<< "$VAR"
  echo ${VAR[1]}
}

#read .env values
MYSQL_PORT=$(read_var MYSQL_PORT .env)
MYSQL_HOST=$(read_var MYSQL_HOST .env)
MYSQL_DB=$(read_var MYSQL_DB .env)
MYSQL_USER=$(read_var MYSQL_USER .env)
MYSQL_PASSWORD=$(read_var MYSQL_PASSWORD .env)
export MYSQL_PWD=$MYSQL_PASSWORD
# colors to be used
RED='\033[0;31m'
NC='\033[0m' # No Color

# verify dependencies
for COMMAND in "mysql" "awk" "grep"; do
    command_exists "${COMMAND}"
done

echo -e "${RED}";
echo "       All your tables belog to us, and will be truncated..."
echo -e "${NC}";
echo "";
echo "       Using connection: mysql://${MYSQL_USER}:************@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DB}"
echo "";
echo "";
echo "       Press any key to continue scanning for tables or CTRL+C to abort." 
echo "";
read -p "" -n1 -s

TABLES=$(mysql --protocol=TCP --user=$MYSQL_USER --host=$MYSQL_HOST --port=$MYSQL_PORT $MYSQL_DB -e 'show tables' | awk '{ print $1}' | grep -v '^Tables' )

FINAL="";
TRUNCATE_FOUND="";
for t in $TABLES
do
  #except migrations
  if [ $t != "migrations" ]; then
	  FINAL="$FINAL       $t\n";
    TRUNCATE_FOUND="$TRUNCATE_FOUND TRUNCATE TABLE $t;";
  fi
done

echo "";
echo "";
echo -e "       ${RED}¡¡¡ The following tables will be trucated !!!"
echo "";
echo -e "$FINAL ${NC}";
echo "";
echo -e "       ${RED}¡This is your last chance!${NC}"
echo "";
echo    "       Press any key to execute the truncate command or CTRL+C to abort."
echo "";
read -p  ""  -n1 -s
echo -e "       ${RED}Truncating tables...${NC}"
echo "";
mysql --protocol=TCP --user=$MYSQL_USER --host=$MYSQL_HOST --port=$MYSQL_PORT $MYSQL_DB -e "SET foreign_key_checks = 0; $TRUNCATE_FOUND; SET foreign_key_checks = 1;"
echo -e "       ${RED}¡It's done!${NC}"
echo "";
echo "       There is no more data in your tables."
echo "";
