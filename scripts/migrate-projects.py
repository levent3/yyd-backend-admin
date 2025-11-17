"""
MSSQL YeryuzuDoktorlari → PostgreSQL Migration Script
Python ile LocalDB bağlantısı ve PostgreSQL'e veri aktarımı
"""

import pyodbc
import psycopg2
import json
from datetime import datetime

# MSSQL (LocalDB) Bağlantı
MSSQL_CONNECTION_STRING = (
    'DRIVER={ODBC Driver 17 for SQL Server};'
    'SERVER=(localdb)\\MSSQLLocalDB;'
    'DATABASE=YeryuzuDoktorlari;'
    'Trusted_Connection=yes;'
)

# PostgreSQL Bağlantı
POSTGRES_CONNECTION = {
    'host': 'localhost',
    'port': 5433,
    'database': 'yyd_db',
    'user': 'myadmin',
    'password': 'mysecretpassword'
}

# Dil Mapping
LANGUAGE_MAP = {
    'BF2689D9-071E-4A20-9450-B1DBDD39778F': 'tr',
    '7C35F456-9403-4C21-80B6-941129D14086': 'en',
    '8FAB2BF3-F2E1-4D54-B668-8DD588575FE4': 'ar',
}

def migrate_projects():
    """Projeleri MSSQL'den PostgreSQL'e migrate et"""

    mssql_conn = None
    pg_conn = None

    try:
        print("🔌 MSSQL (LocalDB) bağlantısı kuruluyor...")
        mssql_conn = pyodbc.connect(MSSQL_CONNECTION_STRING)
        mssql_cursor = mssql_conn.cursor()
        print("✅ MSSQL bağlantısı başarılı!")

        print("\n🔌 PostgreSQL bağlantısı kuruluyor...")
        pg_conn = psycopg2.connect(**POSTGRES_CONNECTION)
        pg_cursor = pg_conn.cursor()
        print("✅ PostgreSQL bağlantısı başarılı!")

        # 1. MSSQL'den projeleri çek
        print("\n📊 MSSQL'den projeler çekiliyor...")
        mssql_cursor.execute("""
            SELECT
                Id,
                ContentId,
                SiteLanguageId,
                Title,
                Slug,
                ThumbnailImage,
                Image,
                Summary,
                Content,
                Budget,
                TotalBudget,
                StartDate,
                EndDate,
                OrderNo,
                IsShowedHomePage,
                CreateDate,
                UpdateDate
            FROM YeryuzuDoktorlari_Project
            ORDER BY ContentId, SiteLanguageId
        """)

        projects = mssql_cursor.fetchall()
        print(f"✅ {len(projects)} proje satırı bulundu")

        # 2. ContentId bazında grupla
        projects_by_content_id = {}
        for row in projects:
            content_id = str(row.ContentId)
            if content_id not in projects_by_content_id:
                projects_by_content_id[content_id] = []
            projects_by_content_id[content_id].append(row)

        print(f"\n📦 {len(projects_by_content_id)} unique proje bulundu")

        # 3. Her ContentId için migrate et
        migrated_count = 0
        skipped_count = 0

        for content_id, project_rows in projects_by_content_id.items():
            try:
                main_row = project_rows[0]

                print(f"\n📝 Migrate ediliyor: {main_row.Title} ({len(project_rows)} dil)")

                # a) Project tablosuna ekle
                pg_cursor.execute("""
                    INSERT INTO "Project" (
                        "imageUrl", "coverImage", "budget", "targetAmount",
                        "startDate", "endDate", "displayOrder", "isFeatured",
                        "status", "isActive", "createdAt", "updatedAt"
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    ) RETURNING id
                """, (
                    main_row.ThumbnailImage or main_row.Image,
                    main_row.Image,
                    main_row.Budget or main_row.TotalBudget or 0,
                    main_row.Budget or main_row.TotalBudget or 0,
                    main_row.StartDate,
                    main_row.EndDate,
                    main_row.OrderNo or 0,
                    bool(main_row.IsShowedHomePage),
                    'active',
                    True,
                    main_row.CreateDate,
                    main_row.UpdateDate
                ))

                project_id = pg_cursor.fetchone()[0]
                print(f"   ✅ Project oluşturuldu: ID={project_id}")

                # b) Her dil için ProjectTranslation ekle
                for row in project_rows:
                    language = LANGUAGE_MAP.get(str(row.SiteLanguageId))

                    if not language:
                        print(f"   ⚠️  Bilinmeyen dil: {row.SiteLanguageId}, atlanıyor")
                        continue

                    pg_cursor.execute("""
                        INSERT INTO "ProjectTranslation" (
                            "projectId", "language", "title", "slug",
                            "description", "content", "createdAt", "updatedAt"
                        ) VALUES (
                            %s, %s, %s, %s, %s, %s, %s, %s
                        )
                    """, (
                        project_id,
                        language,
                        row.Title,
                        row.Slug or f'project-{project_id}-{language}',
                        row.Summary or '',
                        row.Content or '',
                        row.CreateDate,
                        row.UpdateDate
                    ))

                    print(f"   ✅ Translation eklendi: {language} - {row.Title}")

                pg_conn.commit()
                migrated_count += 1

            except Exception as e:
                print(f"   ❌ Hata: {e}")
                pg_conn.rollback()
                skipped_count += 1

        print(f"\n✅ Migration tamamlandı!")
        print(f"   📊 Başarılı: {migrated_count}")
        print(f"   ⚠️  Atlanan: {skipped_count}")

    except Exception as e:
        print(f"❌ Migration hatası: {e}")
        raise

    finally:
        if mssql_conn:
            mssql_conn.close()
            print("\n🔌 MSSQL bağlantısı kapatıldı")
        if pg_conn:
            pg_conn.close()
            print("🔌 PostgreSQL bağlantısı kapatıldı")

if __name__ == '__main__':
    migrate_projects()
    print("\n🎉 İşlem tamamlandı!")
