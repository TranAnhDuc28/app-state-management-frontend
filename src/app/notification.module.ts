import {NgModule} from '@angular/core';
import {NotifierModule, NotifierOptions} from "angular-notifier";

const notifierDefaultOptions: NotifierOptions = {
  position: {
    horizontal: { // ngang
      position: 'left', // xác định vị trí nằm ngang trên màn hình {'left' | 'middle' | 'right'}
      distance: 12, // Xác định khoảng cách nằm đến cạnh màn hình (tính bằng px)
    },
    vertical: { // dọc
      position: 'bottom', // Xác định vị trí nằm dọc trên màn hình {'top' | 'bottom'}
      distance: 12, // Xác định khoảng cách theo chiều dọc đến cạnh màn hình (tính bằng px)
      gap: 10, // Xác định khoảng cách dọc, tồn tại giữa nhiều thông báo (tính bằng px)
    },
  },
  theme: 'material', // Xác định chủ đề thông báo, chịu trách nhiệm về Thiết kế trực quan của thông báo
  behaviour: {
    autoHide: 5000, // Xác định mỗi thông báo có tự động ẩn sau khi hết thời gian chờ {number | false}
    onClick: 'hide', // Xác định điều gì sẽ xảy ra khi ai đó nhấp vào thông báo {'hide' | false}
    onMouseover: 'pauseAutoHide', // Xác định điều gì sẽ xảy ra khi ai đó di chuột qua thông báo {'pauseAutoHide' | 'resetAutoHide' | false}
    showDismissButton: true, // Xác định xem nút loại bỏ có hiển thị hay không
    stacking: 4, // Xác định xem nhiều thông báo có được xếp chồng lên nhau hay không và giới hạn ngăn xếp cao bao nhiêu {number | false}
  },
  animations: {
    enabled: true, // Xác định xem tất cả (!) hoạt ảnh được bật hay tắt
    show: {
      preset: 'slide', // Xác định hoạt ảnh cài đặt trước đó sẽ được sử dụng để tạo hoạt ảnh cho thông báo mới {'fade' | 'slide'}
      speed: 300, // Xác định sẽ mất bao lâu để tạo hiệu ứng cho thông báo mới (tính bằng mili giây)
      easing: 'ease', // Xác định phương pháp easing nào sẽ được sử dụng khi tạo hoạt ảnh cho thông báo mới {'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'}
    },
    hide: {
      preset: 'fade', // Xác định hoạt ảnh cài đặt trước đó sẽ được sử dụng để tạo hoạt ảnh cho thông báo mới {'fade' | 'slide'}
      speed: 300, // Xác định sẽ mất bao lâu để tạo hiệu ứng cho thông báo mới (tính bằng mili giây)
      easing: 'ease',
      offset: 50, // Xác định độ lệch hoạt ảnh được sử dụng khi ẩn nhiều thông báo cùng một lúc (tính bằng mili giây) {number | false}
    },
    shift: {
      speed: 300, // Xác định sẽ mất bao lâu để chuyển thông báo xung quanh (tính bằng mili giây)
      easing: 'ease',
    },
    overlap: 150, // Xác định sự chồng chéo hoạt ảnh tổng thể, cho phép hoạt ảnh trông mượt mà hơn nhiều (tính bằng mili giây) {number | false}
  },
};

@NgModule({
  imports: [NotifierModule.withConfig(notifierDefaultOptions)],
  exports: [NotifierModule]
})
export class NotificationModule {
}
