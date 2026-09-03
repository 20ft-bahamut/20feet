#!/usr/bin/env bash
#
# Still Form demo seed importer.
#
# demo-seed.sql uses logical (unprefixed) table names, but the site's physical
# table names carry the DB_PREFIX configured in the Laravel .env (G7 default:
# g7_). This script reads the prefix from .env, rewrites the SQL, and imports.
#
# Usage:
#   cd <laravel-app-root>
#   bash path/to/seed/import-seed.sh            # import demo-seed.sql
#   bash path/to/seed/import-seed.sh --dry-run  # print rewritten SQL, no import
#
# Options:
#   --dry-run          Print the rewritten SQL to stdout instead of importing.
#   --sql <file>       Alternative seed file (default: demo-seed.sql next to this script).
#   --prefix <p>       Override the prefix instead of reading DB_PREFIX from .env.
#   --env <file>       Path to the .env file (default: auto-detect app root).
#   --force            Skip the "tables exist" pre-check.
#   --host <h>         DB host  (overrides .env; default 127.0.0.1)
#   --port <n>         DB port  (overrides .env; default 3306)
#   --db <name>        DB name  (overrides DB_WRITE_DATABASE / DB_DATABASE)
#   --user <u>         DB user  (overrides DB_WRITE_USERNAME / DB_USERNAME)
#   --password <p>     DB password (overrides DB_WRITE_PASSWORD / DB_PASSWORD)
#
# Examples:
#   bash import-seed.sh --db stillform --user stillform          # password prompted
#   bash import-seed.sh --db g7_store --user app --prefix g7_ --dry-run
#
# If .env cannot be located at all, pass --db/--user/--password/--prefix
# explicitly (then no .env is needed).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/demo-seed.sql"
ENV_FILE=""
PREFIX_OVERRIDE=""
PREFIX_GIVEN=0
DRY_RUN=0
FORCE=0
OPT_HOST=""; OPT_PORT=""; OPT_DB=""; OPT_USER=""; OPT_PASSWORD=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --dry-run) DRY_RUN=1; shift ;;
        --sql) SQL_FILE="$2"; shift 2 ;;
        --prefix) PREFIX_OVERRIDE="$2"; PREFIX_GIVEN=1; shift 2 ;;
        --env) ENV_FILE="$2"; shift 2 ;;
        --force) FORCE=1; shift ;;
        --host) OPT_HOST="$2"; shift 2 ;;
        --port) OPT_PORT="$2"; shift 2 ;;
        --db) OPT_DB="$2"; shift 2 ;;
        --user) OPT_USER="$2"; shift 2 ;;
        --password) OPT_PASSWORD="$2"; shift 2 ;;
        *) echo "Unknown option: $1" >&2; exit 2 ;;
    esac
done

if [[ ! -f "$SQL_FILE" ]]; then
    echo "ERROR: seed file not found: $SQL_FILE" >&2
    exit 1
fi

# --- Locate .env -------------------------------------------------------------

find_env_file() {
    # 1) explicit --env
    if [[ -n "$ENV_FILE" ]]; then
        if [[ ! -f "$ENV_FILE" ]]; then
            echo "ERROR: --env file not found: $ENV_FILE" >&2
            exit 1
        fi
        printf '%s' "$ENV_FILE"
        return
    fi
    # 2) walk up from the script dir until a Laravel artisan file appears
    local dir="$SCRIPT_DIR"
    for _ in 1 2 3 4 5; do
        dir="$(dirname "$dir")"
        if [[ -f "$dir/artisan" && -f "$dir/.env" ]]; then
            printf '%s' "$dir/.env"
            return
        fi
    done
    # no .env found — allowed if connection flags were given explicitly
    if [[ -n "$OPT_DB" && -n "$OPT_USER" ]]; then
        printf ''
        return
    fi
    echo "ERROR: could not auto-detect the Laravel app root (.env with artisan)." >&2
    echo "       Either cd to the app root, pass --env /path/to/.env, or pass" >&2
    echo "       --db / --user / --password / --prefix explicitly." >&2
    exit 1
}

ENV_FILE="$(find_env_file)"

# --- Read values from .env (never printed) -----------------------------------

env_get() {
    local key="$1" val
    val="$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | tail -1 | cut -d= -f2- || true)"
    # trim surrounding quotes
    val="${val%\"}"; val="${val#\"}"
    val="${val%\'}"; val="${val#\'}"
    printf '%s' "$val"
}

if [[ $PREFIX_GIVEN -eq 1 ]]; then
    DB_PREFIX="$PREFIX_OVERRIDE"
else
    DB_PREFIX="$(env_get DB_PREFIX)"
fi

# G7 mysql connection reads DB_WRITE_* (see config/database.php). Fall back to
# the standard Laravel names for non-G7 setups. CLI flags win over both.
DB_HOST="$(env_get DB_WRITE_HOST)";     DB_HOST="${DB_HOST:-$(env_get DB_HOST)}"
DB_PORT="$(env_get DB_WRITE_PORT)";     DB_PORT="${DB_PORT:-$(env_get DB_PORT)}"
DB_USERNAME="$(env_get DB_WRITE_USERNAME)"; DB_USERNAME="${DB_USERNAME:-$(env_get DB_USERNAME)}"
DB_PASSWORD="$(env_get DB_WRITE_PASSWORD)"; DB_PASSWORD="${DB_PASSWORD:-$(env_get DB_PASSWORD)}"
DB_DATABASE="$(env_get DB_WRITE_DATABASE)"; DB_DATABASE="${DB_DATABASE:-$(env_get DB_DATABASE)}"

