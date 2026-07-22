import 'dotenv/config';
import { db } from '../db';
import { user } from '../db/schema';

const CONFIRM_FLAG = '--confirm';

async function main() {
  if (!process.argv.includes(CONFIRM_FLAG)) {
    console.error(
      `This command permanently deletes every user. Re-run with ${CONFIRM_FLAG} to continue.`,
    );
    process.exitCode = 1;
    return;
  }

  const deletedUsers = await db
    .delete(user)
    .returning({ userId: user.userId });

  console.log(`Deleted ${deletedUsers.length} database user(s).`);
}

main().catch((error) => {
  console.error('Failed to clear users:', error);
  process.exitCode = 1;
});
