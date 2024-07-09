import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ServerService} from "./service/server.service";
import {BehaviorSubject, catchError, map, Observable, of, startWith} from "rxjs";
import {AppState} from "./interface/app-state";
import {CustomResponse} from "./interface/custom-response";
import {DataState} from "./enum/data-state";
import {Status} from "./enum/status";
import {NgForm} from "@angular/forms";
import {Server} from "./interface/server";
import {NotificationService} from "./service/notification.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // Tăng hiệu suất, kiểm soát tốt hơn, dễ dàng phát hiện lỗi, tối ưu hóa việc sử dụng tài nguyên
})
export class AppComponent implements OnInit {
  appState$?: Observable<AppState<CustomResponse>>;
  readonly DataState = DataState;
  readonly Status = Status;

  // biến lưu giá trị để hiển thị vòng xoay hoặc bộ định tuyến
  private filterSubject = new BehaviorSubject<string>('');
  // biến lưu giá trị dữ liệu trả về từ API
  private dataSubject = new BehaviorSubject<CustomResponse | undefined>(undefined);
  // filterStatus$ trỏ đến filterSubject lưu ipAddress để sử dụng hiển thị icon ping hay spiner
  filterStatus$ = this.filterSubject.asObservable();

  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();

  constructor(private serverService: ServerService,
              private notifier: NotificationService) {
  }

  ngOnInit(): void {
    this.appState$ = this.serverService.servers$
      .pipe( // Kết nối nhiều toán tử để xử lý và biến đổi luồng dữ liệu.
        // Biến đổi dữ liệu từ API thành cấu trúc dữ liệu phù hợp với trạng thái của ứng dụng.
        map((response: CustomResponse) => {
          this.notifier.onDefault(response.message);
          this.dataSubject.next(response); // lưu lại giá trị trả về
          return {
            dataState: DataState.LOADED_STATE,
            appData: {...response, data: {servers: response.data.servers?.reverse()}}
          }
        }),
        // Đặt một giá trị ban đầu cho Observable ngay lập tức khi nó được subscribe
        startWith({dataState: DataState.LOADING_STATE}),
        catchError((error: string) => {
          this.notifier.onError(error);
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
            if (response.data.server && this.dataSubject.value?.data.servers) {
              this.dataSubject.value.data.servers[index] = response.data.server;
            }
          }
          this.notifier.onSuccess(response.message);
          // đặt chuỗi về rỗng để ngừng hiển thị vòng quay và hiển thị bộ định tuyến người dùng có thể ping lại
          this.filterSubject.next('');
          return {dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}; // trả về data mới nhất
        }),
        // Đặt giá trị ban đầu cho Observable này khi subscribe là list dữ liệu server đã tải nên trước đó
        startWith({dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
        catchError((error: string) => {
          this.notifier.onError(error);
          // ngừng hiển thị vòng quay ngay cả khi lỗi
          this.filterSubject.next('');
          return of({dataState: DataState.ERROR_STATE, error})
        }),
      )
  }


  saveServer(serverForm: NgForm): void {
    this.isLoading.next(true); // hiển thị icon spiner
    this.appState$ = this.serverService.save$(serverForm.value)
      .pipe(
        map((response: CustomResponse) => {
          if (response.data.server && this.dataSubject.value?.data.servers) {
            this.dataSubject.next({
              ...response,
              data: {servers: [response.data.server, ...this.dataSubject.value.data.servers]}
            });
          }
          this.notifier.onSuccess(response.message);
          document.getElementById('closeModal')?.click(); // thêm thành công thì đóng modal
          this.isLoading.next(false); // ẩn hiển thị icon spiner khi save successfully
          serverForm.resetForm({status: this.Status.SERVER_DOWN}); // đưa form về lúc chưa nhập với trạng thái ngắt ko kết nối
          return {dataState: DataState.LOADED_STATE, appData: this.dataSubject.value};
        }),
        startWith({dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
        catchError((error: string) => {
          this.notifier.onError(error);
          this.isLoading.next(false); // ẩn hiển thị icon spiner khi save failed
          return of({dataState: DataState.ERROR_STATE, error})
        }),
      )
  }


  // lọc từ dữ liệu từ list server thay vì call từ backend
  filterServers(status: Status): void {
    if (this.dataSubject.value) {
      this.appState$ = this.serverService.filter$(status, this.dataSubject.value)
        .pipe(
          map((response: CustomResponse) => {
            this.notifier.onDefault(response.message);
            return {dataState: DataState.LOADED_STATE, appData: response};
          }),
          startWith({dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
          catchError((error: string) => {
            this.notifier.onError(error);
            this.filterSubject.next('');
            return of({dataState: DataState.ERROR_STATE, error})
          })
        );
    }
  }

  deleteServer(server: Server): void {
    this.appState$ = this.serverService.delete$(server.id)
      .pipe(
        map((response: CustomResponse) => {
          this.dataSubject.next({
            ...response,
            data: {
              servers: this.dataSubject.value?.data.servers?.filter(s => s.id !== server.id)
            }}
          );
          this.notifier.onSuccess(response.message);
          return {dataState: DataState.LOADED_STATE, appData: this.dataSubject.value};
        }),
        startWith({dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
        catchError((error: string) => {
          this.notifier.onError(error);
          return of({dataState: DataState.ERROR_STATE, error})
        }),
      );
  }


  printReport(): void {
    this.notifier.onDefault('Report downloaded');
    // window.print();
    let dataType = 'application/vnd.ms-excel.sheet.macroEnabled.12';
    let tableSelect = document.getElementById('servers');

    // tableSelect?.outerHTML : Lấy chuỗi HTML bên ngoài của phần tử DOM được chọn => KQ: <table id="servers"> ... </table>
    // .replace(/ /g, '%20') thay thế tất cả các khoảng trắng trong chuỗi HTML bằng %20
    let tableHTML = tableSelect?.outerHTML.replace(/ /g, '%20');
    console.log(tableHTML);

    let downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);

    /** Cú pháp chung của data: URL là:
     * data:[<MIME-type>][;charset=<character-set>][;base64],<data>
     *   Trong đó:
     *  + <MIME-type>: Loại dữ liệu (ví dụ: text/plain, application/json, image/png, v.v.).
     *  + charset=<character-set>: (tùy chọn) Bộ ký tự (thường là UTF-8).
     *  + base64: (tùy chọn) Cho biết dữ liệu đã được mã hóa base64.
     *  + <data>: Dữ liệu thực tế, được mã hóa theo base64 nếu cờ base64 được sử dụng.
     */
    downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
    downloadLink.download = 'server-report.xls';
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}
