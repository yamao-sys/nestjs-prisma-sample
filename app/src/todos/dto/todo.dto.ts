import { Todo } from '@prisma/client';
import { SubTodoDto } from '../../sub-todos/dto/sub-todo.dto';

export class TodoDto {
  id: number;

  title: string;

  content: string;

  createdAt: Date;

  updatedAt: Date;

  subTodos: SubTodoDto[];

  constructor(partial: Partial<Todo>) {
    Object.assign(this, partial);
  }
}
