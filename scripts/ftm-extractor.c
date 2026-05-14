/*
 * ftm-extractor.c
 *
 * Reads the encrypted FTM SQLite database using FTMDatabaseFoundation's
 * built-in SQLite+SEE engine and writes all genealogy data as a JSON
 * document to stdout.
 *
 * Compile (ARM64 macOS):
 *   clang -arch arm64 -o scripts/ftm-extractor scripts/ftm-extractor.c
 *
 * Run:
 *   DYLD_FRAMEWORK_PATH="/Applications/Family Tree Maker 2024.app/Contents/Frameworks" \
 *     scripts/ftm-extractor /path/to/file.ftm > /tmp/ftm_data.json
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dlfcn.h>

/* ------------------------------------------------------------------ */
/* SQLite function pointer types (subset we need)                      */
/* ------------------------------------------------------------------ */
typedef struct sqlite3_s sqlite3;
typedef struct sqlite3_stmt_s sqlite3_stmt;

typedef int  (*fn_open_v2)(const char*, sqlite3**, int, const char*);
typedef int  (*fn_key)(sqlite3*, const void*, int);
typedef int  (*fn_exec)(sqlite3*, const char*, int(*)(void*,int,char**,char**), void*, char**);
typedef void (*fn_activate_see)(const char*);
typedef const char* (*fn_errmsg)(sqlite3*);
typedef int  (*fn_close)(sqlite3*);

static sqlite3*       g_db  = NULL;
static fn_exec        g_exec = NULL;
static fn_errmsg      g_em   = NULL;
static FILE*          g_out  = NULL;

/* ------------------------------------------------------------------ */
/* JSON helpers                                                        */
/* ------------------------------------------------------------------ */

static void js_str(const char* s) {
    if (!s) { fputs("null", g_out); return; }
    fputc('"', g_out);
    for (const unsigned char* p = (const unsigned char*)s; *p; p++) {
        if      (*p == '"')  fputs("\\\"", g_out);
        else if (*p == '\\') fputs("\\\\", g_out);
        else if (*p == '\n') fputs("\\n",  g_out);
        else if (*p == '\r') fputs("\\r",  g_out);
        else if (*p == '\t') fputs("\\t",  g_out);
        else if (*p < 0x20)  fprintf(g_out, "\\u%04x", (unsigned int)*p);
        else                 fputc(*p, g_out);
    }
    fputc('"', g_out);
}

/* Write a JSON key (quoted) */
static void js_key(const char* k) {
    fputc('"', g_out);
    fputs(k, g_out);
    fputs("\":", g_out);
}

/* Write val as JSON number if it parses as one, else as JSON string or null */
static void js_val(const char* v) {
    if (!v) { fputs("null", g_out); return; }
    /* Try numeric: starts with optional '-' then digits, optional '.' digits */
    const char* p = v;
    if (*p == '-') p++;
    int is_num = (*p >= '0' && *p <= '9');
    if (is_num) {
        while (*p >= '0' && *p <= '9') p++;
        if (*p == '.') { p++; while (*p >= '0' && *p <= '9') p++; }
        if (*p == ':') is_num = 0;  /* date range "int:int" → string */
        else if (*p != '\0') is_num = 0;
    }
    if (is_num && v[0] != '\0') fputs(v, g_out);
    else js_str(v);
}

/* ------------------------------------------------------------------ */
/* Generic table dumper                                                */
/* Callback receives column names on first call, then data rows.      */
/* ------------------------------------------------------------------ */

typedef struct {
    int          row;           /* rows written so far */
    const char** col_names;     /* column names (set on first row) */
    int          ncols_seen;
} DumpCtx;

static int dump_cb(void* ctx_ptr, int ncols, char** vals, char** cols) {
    DumpCtx* ctx = (DumpCtx*)ctx_ptr;
    if (ctx->row > 0) fputs(",\n", g_out);
    fputs("    {", g_out);
    for (int i = 0; i < ncols; i++) {
        if (i > 0) fputc(',', g_out);
        js_key(cols[i]);
        js_val(vals[i]);
    }
    fputc('}', g_out);
    ctx->row++;
    return 0;
}

