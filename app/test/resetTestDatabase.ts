import { execSync } from 'child_process';

export const resetTestDatabase = async () => {
  execSync('npx prisma migrate reset --force', {
    env: {
      ...process.env,
    },
  });
};
