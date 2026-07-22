import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { user, userRole } from '../db/schema';
import { hashPassword } from '../src/common/security/password.util';

function getArgument(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function main() {
  const email = getArgument('email')?.trim().toLowerCase();
  const password = getArgument('password');
  const fullName = getArgument('name')?.trim() || 'Administrator';

  if (!email || !password) {
    console.error(
      'Usage: pnpm run users:create-admin -- --email <email> --password <password> [--name <full-name>]',
    );
    process.exitCode = 1;
    return;
  }

  if (password.length < 12) {
    throw new Error('Admin password must contain at least 12 characters');
  }

  const passwordHash = await hashPassword(password);
  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  const databaseUser = existingUser
    ? (
        await db
          .update(user)
          .set({
            fullName,
            passwordHash,
            emailVerified: true,
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(user.userId, existingUser.userId))
          .returning()
      )[0]
    : (
        await db
          .insert(user)
          .values({
            email,
            passwordHash,
            fullName,
            emailVerified: true,
            isActive: true,
          })
          .returning()
      )[0];

  await db.delete(userRole).where(eq(userRole.userId, databaseUser.userId));
  await db.insert(userRole).values({
    userId: databaseUser.userId,
    role: 'admin',
  });

  console.log(
    `Admin user is ready: ${databaseUser.email} (${databaseUser.userId})`,
  );
}

main().catch((error) => {
  console.error('Failed to create admin user:', error);
  process.exitCode = 1;
});
