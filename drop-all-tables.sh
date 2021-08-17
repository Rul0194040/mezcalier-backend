#!/bin/bash

# check if command exists and fail otherwise
command_exists() {
  command -v "$1" >/dev/null 2>&1
  if [[ $? -ne 0 ]]; then
    echo "I require $1 but it's not installed. Abort."
    exit 1
  fi
}

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

#obtener valores de .env
MYSQL_PORT=$(read_var MYSQL_PORT .env)
MYSQL_HOST=$(read_var MYSQL_HOST .env)
MYSQL_DB=$(read_var MYSQL_DB .env)
MYSQL_USER=$(read_var MYSQL_USER .env)
MYSQL_PASSWORD=$(read_var MYSQL_PASSWORD .env)

RED='\033[0;31m'
NC='\033[0m' # No Color

# Detectar rutas
for COMMAND in "mysql" "awk" "grep"; do
    command_exists "${COMMAND}"
done

echo -e "${RED}";
echo "       ATENCION, SE VAN A BORRAR TODAS LAS TABLAS DE LA BASE DE DATOS!"
echo -e "${NC}";
echo "";
echo "       mysql://${MYSQL_USER}:************@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DB}"
echo "";
echo "";
echo "       Presione cualquier tecla para continuar o CTRL+C para cancelar." 
echo "";
read -p "" -n1 -s

TABLES=$(mysql --protocol=TCP --user=$MYSQL_USER --password=$MYSQL_PASSWORD --host=$MYSQL_HOST --port=$MYSQL_PORT $MYSQL_DB -e 'show tables' | awk '{ print $1}' | grep -v '^Tables' )

FINAL="";
DROP_FOUND="";
for t in $TABLES
do
	FINAL="$FINAL $t\n";
  DROP_FOUND="$DROP_FOUND DROP TABLE $t;";
done

echo -e "${RED}Droping tables:\n$FINAL ${NC}";

echo -e "       ${RED}Ultima oportunidad${NC}: Presione cualquier tecla para continuar o CTRL+C para cancelar."
echo "";
read -p  ""  -n1 -s
echo -e "       ${RED}Procediendo a borrar las tables de la base de datos...${NC}"
mysql --protocol=TCP --user=$MYSQL_USER --password=$MYSQL_PASSWORD --host=$MYSQL_HOST --port=$MYSQL_PORT $MYSQL_DB -e "SET foreign_key_checks = 0; $DROP_FOUND; SET foreign_key_checks = 1;"
echo -e "${RED}¡Listo!${NC} ¡Ya no hay tablas!"
echo ""
echo "Deberías correr la migracion: npm run mig:run"
