import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, Observable, tap, throwError} from "rxjs";
import {CustomResponse} from "../interface/custom-response";
import {Server} from "../interface/server";
import {Status} from "../enum/status";

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  private readonly apiUrl = 'http://localhost:8080/api/server';

  constructor(private httpClient: HttpClient) {
  }

  // C1: viết kiểu method
  // getServers(): Observable<CustomResponse> {
  //   return this.httpClient.get<CustomResponse>(`${this.apiUrl}/list`)
  //     .pipe(
  //       tap(console.log),
  //       catchError(this.handleError)
  //     );
  // }

  // servers$: biến này là một Observable
  servers$ = <Observable<CustomResponse>>
    this.httpClient.get<CustomResponse>(`${this.apiUrl}/list`)
      .pipe(
        tap(console.log), // tap: Xử lý side effect - ghi log dữ liệu phản hồi từ API vào console, mà không làm thay đổi dữ liệu.
        catchError(this.handleError)  // catchError: Bắt và xử lý lỗi nếu yêu cầu HTTP thất bại.
      );

  save$ = (server: Server) => <Observable<CustomResponse>>
    this.httpClient.post<CustomResponse>(`${this.apiUrl}/save`, server)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  ping$ = (ipAddress: String) => <Observable<CustomResponse>>
    this.httpClient.get<CustomResponse>(`${this.apiUrl}/ping/${ipAddress}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  filter$ = (status: Status, response: CustomResponse) => <Observable<CustomResponse>>
    new Observable<CustomResponse>(
      subscriber => {
        console.log(response); // list server được truyền vào để lọc

        // let updatedResponse;
        // // nếu chọn Server status ALL trả về tất cả Server
        // if (status === Status.ALL) {
        //   updatedResponse = {
        //     ...response,
        //     message: `Servers filtered by ${status} status`
        //   };
        // } else { // nếu chọn Server status khác ALL, trả về danh sách Server theo status
        //   const filteredServers = response.data.servers?.filter(server => server.status === status);
        //   updatedResponse = {
        //     ...response,
        //     message: (filteredServers && filteredServers.length > 0) ?
        //       `Servers filtered by ${status === Status.SERVER_UP ? 'SERVER UP' : 'SERVER DOWN'} status` :
        //       `No servers of ${status} found`,
        //     data: {servers: filteredServers}
        //   }
        // }

        const filteredServers = response.data.servers?.filter(server => server.status === status);
        let updatedResponse =
          status === Status.ALL ?
            {...response, message: `Servers filtered by ${status} status`} :
            {
              ...response,
              message: (filteredServers && filteredServers.length > 0) ?
                `Servers filtered by ${status === Status.SERVER_UP ? 'SERVER UP' : 'SERVER DOWN'} status` :
                `No servers of ${status} found`,
              data: {
                servers: response.data.servers?.filter(server => server.status === status)
              }
            }
        subscriber.next(updatedResponse);
        subscriber.complete();
      }
    ).pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  delete$ = (serverId: number) => <Observable<CustomResponse>>
    this.httpClient.delete<CustomResponse>(`${this.apiUrl}/delete/${serverId}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );


  /*
   * Observable<never>: không bao giờ phát ra giá trị (next),
   * không bao giờ hoàn thành (complete),
   * và không bao giờ gặp lỗi (error).
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(() => new Error(`An error occurred - Error code: ${error.status}`));
  }
}