[[ -n "$OPT_HOST" ]]     && DB_HOST="$OPT_HOST"
[[ -n "$OPT_PORT" ]]     && DB_PORT="$OPT_PORT"
[[ -n "$OPT_USER" ]]     && DB_USERNAME="$OPT_USER"
[[ -n "$OPT_PASSWORD" ]] && DB_PASSWORD="$OPT_PASSWORD"
[[ -n "$OPT_DB" ]]       && DB_DATABASE="$OPT_DB"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"

if [[ -z "$DB_USERNAME" || -z "$DB_DATABASE" ]]; then
    echo "ERROR: DB user / name not resolved." >&2
    echo "       Pass --db <name> --user <user> [--password <pw>] (and --prefix <p>)," >&2
    echo "       or fix DB_WRITE_* in $ENV_FILE." >&2
    exit 1
fi

# Prefix default: G7 default prefix is g7_ (docs/requirements.md). Explicit
# --prefix '' still means "no prefix".
if [[ $PREFIX_GIVEN -eq 0 && "$DB_PREFIX" == "" ]]; then
    DB_PREFIX="g7_"
fi

# No password from flags or .env — prompt interactively (not on dry-run)
if [[ $DRY_RUN -eq 0 && -z "$DB_PASSWORD" ]]; then
    read -rs -p "DB password for ${DB_USERNAME}: " DB_PASSWORD; echo
fi

# --- Rewrite table names with the site prefix --------------------------------

# Known tables in demo-seed.sql. Order matters: board_posts before boards.
sed_expr="s/\`(ecommerce_[a-z_]+|board_posts|boards)\`/\`__PFX__\1\`/g"
rewritten="$(sed -E "$sed_expr" "$SQL_FILE" | sed -E "s/\`__PFX__/\\\`${DB_PREFIX}/g")"

if [[ "$DB_PREFIX" != "" ]]; then
    if ! grep -qE "\`${DB_PREFIX}ecommerce_products\`" <<<"$rewritten"; then
        echo "ERROR: prefix rewrite failed (no \`${DB_PREFIX}ecommerce_products\` in output)." >&2
        exit 1
    fi
fi

if [[ $DRY_RUN -eq 1 ]]; then
    printf '%s\n' "$rewritten"
    exit 0
fi

command -v mysql >/dev/null 2>&1 || { echo "ERROR: mysql client not found." >&2; exit 1; }

# --- Pre-check: target tables must exist (template must be installed) --------

if [[ $FORCE -eq 0 ]]; then
    probe_table="${DB_PREFIX}ecommerce_categories"
    probe_err="$(mktemp)"
    probe_rc=0
    probe_out="$(MYSQL_PWD="$DB_PASSWORD" mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" "$DB_DATABASE" -N -B \
        -e "SHOW TABLES LIKE '${probe_table}'" 2>"$probe_err")" || probe_rc=$?
    if [[ $probe_rc -ne 0 ]]; then
        probe_msg="$(tail -1 "$probe_err")"
        rm -f "$probe_err"
        echo "ERROR: cannot query database '${DB_DATABASE}' on ${DB_HOST}:${DB_PORT} as '${DB_USERNAME}'." >&2
        echo "       mysql said: ${probe_msg}" >&2
        echo "       Check DB_WRITE_HOST / DB_WRITE_DATABASE / DB_WRITE_USERNAME in $ENV_FILE —" >&2
        echo "       the DB name is NOT the table prefix. (e.g. local dev: DB '20feet', prefix 'g7_')" >&2
        exit 1
    fi
    rm -f "$probe_err"
    if [[ "$probe_out" != "$probe_table" ]]; then
        echo "ERROR: table '${probe_table}' does not exist in database '${DB_DATABASE}'." >&2
        echo "       Install the template first:  php artisan template:install superbify-commerce_minimal" >&2
        echo "       Or if the prefix looks wrong, check DB_PREFIX in $ENV_FILE (override with --prefix)." >&2
        exit 1
    fi
fi

# --- Import ------------------------------------------------------------------

printf '%s\n' "$rewritten" | MYSQL_PWD="$DB_PASSWORD" mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" "$DB_DATABASE"
status=$?

if [[ $status -eq 0 ]]; then
    echo "Imported $SQL_FILE (prefix: '${DB_PREFIX}') into ${DB_DATABASE}."
    echo "Next: copy product images, then clear caches:"
    echo "  cp -r $SCRIPT_DIR/images/products <storage_path>/modules/sirsoft-ecommerce/images/"
    echo "  php artisan template:cache-clear && php artisan cache:clear"
else
    echo "ERROR: mysql import failed (exit $status)." >&2
    exit $status
fi