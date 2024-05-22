# nestjs-prisma-sample

NestJS × Prismaのサンプルアプリケーション

## 試してみた所管
- DBを用いたテストの設定やFactoryBotのような設定が煩わしい...
	- 並列実行できるようDBの並列化、テストごとのDBのクリーンアップ処理(、FactoryBot化)を行う

## Jest実行時のDBの並列化
以下記事を参考に、setupFilesAfterEnvでJestのWORKERごとにDBの並列作成とDB接続を行う

https://zenn.dev/takecchi/articles/b01335a0c8266a

## Jest実行時のテストごとのDBのクリーンアップ処理
jest-prismaを検討したものの、専用の実行環境とPrismaService(NestJSでのDB接続処理を担うクラス)との接続が上手くいきにくく、別手段を検討
→ テストが終了するごとにprisma resetを行う

テストが多くなってくると、実行時間が課題になりそう

テストの実行パイプラインの可視化などでボトルネックを探してチューニングすることが大切になりそう

## コマンド類
開発環境の立ち上げ
```
docker-compose build
docker-compose up
```

NestJSでresource(controller, service, module, entity)を一式作成する
```
nest g resource [name]
```

最新のスキーマ作成
```
npx prisma generate
```

テーブル名とカラム名をコード内ではキャメルケースで、DB上ではスネークケースで扱えるようにスキーマ作成
```
npx prisma-case-format --file prisma/schema.prisma --map-table-case=snake,plural --map-field-case=snake && npx prisma format && npx prisma generate
```

マイグレーション作成
```
npx prisma migrate dev
```

マイグレーション実行
```
prisma migrate dev --preview-feature
```

## 参考
- https://qiita.com/ebatan-developer/items/14031910f869b78b1439
- https://zenn.dev/takecchi/articles/b01335a0c8266a
- https://bunlog913.dev/prisma_factory/
- https://dev.classmethod.jp/articles/prisma_using_test_only_db/
- https://dev.classmethod.jp/articles/prisma-jest-isolated-transaction/
- https://dev.classmethod.jp/articles/prisma-test-factory-helper/
