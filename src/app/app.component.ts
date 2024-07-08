import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ServerService} from "./service/server.service";
import {BehaviorSubject, catchError, map, Observable, of, startWith} from "rxjs";
import {AppState} from "./interface/app-state";
import {CustomResponse} from "./interface/custom-response";
import {DataState} from "./enum/data-state";
import {Status} from "./enum/status";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  appState$?: Observable<AppState<CustomResponse>>;
  readonly DataState = DataState;
  readonly Status = Status;

  // biến lưu giá trị để hiển thị vòng xoay hoặc bộ định tuyến
  private filterSubject = new BehaviorSubject<string>('');
  private dataSubject = new BehaviorSubject<CustomResponse | undefined>(undefined);
  filterStatus$ = this.filterSubject.asObservable();

  constructor(private serverService: ServerService) {
  }

  ngOnInit(): void {
    this.appState$ = this.serverService.servers$
      .pipe( // Kết nối nhiều toán tử để xử lý và biến đổi luồng dữ liệu.
        // Biến đổi dữ liệu từ API thành cấu trúc dữ liệu phù hợp với trạng thái của ứng dụng.
        map((response: CustomResponse) => {
          this.dataSubject.next(response); // lưu lại giá trị trả về
          return {dataState: DataState.LOADED_STATE, appData: response}
        }),
        // Đặt một giá trị ban đầu cho Observable ngay lập tức khi nó được subscribe
        startWith({dataState: DataState.LOADING_STATE}),
        catchError((error: string) => {
          return of({dataState: DataState.ERROR_STATE, error})
        }),
      )
  }


  pingServer(ipAddress: string): void {
    // lưu vào biến filterSubject để gọi filterStatus$: Observable<string> và để thay đổi UI cột ping theo logic
    this.filterSubject.next(ipAddress);
    this.appState$ = this.serverService.ping$(ipAddress)
      .pipe(
        map((response: CustomResponse) => { // trả về 1 server muốn kết nối
          const index = this.dataSubject.value?.data.servers?.findIndex(server => server.id === response.data.server?.id);
          if (index && index !== -1) {
            if (this.dataSubject.value &&
              this.dataSubject.value.data &&
              this.dataSubject.value.data.servers &&
              response.data.server) {
              this.dataSubject.value.data.servers[index] = response.data.server;
            }
          }
          // đặt chuỗi về rỗng để ngừng hiển thị vòng quay và hiển thị bộ định tuyến người dùng có thể ping lại
          this.filterSubject.next('');
          return {dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}; // trả về data mới nhất
        }),
        // Đặt giá trị ban đầu cho Observable này khi subscribe là list dữ liệu server đã tải nên trước đó
        startWith({dataState: DataState.LOADING_STATE, appData: this.dataSubject.value}),
        catchError((error: string) => {
          // ngừng hiển thị vòng quay ngay cả khi lỗi
          this.filterSubject.next('');
          return of({dataState: DataState.ERROR_STATE, error})
        }),
      )
  }


}
