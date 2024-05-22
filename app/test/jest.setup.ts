import { setupDatabase } from './setupDatabase';

beforeAll(async () => {
  await setupDatabase();
});
