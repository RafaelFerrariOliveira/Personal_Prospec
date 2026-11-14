#!/usr/bin/env bash
# Sobe o Personal Prospec em modo produção dentro do Codespace: SQL Server em contêiner,
# build do React servido pelo próprio API e segredos gerados fora do repositório.
# Uso: bash .devcontainer/publicar.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STATE_DIR="${PP_STATE_DIR:-$HOME/.personalprospec}"
SECRETS_FILE="$STATE_DIR/segredos.env"
PUBLISH_DIR="$STATE_DIR/publish"
PORT="${PP_PORT:-5180}"
DB_PORT="${PP_DB_PORT:-1433}"
DB_CONTAINER="${PP_DB_CONTAINER:-pp-sqlserver}"
SQL_IMAGE="${PP_SQL_IMAGE:-mcr.microsoft.com/mssql/server:2022-latest}"

: "${SEED_EMAIL:?Cadastre SEED_EMAIL nos segredos do Codespaces e recrie ou reinicie o Codespace.}"
: "${SEED_PASSWORD:?Cadastre SEED_PASSWORD nos segredos do Codespaces e recrie ou reinicie o Codespace.}"

mkdir -p "$STATE_DIR"
chmod 700 "$STATE_DIR"

# Gerados uma vez e guardados fora do repositório; o script nunca os exibe.
if [[ ! -f "$SECRETS_FILE" ]]; then
   (
      umask 077
      {
         echo "SA_PASSWORD=Pp1!$(openssl rand -hex 16)"
         echo "PEPPER_SECRET=$(openssl rand -hex 32)"
         echo "JWT_KEY=$(openssl rand -hex 32)"
      } > "$SECRETS_FILE"
   )
fi
# shellcheck disable=SC1090
source "$SECRETS_FILE"

echo "==> Banco: SQL Server em contêiner ($DB_CONTAINER)"
DB_STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
DB_WAIT_ROUNDS=90
if [[ "$(docker container inspect -f '{{.State.Running}}' "$DB_CONTAINER" 2>/dev/null)" == "true" ]]; then
   # Já estava no ar (republicação): não haverá nova mensagem de "pronto" para esperar.
   DB_WAIT_ROUNDS=0
elif docker container inspect "$DB_CONTAINER" >/dev/null 2>&1; then
   docker start "$DB_CONTAINER" >/dev/null
else
   docker run -d --name "$DB_CONTAINER" -e ACCEPT_EULA=Y -e "MSSQL_SA_PASSWORD=$SA_PASSWORD" \
      -p "$DB_PORT:1433" -v pp-sqlserver-data:/var/opt/mssql "$SQL_IMAGE" >/dev/null
fi
# Espera pelo log desta subida (--since), para não confundir com a mensagem de uma subida anterior.
for _ in $(seq 1 "$DB_WAIT_ROUNDS"); do
   if docker logs --since "$DB_STARTED_AT" "$DB_CONTAINER" 2>&1 | grep -q "SQL Server is now ready for client connections"; then
      break
   fi
   sleep 2
done

echo "==> Front: build de produção"
cd "$ROOT/frontend"
npm ci --no-audit --no-fund
VITE_API_URL=/api npm run build

echo "==> API: publish com o front em wwwroot"
rm -rf "$PUBLISH_DIR"
dotnet publish "$ROOT/backend/Src/PersonalProspec.Api/PersonalProspec.Api.csproj" -c Release -o "$PUBLISH_DIR" --nologo
mkdir -p "$PUBLISH_DIR/wwwroot"
cp -r "$ROOT/frontend/dist/." "$PUBLISH_DIR/wwwroot/"

export ASPNETCORE_ENVIRONMENT=Production
export ASPNETCORE_URLS="http://0.0.0.0:$PORT"
# O proxy do Codespaces termina o HTTPS: o app precisa ler X-Forwarded-Proto para saber que a origem é https.
export ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
export ConnectionStrings__DefaultConnection="Server=localhost,$DB_PORT;Database=PersonalProspec;User Id=sa;Password=$SA_PASSWORD;TrustServerCertificate=True;Encrypt=False"
export Pepper__Secret="$PEPPER_SECRET"
export JwtToken__JwtKey="$JWT_KEY"
export Seed__Email="$SEED_EMAIL"
export Seed__Password="$SEED_PASSWORD"

if [[ -n "${CODESPACE_NAME:-}" ]]; then
   echo "==> Endereço público: https://$CODESPACE_NAME-$PORT.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
   echo "    Para liberar o acesso externo: gh codespace ports visibility $PORT:public -c $CODESPACE_NAME"
fi
echo "==> API em http://0.0.0.0:$PORT (Ctrl+C para parar)"
cd "$PUBLISH_DIR"
exec dotnet PersonalProspec.Api.dll
