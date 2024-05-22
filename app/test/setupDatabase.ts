import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { execSync } from 'child_process';

/**
 * JEST_WORKDER_ID毎にDatabaseを作成し、データのリセット処理を行う。
 */
export async function setupDatabase() {
  // 作成するDB名
  const newDbName = `worker_${process.env.JEST_WORKER_ID}`;

  // DBの作成
  const prisma = new PrismaClient();
  await prisma.$connect();
  try {
    await prisma.$executeRaw`CREATE DATABASE ${newDbName}`;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      // DB作成済みだった場合は無視
      // 本来はここでエラーコードをチェックした方が良い。今回は割愛
    } else {
      throw error;
    }
  }
  await prisma.$disconnect();

  // 環境変数上書き
  // CI環境の時はDB_HOSTをlocalhostに変更
  if (process.env?.IS_CI) {
    process.env.DATABASE_URL =
      'mysql://root:root@127.0.0.1:3306/nestjs_prisma_sample_test';
  }
  const dbUrl = new URL(process.env.DATABASE_URL ?? '');
  const baseUrl = dbUrl.href.substring(0, dbUrl.href.lastIndexOf('/'));
  process.env.DATABASE_URL = `${baseUrl}/${newDbName}`;

  // DB初期化処理
  execSync('npx prisma migrate reset --force --skip-seed', {
    env: {
      ...process.env,
    },
  });
  execSync('npx prisma db push', {
    env: {
      ...process.env,
    },
  });
}
