import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { SubTodo, Todo } from '@prisma/client';
import { resetTestDatabase } from './resetTestDatabase';

describe('TodosController (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let prisma: PrismaService;

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
      providers: [PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  // テストで起動したNestアプリを終了しないとJestで警告が発生するため、以下のコードで終了
  afterEach(async () => {
    await resetTestDatabase();
    await app.close();
    await moduleFixture.close();
  });

  describe('Query findAll()', () => {
    beforeEach(async () => {
      await prisma.todo.create({
        data: {
          title: 'test title1',
          content: 'test content1',
          subTodos: {
            create: [
              {
                title: 'test sub title1',
                content: 'test sub content1',
              },
              {
                title: 'test sub title2',
                content: 'test sub content2',
              },
            ],
          },
        },
      });
      await prisma.todo.create({
        data: {
          title: 'test title2',
          content: 'test content2',
        },
      });
    });

    it('指定したfieldが取得できること', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/todos')
        .expect(200);
      expect(body.length).toEqual(2);
      expect(body[0].title).toEqual('test title1');
      expect(body[0].content).toEqual('test content1');
      expect(body[1].title).toEqual('test title2');
      expect(body[1].content).toEqual('test content2');
      // NOTE: アソシエーション先の取得ができていることの確認
      expect(body[0].subTodos.length).toEqual(2);
      expect(
        !!body[0].subTodos.find(
          (subTodo: SubTodo) => subTodo.title === 'test sub title1',
        ),
      ).toEqual(true);
      expect(body[1].subTodos.length).toEqual(0);
    });
  });

  describe('Query findOne()', () => {
    let todoHavingSubTodo: Todo;
    let todoNotHavingSubTodo: Todo;

    beforeEach(async () => {
      todoHavingSubTodo = await prisma.todo.create({
        data: {
          title: 'test title1',
          content: 'test content1',
          subTodos: {
            create: [
              {
                title: 'test sub title1',
                content: 'test sub content1',
              },
              {
                title: 'test sub title2',
                content: 'test sub content2',
              },
            ],
          },
        },
      });
      todoNotHavingSubTodo = await prisma.todo.create({
        data: { title: 'test title2', content: 'test content2' },
      });
    });

    it('指定したTODOが取得できること(アソシエーション先含む)', async () => {
      const { body } = await request(app.getHttpServer())
        .get(`/todos/${todoHavingSubTodo.id}`)
        .expect(200);
      expect(body.title).toEqual('test title1');
      expect(body.content).toEqual('test content1');
      // NOTE: アソシエーション先の取得ができていることの確認
      expect(body.subTodos.length).toEqual(2);
      expect(
        !!body.subTodos.find(
          (subTodo: SubTodo) => subTodo.title === 'test sub title1',
        ),
      ).toEqual(true);
    });

    it('指定したfieldが取得できること(アソシエーション先なし)', async () => {
      const { body } = await request(app.getHttpServer())
        .get(`/todos/${todoNotHavingSubTodo.id}`)
        .expect(200);
      expect(body.title).toEqual('test title2');
      expect(body.content).toEqual('test content2');
      // NOTE: アソシエーション先は0件であることの確認
      expect(body.subTodos.length).toEqual(0);
    });
  });

  describe('Mutation createTodo()', () => {
    it('todoが作成できること', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/todos')
        .send({
          title: 'test title1',
          content: 'test content1',
        })
        .expect(201);
      expect(body.title).toEqual('test title1');
      expect(body.content).toEqual('test content1');

      const createdTodo = await prisma.todo.findFirst({
        where: { title: 'test title1' },
      });
      expect(!!createdTodo).toBeTruthy();
    });
  });

  describe('Mutation updateTodo()', () => {
    let todo: Todo;

    beforeEach(async () => {
      todo = await prisma.todo.create({
        data: {
          title: 'test title1',
          content: 'test content1',
        },
      });
    });

    it('todoが更新できること', async () => {
      const { body } = await request(app.getHttpServer())
        .patch(`/todos/${todo.id}`)
        .send({
          title: 'test updated title1',
          content: 'test updated content1',
        })
        .expect(200);
      expect(body.title).toEqual('test updated title1');
      expect(body.content).toEqual('test updated content1');

      const updatedTodo = await prisma.todo.findFirst({
        where: { title: 'test updated title1' },
      });
      expect(!!updatedTodo).toBeTruthy();
    });
  });

  describe('Mutation removeTodo()', () => {
    let todo: Todo;

    beforeEach(async () => {
      todo = await prisma.todo.create({
        data: {
          title: 'test title1',
          content: 'test content1',
        },
      });
    });

    it('todoが削除できること', async () => {
      const { body } = await request(app.getHttpServer())
        .delete(`/todos/${todo.id}`)
        .expect(200);
      expect(body.result).toEqual(true);

      const removedTodo = await prisma.todo.findFirst({
        where: { title: 'test title1' },
      });
      expect(!!removedTodo).toBeFalsy();
    });
  });
});
