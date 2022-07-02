import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { IDocument } from './document.service';
import { IMeasure, MeasureService } from './measure.service';

export interface ITaskInput {
  summary: string
  description: string | null
  completed: boolean
}

export interface ITask extends ITaskInput {
  id: number
  measure: IMeasure
  document: IDocument | null 
}

export class Task implements ITask {
  id: number;
  summary: string;
  description: string | null;
  completed: boolean;
  measure: IMeasure;
  document: IDocument | null;

  constructor(task: ITask) {
    this.id = task.id
    this.summary = task.summary
    this.description = task.description
    this.completed = task.completed
    this.measure = task.measure
    this.document = task.document
  }
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(
    protected _crud: CRUDService<ITaskInput, ITask>,
    protected _measures: MeasureService) {}

  getTasksUrl(measureId: number): string {
    return `${this._measures.getMeasureUrl(measureId)}/tasks`
  }

  getTaskUrl(taskId: number): string {
    return `tasks/${taskId}`
  }

  async listTasks(measureId: number): Promise<Task[]> {
    const tasks = await this._crud.list(this.getTasksUrl(measureId))
    return tasks.map(task => new Task(task))
  }

  async createTask(measureId: number, taskInput: ITaskInput): Promise<Task> {
    const task = await this._crud.create(this.getTasksUrl(measureId), taskInput)
    return new Task(task)
  }

  async getTask(taskId: number): Promise<Task> {
    const task = await this._crud.read(this.getTaskUrl(taskId))
    return new Task(task)
  }

  async updateTask(taskId: number, taskInput: ITaskInput): Promise<Task> {
    const task = await this._crud.update(this.getTaskUrl(taskId), taskInput)
    return new Task(task)
  }

  async deleteTask(taskId: number): Promise<null> {
    return this._crud.delete(this.getTaskUrl(taskId))
  }
}
