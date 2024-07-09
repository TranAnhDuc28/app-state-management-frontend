import {Injectable} from '@angular/core';
import {NotifierService} from "angular-notifier";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly notifer: NotifierService;

  constructor(notifierService: NotifierService) {
    this.notifer = notifierService;
  }

  onDefault(message: string): void {
    this.notifer.notify(Type.DEFAULT, message);
  }

  onSuccess(message: string): void {
    this.notifer.notify(Type.SUCCESS, message);
  }

  onInfo(message: string): void {
    this.notifer.notify(Type.INFO, message);
  }

  onWarning(message: string): void {
    this.notifer.notify(Type.WARNING, message);
  }

  onError(message: string): void {
    this.notifer.notify(Type.ERROR, message);
  }
}

enum Type {
  DEFAULT= 'default',
  SUCCESS ='success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info'
}
