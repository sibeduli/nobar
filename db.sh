#!/bin/bash

# Database management script for TVRI Nobar app
# Usage: ./db.sh [backup|restore|clean|list|stats|export]

DB_NAME="nobar"
DB_USER="abdul"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="./backups"

# Connection string for pg commands
export PGPASSWORD='gohitek123'
PG_CONN="-U $DB_USER -h $DB_HOST -p $DB_PORT"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

backup() {
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"
    
    echo -e "${YELLOW}Creating backup...${NC}"
    pg_dump $PG_CONN "$DB_NAME" > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Backup created: $BACKUP_FILE${NC}"
        ls -lh "$BACKUP_FILE"
    else
        echo -e "${RED}Backup failed!${NC}"
        exit 1
    fi
}

restore() {
    if [ -z "$1" ]; then
        echo -e "${YELLOW}Available backups:${NC}"
        ls -lt "$BACKUP_DIR"/*.sql 2>/dev/null || echo "No backups found"
        echo ""
        read -p "Enter backup filename to restore: " BACKUP_FILE
    else
        BACKUP_FILE="$1"
    fi
    
    # Add backup dir prefix only if it's just a filename (no path)
    if [[ ! "$BACKUP_FILE" == */* ]]; then
        BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}Backup file not found: $BACKUP_FILE${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}WARNING: This will overwrite the current database!${NC}"
    read -p "Are you sure you want to restore from $BACKUP_FILE? (y/n): " confirm
    
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        echo -e "${YELLOW}Dropping existing tables...${NC}"
        psql $PG_CONN "$DB_NAME" -c 'DROP TABLE IF EXISTS "Merchant" CASCADE; DROP TABLE IF EXISTS "User" CASCADE; DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;' 2>/dev/null
        
        echo -e "${YELLOW}Restoring database...${NC}"
        psql $PG_CONN "$DB_NAME" < "$BACKUP_FILE"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Database restored successfully!${NC}"
        else
            echo -e "${RED}Restore failed!${NC}"
            exit 1
        fi
    else
        echo "Restore cancelled."
    fi
}

clean() {
    local target="${1:-default}"
    
    case "$target" in
        merchant)
            echo -e "${RED}WARNING: This will DELETE ALL MERCHANTS and related data (licenses)!${NC}"
            read -p "Are you sure? (y/n): " confirm
            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                echo -e "${YELLOW}Cleaning merchants...${NC}"
                psql $PG_CONN "$DB_NAME" -c 'TRUNCATE TABLE "Merchant" RESTART IDENTITY CASCADE;'
                if [ $? -eq 0 ]; then
                    echo -e "${GREEN}Merchants cleaned successfully!${NC}"
                else
                    echo -e "${RED}Clean failed!${NC}"
                    exit 1
                fi
            else
                echo "Clean cancelled."
            fi
            ;;
        profile)
            echo -e "${RED}WARNING: This will DELETE ALL USER PROFILES and activity logs!${NC}"
            read -p "Are you sure? (y/n): " confirm
            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                read -p "Type 'DELETE PROFILES' to confirm: " confirm2
                if [ "$confirm2" = "DELETE PROFILES" ]; then
                    echo -e "${YELLOW}Cleaning user profiles...${NC}"
                    psql $PG_CONN "$DB_NAME" -c 'TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;'
                    if [ $? -eq 0 ]; then
                        echo -e "${GREEN}User profiles cleaned successfully!${NC}"
                    else
                        echo -e "${RED}Clean failed!${NC}"
                        exit 1
                    fi
                else
                    echo "Clean cancelled."
                fi
            else
                echo "Clean cancelled."
            fi
            ;;
        pengaduan)
            echo -e "${RED}WARNING: This will DELETE ALL TICKETS and their messages!${NC}"
            read -p "Are you sure? (y/n): " confirm
            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                echo -e "${YELLOW}Cleaning tickets...${NC}"
                psql $PG_CONN "$DB_NAME" -c 'TRUNCATE TABLE "Ticket" RESTART IDENTITY CASCADE;'
                if [ $? -eq 0 ]; then
                    echo -e "${GREEN}Tickets cleaned successfully!${NC}"
                else
                    echo -e "${RED}Clean failed!${NC}"
                    exit 1
                fi
            else
                echo "Clean cancelled."
            fi
            ;;
        all)
            echo -e "${RED}WARNING: This will DELETE ALL DATA including profiles!${NC}"
            echo "This includes: merchants, licenses, tickets, users, activity logs"
            read -p "Are you sure? (y/n): " confirm
            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                read -p "Type 'DELETE ALL' to confirm: " confirm2
                if [ "$confirm2" = "DELETE ALL" ]; then
                    echo -e "${YELLOW}Cleaning all data...${NC}"
                    psql $PG_CONN "$DB_NAME" -c '
                        TRUNCATE TABLE "License" RESTART IDENTITY CASCADE;
                        TRUNCATE TABLE "Merchant" RESTART IDENTITY CASCADE;
                        TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;
                        TRUNCATE TABLE "TicketMessage" RESTART IDENTITY CASCADE;
                        TRUNCATE TABLE "Ticket" RESTART IDENTITY CASCADE;
                        TRUNCATE TABLE "ActivityLog" RESTART IDENTITY CASCADE;
                    '
                    if [ $? -eq 0 ]; then
                        echo -e "${GREEN}All data cleaned successfully!${NC}"
                    else
                        echo -e "${RED}Clean failed!${NC}"
                        exit 1
                    fi
                else
                    echo "Clean cancelled."
                fi
            else
                echo "Clean cancelled."
            fi
            ;;
        *)
            echo -e "${RED}WARNING: This will DELETE ALL DATA except user profiles!${NC}"
            echo "This includes: merchants, licenses, tickets (with messages), activity logs"
            read -p "Are you sure? (y/n): " confirm
            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                read -p "Type 'DELETE' to confirm: " confirm2
                if [ "$confirm2" = "DELETE" ]; then
                    echo -e "${YELLOW}Cleaning data (keeping profiles)...${NC}"
                    psql $PG_CONN "$DB_NAME" -c '
                        TRUNCATE TABLE "License" RESTART IDENTITY CASCADE;
                        TRUNCATE TABLE "Merchant" RESTART IDENTITY CASCADE;
                        TRUNCATE TABLE "TicketMessage" RESTART IDENTITY CASCADE;
                        TRUNCATE TABLE "Ticket" RESTART IDENTITY CASCADE;
                        TRUNCATE TABLE "ActivityLog" RESTART IDENTITY CASCADE;
                    '
                    if [ $? -eq 0 ]; then
                        echo -e "${GREEN}Data cleaned successfully! User profiles preserved.${NC}"
                    else
                        echo -e "${RED}Clean failed!${NC}"
                        exit 1
                    fi
                else
                    echo "Clean cancelled."
                fi
            else
                echo "Clean cancelled."
            fi
            ;;
    esac
}

