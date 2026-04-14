import { IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsInt } from "class-validator";

export class CreateTaskDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsNotEmpty()
  @IsInt()
  listId: number; 
}
