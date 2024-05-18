import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoDto } from './dto/todo.dto';

@Controller('todos')
@UseInterceptors(ClassSerializerInterceptor)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  async create(@Body() createTodoDto: CreateTodoDto) {
    const todo = await this.todosService.create(createTodoDto);
    return new TodoDto(todo);
  }

  @Get()
  async findAll() {
    const todos = await this.todosService.findAll();
    return todos.map((todo) => new TodoDto(todo));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const todo = await this.todosService.findOne(+id);
    if (!todo) {
      throw new NotFoundException();
    }
    return new TodoDto(todo);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    const todo = await this.todosService.update(+id, updateTodoDto);
    return new TodoDto(todo);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.todosService.remove(+id);
    return { result: true };
  }
}
