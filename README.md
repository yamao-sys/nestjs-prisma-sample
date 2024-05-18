# nestjs-prisma-sample

NestJS × Prismaのサンプルアプリケーション

npm install @prisma/client

npx prisma migrate dev --name init

prisma migrate dev --preview-feature

テーブル名やカラム名はスネークケースで、使用時はキャメルケースで使えるように
npx prisma-case-format --file prisma/schema.prisma --map-table-case=snake,plural --map-field-case=snake && npx prisma format && npx prisma generate

prismaの環境変数を環境ごとに変更できるようにdotenvを使用