list() {
    echo -e "${YELLOW}Available backups:${NC}"
    echo "----------------------------------------"
    ls -lth "$BACKUP_DIR"/*.sql 2>/dev/null || echo "No backups found"
    echo "----------------------------------------"
    
    # Show count
    COUNT=$(ls -1 "$BACKUP_DIR"/*.sql 2>/dev/null | wc -l)
    echo -e "Total: ${GREEN}$COUNT${NC} backup(s)"
}

stats() {
    echo -e "${YELLOW}Database Statistics${NC}"
    echo "========================================"
    
    psql $PG_CONN "$DB_NAME" -t -c "
    SELECT 
        'Total Merchants' as metric, COUNT(*) as value FROM \"Merchant\"
    UNION ALL
    SELECT 'Pending', COUNT(*) FROM \"Merchant\" WHERE status = 'pending'
    UNION ALL
    SELECT 'Active', COUNT(*) FROM \"Merchant\" WHERE status = 'active'
    UNION ALL
    SELECT 'Rejected', COUNT(*) FROM \"Merchant\" WHERE status = 'rejected'
    " | while read line; do
        if [ -n "$line" ]; then
            metric=$(echo "$line" | cut -d'|' -f1 | xargs)
            value=$(echo "$line" | cut -d'|' -f2 | xargs)
            printf "%-20s: ${GREEN}%s${NC}\n" "$metric" "$value"
        fi
    done
    
    echo "========================================"
}

export_csv() {
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    EXPORT_DIR="$BACKUP_DIR/export_${TIMESTAMP}"
    mkdir -p "$EXPORT_DIR"
    
    echo -e "${YELLOW}Exporting current database to CSV...${NC}"
    echo -e "Source: ${GREEN}$DB_NAME${NC} @ $DB_HOST:$DB_PORT"
    
    # Export merchants
    psql $PG_CONN "$DB_NAME" -c "\COPY (SELECT id, \"businessName\", \"ownerName\", email, phone, \"venueType\", capacity, provinsi, kabupaten, kecamatan, kelurahan, \"alamatLengkap\", \"kodePos\", latitude, longitude, status, \"createdAt\" FROM \"Merchant\" ORDER BY \"createdAt\" DESC) TO '$EXPORT_DIR/merchants.csv' WITH CSV HEADER"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Export completed!${NC}"
        echo "Files created in: $EXPORT_DIR"
        ls -lh "$EXPORT_DIR"
    else
        echo -e "${RED}Export failed!${NC}"
        exit 1
    fi
}

usage() {
    echo "Database Management Script"
    echo ""
    echo "Usage: ./db.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  backup              Create a new database backup (.sql)"
    echo "  restore [file]      Restore database from a backup file"
    echo "  clean [target]      Delete data from database (with confirmation)"
    echo "  list                List all available backups"
    echo "  export              Export data to CSV files (Excel compatible)"
    echo "  stats               Show database statistics"
    echo ""
    echo "Clean targets:"
    echo "  clean               Delete all except user profiles (default)"
    echo "  clean merchant      Delete merchants and licenses only"
    echo "  clean profile       Delete user profiles only"
    echo "  clean pengaduan     Delete tickets (pengaduan) only"
    echo "  clean all           Delete everything including profiles"
    echo ""
    echo "Examples:"
    echo "  ./db.sh backup"
    echo "  ./db.sh restore nobar_20260123_120000.sql"
    echo "  ./db.sh clean"
    echo "  ./db.sh clean merchant"
    echo "  ./db.sh clean all"
    echo "  ./db.sh list"
}

# Main
case "$1" in
    backup)
        backup
        ;;
    restore)
        restore "$2"
        ;;
    clean)
        clean "$2"
        ;;
    list)
        list
        ;;
    export)
        export_csv
        ;;
    stats)
        stats
        ;;
    *)
        usage
        ;;
esac
