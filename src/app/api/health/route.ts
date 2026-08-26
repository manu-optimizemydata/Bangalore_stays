export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    ok: true,
    hasDatabaseUrl: Boolean(
      process.env.DATABASE_URL ||
        process.env.POSTGRES_PRISMA_URL ||
        process.env.POSTGRES_URL,
    ),
    hasDirectUrl: Boolean(
      process.env.DIRECT_URL || process.env.POSTGRES_URL_NON_POOLING,
    ),
    hasOwnerSecret: Boolean(process.env.OWNER_SESSION_SECRET),
    hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD),
  });
}
