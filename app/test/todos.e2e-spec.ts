import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { SubTodo } from '@prisma/client';

describe('TodosController (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let prisma: PrismaService;

  beforeEach(async () => {
    console.log(process.env.DATABASE_URL);
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

  // describe('Query findOne()', () => {
  //   beforeEach(async () => {
  //     await todoRepository.save([
  //       {
  //         title: 'test title1',
  //         content: 'test content1',
  //         subTodos: [
  //           {
  //             title: 'test sub title1',
  //             content: 'test sub content1',
  //           },
  //           {
  //             title: 'test sub title2',
  //             content: 'test sub content2',
  //           },
  //         ],
  //       },
  //       { title: 'test title2', content: 'test content2' },
  //     ]);
  //   });

  //   it('指定したfieldが取得できること(アソシエーション先含む)', async () => {
  //     const { body } = await request(app.getHttpServer())
  //       .post('/graphql')
  //       .send({
  //         query: `
  //           query todo {
  //             todo(id: 1) {
  //               id,
  //               title,
  //               content,
  //               subTodos {
  //                 title,
  //                 content
  //               }
  //             }
  //           }
  //         `,
  //       })
  //       .expect(200);
  //     expect(body.data.todo.title).toEqual('test title1');
  //     expect(body.data.todo.content).toEqual('test content1');
  //     // NOTE: アソシエーション先の取得ができていることの確認
  //     expect(body.data.todo.subTodos.length).toEqual(2);
  //     expect(
  //       !!body.data.todo.subTodos.find(
  //         (subTodo: SubTodo) => subTodo.title === 'test sub title1',
  //       ),
  //     ).toEqual(true);
  //   });

  //   it('指定したfieldが取得できること(アソシエーション先なし)', async () => {
  //     const { body } = await request(app.getHttpServer())
  //       .post('/graphql')
  //       .send({
  //         query: `
  //           query todo {
  //             todo(id: 2) {
  //               id,
  //               title,
  //               content,
  //               subTodos {
  //                 title,
  //                 content
  //               }
  //             }
  //           }
  //         `,
  //       })
  //       .expect(200);
  //     expect(body.data.todo.title).toEqual('test title2');
  //     expect(body.data.todo.content).toEqual('test content2');
  //     // NOTE: アソシエーション先は0件であることの確認
  //     expect(body.data.todo.subTodos.length).toEqual(0);
  //   });
  // });

  // describe('Mutation createTodo()', () => {
  //   it('todoが作成できること', async () => {
  //     const { body } = await request(app.getHttpServer())
  //       .post('/graphql')
  //       .send({
  //         query: `
  //           mutation createTodo {
  //             createTodo(createTodoInput: {
  //               title:"test title1",
  //               content: "test content1"
  //             }) {
  //               id,
  //               title,
  //               content
  //             }
  //           }
  //         `,
  //       })
  //       .expect(200);
  //     expect(body.data.createTodo.title).toEqual('test title1');
  //     expect(body.data.createTodo.content).toEqual('test content1');

  //     const createdTodo = await todoRepository.findOneBy({
  //       title: 'test title1',
  //     });
  //     expect(!!createdTodo).toBeTruthy();
  //   });
  // });

  // describe('Mutation updateTodo()', () => {
  //   beforeEach(async () => {
  //     await todoRepository.save([
  //       {
  //         title: 'test title1',
  //         content: 'test content1',
  //       },
  //     ]);
  //   });

  //   it('todoが更新できること', async () => {
  //     const { body } = await request(app.getHttpServer())
  //       .post('/graphql')
  //       .send({
  //         query: `
  //           mutation updateTodo {
  //             updateTodo(updateTodoInput: {
  //               id: 1,
  //               title:"test title2",
  //               content: "test content2"
  //             }) {
  //               id,
  //               title,
  //               content
  //             }
  //           }
  //         `,
  //       })
  //       .expect(200);
  //     expect(body.data.updateTodo.title).toEqual('test title2');
  //     expect(body.data.updateTodo.content).toEqual('test content2');

  //     const createdTodo = await todoRepository.findOneBy({
  //       title: 'test title2',
  //     });
  //     expect(!!createdTodo).toBeTruthy();
  //   });
  // });

  // describe('Mutation removeTodo()', () => {
  //   beforeEach(async () => {
  //     await todoRepository.save([
  //       {
  //         title: 'test title1',
  //         content: 'test content1',
  //       },
  //     ]);
  //   });

  //   it('todoが削除できること', async () => {
  //     const { body } = await request(app.getHttpServer())
  //       .post('/graphql')
  //       .send({
  //         query: `
  //           mutation removeTodo {
  //             removeTodo(id: 1) {
  //               result
  //             }
  //           }
  //         `,
  //       })
  //       .expect(200);
  //     expect(body.data.removeTodo.result).toEqual(true);

  //     const removedTodo = await todoRepository.findOneBy({
  //       title: 'test title1',
  //     });
  //     expect(!!removedTodo).toBeFalsy();
  //   });
  // });
});
