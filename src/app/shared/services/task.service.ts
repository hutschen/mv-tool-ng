import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { MeasureService } from './measure.service';

export interface ITaskInput {}
export interface ITask extends ITaskInput {}

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

  async listTasks(measureId: number): Promise<ITask[]> {
    return this._crud.list(this.getTasksUrl(measureId))
  }

  async createTask(measureId: number, taskInput: ITaskInput): Promise<ITask> {
    return this._crud.create(this.getTasksUrl(measureId), taskInput)
  }

  async getTask(taskId: number): Promise<ITask> {
    return this._crud.read(this.getTaskUrl(taskId))
  }

  async updateTask(taskId: number, taskInput: ITaskInput): Promise<ITask> {
    return this._crud.update(this.getTaskUrl(taskId), taskInput)
  }

  async deleteTask(taskId: number): Promise<null> {
    return this._crud.delete(this.getTaskUrl(taskId))
  }
}
