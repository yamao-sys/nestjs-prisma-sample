import { SubTodo } from '@prisma/client';
import { Transform } from 'class-transformer';

export class SubTodoDto {
  @Transform(({ value }) => value.toString()) // BigIntを文字列に変換する
  id: bigint;

  @Transform(({ value }) => value.toString()) // BigIntを文字列に変換する
  todoId: bigint;

  title: string;

  content: string;

  createdAt: Date;

  updatedAt: Date;

  constructor(partial: Partial<SubTodo>) {
    Object.assign(this, partial);
  }
}
