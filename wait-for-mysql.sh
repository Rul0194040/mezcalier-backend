#!/bin/bash

#funcion para obtener valores de .env
read_var() {
  if [ -z "$1" ]; then
    echo "environment variable name is required"
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

# Detectar rutas
MYSQL=$(which mysql)

#obtener valores de .env
MYSQL_PORT=$(read_var MYSQL_PORT .env)
MYSQL_HOST=$(read_var MYSQL_HOST .env)
MYSQL_DB=$(read_var MYSQL_DB .env)
MYSQL_USER=$(read_var MYSQL_USER .env)
MYSQL_PASSWORD=$(read_var MYSQL_PASSWORD .env)


until $MYSQL --protocol=TCP --user=$MYSQL_USER --password=$MYSQL_PASSWORD --host=$MYSQL_HOST $MYSQL_DB -e "SELECT 1" >/dev/null 2>&1; do
  echo "Waiting for mysql to start (mysql://$MYSQL_USER@$MYSQL_HOST:$MYSQL_PORT/$MYSQL_DB)..."
  sleep 2
done

echo -e "\nMySQL is ready"