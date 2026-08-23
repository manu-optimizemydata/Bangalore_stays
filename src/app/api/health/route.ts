export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    ok: true,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasDirectUrl: Boolean(process.env.DIRECT_URL),
    hasOwnerSecret: Boolean(process.env.OWNER_SESSION_SECRET),
  });
}
