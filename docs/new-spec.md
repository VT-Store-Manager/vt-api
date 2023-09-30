## Khách dùng app(Guest-1):
Là người dùng app và chưa đăng nhập. Khách có thể vào ứng dụng để xem thông tin và tìm kiếm:

+ ~~Đăng ký~~
+ ~~Đăng nhập~~
+ ~~Xem thông tin sản phẩm~~
+ ~~Xem các sản phẩm (lọc theo tên, loc theo cửa hàng)~~
+ Xem thông tin cửa hàng
	* Trả thêm định vị của cửa hàng
+ Xem các cửa hàng (lọc theo tình trạng đóng/mở, loc theo tên, địa chỉ; sắp xếp theo vị trí gần xa)
	* Tính khoảng cách từ người dùng đến từng cửa hàng
+ ~~Xem các chương trình ưu đãi~~
	* Thêm data slide các ưu đãi
+ ~~Xem các quyền lợi~~
+ ~~Xem về chúng tôi~~
+ ~~Xem các tin tức~~
+ ~~Xem các quy tắc~~
+ Xem chi tiết tin tức


## Khách tại quầy(Guest-2):
Là người tới mua hàng tại quầy nhưng không dùng tài khoản. Khách có thể:

+ ~~Đặt hàng~~
+ ~~Quản lý (thêm/sửa/xoá) sản phẩm ở giỏ~~


## Người dùng(User):
Là người dùng app đã đã đăng nhập. Người dùng sẽ kế thừa các chức năng của "Guest-1" và "Guest-2" và có thêm các chức năng như:

+ ~~Đăng xuất~~
+ ~~Sửa thông tin cá nhân.~~
+ ~~Xem rank và điểm~~
+ ~~Quản lý (thêm/sửa/xoá) địa chỉ giao hàng~~
	* Thêm định vị của địa chỉ giao hàng
+ ~~Đổi thẻ khuyến mãi (sử dụng điểm)~~
+ ~~Xem các thẻ khuyến mãi~~
+ ~~Xem chi tiết thẻ khuyến mãi~~
+ ~~Xem các thông báo~~
+ ~~Đọc thông báo~~
+ ~~Xem các voucher~~
+ ~~Xem chi tiết voucher~~
+ ~~Xem các sản phẩm gợi ý~~
+ ~~Xoá sản phẩm yêu thích~~
+ ~~Thêm sản phẩm yêu thích~~
+ ~~Quản lý (thêm/sửa/xoá) sản phẩm ở giỏ~~
+ ~~Chọn cửa hàng~~
+ ~~Chọn địa chỉ giao hàng~~
+ Chọn thời gian giao hàng
	* Cho đơn giao hàng và đến lấy
	* Thêm field scheduleTime vào bảng orders
+ ~~Áp dụng voucher~~
+ Đặt hàng (tại quầy, mang đi, giao hàng)
	* Loại giao hàng: Tự động lấy cửa hàng gần nhất
	* Lưu ý chỉnh sửa trạng thái đơn hàng
+ Hủy đơn
	* Huỷ đơn khi chưa thanh toán
+ Thanh toán (Momo, cash)
	* Thanh toán momo
+ Theo dõi trạng thái đơn hàng
	* Lưu ý thêm log thời gian các trạng thái
+ Đánh giá đơn hàng
	* Rate cả đơn, mô tả, like từng món
	* Công thêm điểm đánh giá đơn
+ Đánh giá shipper
	* Rate + mô tả
	* Cộng thêm điểm đánh giá shipper
+ Xem lịch sử các đơn hàng
+ Xem lịch sử đơn hàng
	* ~~Lưu ý thêm log thời gian các trạng thái~~
+ ~~Tạo giỏ từ đơn hàng (đặt lại)~~
+ ~~Tạo QR từ đơn hàng cũ~~
+ ~~Tạo QR từ giỏ hàng~~
+ Xem bản đồ vị trí các cửa hàng


## Nhân viên (Staff):
+ Xem các sản phẩm của cửa hàng
+ Xem các thẻ khuyến mãi của User đang đặt
	* Gợi ý các khuyến mãi có thể áp dụng
