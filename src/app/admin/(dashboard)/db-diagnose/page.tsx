import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DbDiagnosePage() {
  let connectionSuccess = false;
  let connectionError: string | null = null;
  let tables: string[] = [];
  let journalPostCheck: string = "Not Checked";
  let prismaSchemaInfo: { modelNames?: string[] } = {};

  try {
    // 1. Test basic raw connection
    await prisma.$queryRaw`SELECT 1`;
    connectionSuccess = true;

    // 2. Fetch all public tables
    const tableRows = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name ASC
    `;
    tables = tableRows.map((row) => row.table_name);

    // 3. Test JournalPost model query
    try {
      const count = await prisma.journalPost.count();
      journalPostCheck = `Success: found ${count} posts`;
    } catch (err) {
      journalPostCheck = `Failed: ${err instanceof Error ? err.message : String(err)}`;
    }

    // 4. Gather some metadata info
    prismaSchemaInfo = {
      modelNames: Object.keys(prisma).filter((key) => !key.startsWith("$") && !key.startsWith("_")),
    };
  } catch (err) {
    connectionError = err instanceof Error ? err.stack || err.message : String(err);
  }

  return (
    <div className="space-y-6 max-w-4xl p-6 bg-white border border-border rounded-sm shadow-xs">
      <div className="border-b border-border pb-4">
        <h1 className="font-heading text-2xl font-medium text-wood-dark">Database Diagnostics</h1>
        <p className="text-text-secondary text-sm">Use this page to check the Prisma schema and VPS database state.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Status */}
        <div className="p-4 rounded-sm border border-border bg-stone-50 space-y-2">
          <h2 className="font-heading text-lg font-medium text-wood-dark">Connection Status</h2>
          {connectionSuccess ? (
            <div className="text-green-700 font-semibold text-sm">✓ Connected successfully to the database</div>
          ) : (
            <div className="space-y-2">
              <div className="text-red-700 font-semibold text-sm">✗ Connection Failed</div>
              <pre className="p-2.5 bg-red-50 text-red-800 text-[10px] overflow-auto rounded-sm max-h-40 border border-red-200">
                {connectionError}
              </pre>
            </div>
          )}
        </div>

        {/* JournalPost Model Test */}
        <div className="p-4 rounded-sm border border-border bg-stone-50 space-y-2">
          <h2 className="font-heading text-lg font-medium text-wood-dark">JournalPost Query Test</h2>
          <div className="text-sm">
            <span className="font-semibold">Result: </span>
            <span className={journalPostCheck.startsWith("Success") ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
              {journalPostCheck}
            </span>
          </div>
        </div>
      </div>

      {/* Public Tables List */}
      <div className="p-4 rounded-sm border border-border bg-stone-50 space-y-3">
        <h2 className="font-heading text-lg font-medium text-wood-dark">Tables in Database ({tables.length})</h2>
        {tables.length === 0 ? (
          <p className="text-xs text-text-secondary italic">No tables found. Migrations may not have run.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tables.map((tbl) => (
              <span 
                key={tbl} 
                className={`px-2.5 py-1 text-xs font-mono border rounded-sm ${
                  tbl.toLowerCase() === "journalpost" 
                    ? "bg-wood-medium text-white border-wood-dark font-bold" 
                    : "bg-white text-text-primary border-border"
                }`}
              >
                {tbl}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Prisma Client Model names */}
      <div className="p-4 rounded-sm border border-border bg-stone-50 space-y-2">
        <h2 className="font-heading text-lg font-medium text-wood-dark">Prisma Client Models ({prismaSchemaInfo.modelNames?.length || 0})</h2>
        <div className="flex flex-wrap gap-2">
          {prismaSchemaInfo.modelNames?.map((model: string) => (
            <span key={model} className="px-2 py-0.5 text-[10px] font-mono bg-stone-100 border border-stone-200 rounded-sm text-text-secondary">
              {model}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