static void dump_table(const char* section_name, const char* sql) {
    fprintf(g_out, "  \"%s\": [\n", section_name);
    DumpCtx ctx = {0, NULL, 0};
    char* err = NULL;
    int rc = g_exec(g_db, sql, dump_cb, &ctx, &err);
    if (rc != 0) {
        fprintf(stderr, "Query error [%s]: rc=%d %s\n", section_name, rc, err ? err : g_em(g_db));
    }
    fputs("\n  ]", g_out);
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

int main(int argc, char* argv[]) {
    const char* ftm_path = (argc > 1) ? argv[1]
        : "/Users/dave/ftm playground /Mom plus 1 generation.ftm";

    const char* lib_path =
        "/Applications/Family Tree Maker 2024.app/Contents/Frameworks"
        "/FTMDatabaseFoundation.framework/FTMDatabaseFoundation";

    void* lib = dlopen(lib_path, RTLD_LAZY | RTLD_LOCAL);
    if (!lib) { fprintf(stderr, "dlopen: %s\n", dlerror()); return 1; }

    fn_activate_see see = (fn_activate_see)dlsym(lib, "sqlite3_activate_see");
    fn_open_v2      o   = (fn_open_v2)     dlsym(lib, "sqlite3_open_v2");
    fn_key          k   = (fn_key)         dlsym(lib, "sqlite3_key");
    fn_close        cl  = (fn_close)       dlsym(lib, "sqlite3_close");
    g_exec              = (fn_exec)        dlsym(lib, "sqlite3_exec");
    g_em                = (fn_errmsg)      dlsym(lib, "sqlite3_errmsg");

    if (!see || !o || !k || !cl || !g_exec || !g_em) {
        fprintf(stderr, "dlsym: %s\n", dlerror()); return 1;
    }

    see("7bb07b8d471d642e");
    int rc = o(ftm_path, &g_db, 1 /* READONLY */, NULL);
    if (rc) { fprintf(stderr, "open failed rc=%d\n", rc); return 1; }

    rc = k(g_db, "aes256:ViDfwQnOAX8IGG5T5xs3yyBOryIqfPu6", 39);
    if (rc) { fprintf(stderr, "key failed rc=%d\n", rc); return 1; }

    /* Verify we can read */
    char* verr = NULL;
    rc = g_exec(g_db, "SELECT count(*) FROM sqlite_master;", NULL, NULL, &verr);
    if (rc) { fprintf(stderr, "verify failed: %s\n", verr ? verr : g_em(g_db)); return 1; }

    g_out = stdout;
    fputs("{\n", g_out);

    /* ---- persons ---- */
    /* Note: FTM 2024 schema 20200615 has no IsLiving column; living flag is computed at runtime */
    dump_table("persons",
        "SELECT ID, GivenName, FamilyName, FullName, Title, NameSuffix, Sex, Private, "
        "BirthDate, BirthPlace, DeathDate, DeathPlace, "
        "BirthDateSort1, DeathDateSort1 "
        "FROM Person ORDER BY ID;");

    fputs(",\n", g_out);

    /* ---- relationships (family units / couples) ---- */
    dump_table("relationships",
        "SELECT ID, Person1ID, Person2ID, RelType, Status, Private "
        "FROM Relationship ORDER BY ID;");

    fputs(",\n", g_out);

    /* ---- child_relationships ---- */
    dump_table("childRelationships",
        "SELECT ID, PersonID, RelationshipID, Nature1, Nature2, ChildOrder "
        "FROM ChildRelationship ORDER BY RelationshipID, ChildOrder, ID;");

    fputs(",\n", g_out);

    /* ---- facts (individual + family events) ---- */
    dump_table("facts",
        "SELECT f.ID, f.LinkID, f.LinkTableID, f.FactTypeID, "
        "ft.Name as factTypeName, ft.Tag as factTypeTag, ft.FactClass as factTypeClass, "
        "f.Date, f.DateSort1, f.DateSort2, f.DateModifier1, f.DateModifier2, "
        "f.PlaceID, p.Name as placeName, f.Text, f.Preferred, f.Private "
        "FROM Fact f "
        "JOIN FactType ft ON f.FactTypeID = ft.ID "
        "LEFT JOIN Place p ON f.PlaceID = p.ID "
        "ORDER BY f.LinkTableID, f.LinkID, f.DateSort1;");

    fputs(",\n", g_out);

    /* ---- master_sources ---- */
    dump_table("masterSources",
        "SELECT ID, Title, Author, PublisherName, PublisherLocation, "
        "PublishDate, RepositoryID, Comments "
        "FROM MasterSource ORDER BY ID;");

    fputs(",\n", g_out);

    /* ---- source_citations (Source table = citation instances) ---- */
    dump_table("sourceCitations",
        "SELECT ID, MasterSourceID, PageNumber, Comment, Footnote "
        "FROM Source ORDER BY ID;");

    fputs(",\n", g_out);

    /* ---- source_links (Fact → Source citation bridge) ---- */
    dump_table("sourceLinks",
        "SELECT ID, LinkID, LinkTableID, SourceID "
        "FROM SourceLink ORDER BY LinkID;");

    fputs(",\n", g_out);

    /* ---- repositories ---- */
    dump_table("repositories",
        "SELECT ID, Name, Address, Phone, Email "
        "FROM Repository ORDER BY ID;");

    fputs(",\n", g_out);

    /* ---- notes ---- */
    dump_table("notes",
        "SELECT ID, LinkID, LinkTableID, NoteText "
        "FROM Note ORDER BY LinkID;");

    fputs("\n}\n", g_out);
    fflush(g_out);

    cl(g_db);
    return 0;
}