+ Cập nhật trạng thái đơn hàng
	* Lưu ý trạng thái đơn
	* Loại giao hàng: Cập nhật trạng thái shipper đã nhận đơn
+ Tạo các tab đặt hàng
+ Xoá các tab đặt hàng
+ Ghi nhận người bán
	* Chọn từ danh sách trên màn hình (ảnh, tên)
+ Xem lại lịch sử các đơn (trong ngày)
+ Quét đơn từ mã QR
+ Tạo hoá đơn
	* Thêm API hoá đơn
+ Tìm kiếm người dùng
+ Nhận đơn hàng online


## Người giao hàng (Shipper):
Realtime cho danh sách các đơn hàng

+ Chọn đơn hàng để giao
	* Thêm định vị của cửa hàng mỗi đơn
+ Cập nhật trạng thái đơn giao ( đã tới điểm giao, khách đã nhận)
+ Bật chế độ nhận đơn (gửi bằng socket)
+ Tắt chế độ nhận đơn (gửi bằng socket)
+ Xem đánh giá bản thân
	* Xếp hạng shipper theo đánh giá

## Quản trị cửa hàng (Store admin):
Là người quản lý của cửa hàng và có các chức năng sau:


+ Sửa thông tin cửa hàng
+ Disable/Enable sản phẩm (nguyên nhân)
+ Xem các thống kê về cửa hàng của mình:
	* Top sản phẩm bán chạy
	* Lịch sử các đơn hàng
	* Tỉ lệ giữa bán hàng tại quầy và đặt hàng trên app
	* Thống kê thời gian đặt hàng phổ biến
	* Thống kê giá trị phổ biến của các đơn hàng
	* Thống kê số lượng sản phẩm phổ biến của các đơn hàng


## Quản trị hệ thống (System admin):
Là người quản lý hệ thống. Quản lý hệ thống sẽ kế thừa các chức năng của "Store admin" và có thêm các chức năng như:

+ Xem các thống kê:
	* Xem doanh thu (ngày/tuần/tháng, đặt hàng/tại quầy) - OK
	* Top sản phẩm bán chạy - OK
	* Top cửa hàng bán chạy
	* Top thẻ khuyến mãi dùng nhiều
	* Top người dùng mua nhiều
	* Tỉ lệ giữa bán hàng tại quầy và đặt hàng trên app - OK
	* Thống kê chi tiết về đơn huỷ: nguyên nhân, cửa hàng nào bị huỷ nhiều, người dùng nào huỷ nhiều
	* Sản phẩm được yêu thích nhiều
	* Sản phẩm được đánh giá yêu thích
	* Thống kê chi tiết về sức mua của thành viên cũ và thành viên mới (admin chọn 1 ngày để phần biệt, mặc định là 1 tuần)
	* Thống kê giá trị phổ biến của các đơn hàng (theo user, cửa hàng và toàn bộ)
	* Thống kê thời gian đặt hàng phổ biến (theo user, cửa hàng và toàn bộ)
	* Thống kê số lượng sản phẩm phổ biến của các đơn hàng (theo user, cửa hàng và toàn bộ)
	* Thống kê cấp bậc thành viên - OK
	* Thống kê mật độ điểm thành viên - OK
	* Thời gian tìm shipper phổ biến
	* Top thu nhập shipper
	* Top shipper giao nhiều đơn
	* Top đánh giá shipper
	* Top shipper có chế độ available nhưng ko nhận đơn, treo
	* Top shipper có chế độ available nhưng không có đơn
	* Thống kê về Guest-2 (Doanh thu, số đơn, số lượng sản phẩm)
+ Quản lý thành viên: CRUD
+ Quản lý cửa hàng: CRUD
+ Quản lý shipper: CRUD
+ Quản lý staff: CRUD
+ Quản lý thẻ khuyến mãi: CRUD
+ Quản lý các chương trình ưu đãi: CRUD
+ Quản lý sản phẩm: CRUD
+ Xem các đơn hàng: Xem lịch sử các đơn hàng theo người dùng, cửa hàng hoặc toàn bộ và trạng thái của các đơn hàng đó

