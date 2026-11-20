import type { ComponentCatalog } from '../types/mcp-tool.interface';

export const EMR_COMPONENT_CATALOG: ComponentCatalog = {
  PageA4: {
    description:
      'Trang in A4 chuẩn (210x297mm). Thẻ root DUY NHẤT cho mẫu A4. Tự động cắt trang (auto-paginate) theo các thẻ con trực tiếp: TUYỆT ĐỐI KHÔNG bọc toàn bộ nội dung trong 1 thẻ <div>; hãy tổ chức thành nhiều block con trực tiếp (<header>, <section>, <footer>) để hệ thống tự chia trang .page-a4-sheet khi nội dung dài.',
    props: {
      ':landscape': 'true nếu là khổ ngang',
      ':auto-paginate': 'true/false bật tắt tự động cắt trang (mặc định true)',
      style: 'padding trang (khuyến nghị "padding: 10mm 12mm;")',
    },
    example:
      '<PageA4 style="padding: 10mm 12mm; font-family: \'Times New Roman\', serif;"><header>...</header><section>...</section><footer>...</footer></PageA4>',
  },
  PageA5: {
    description:
      'Trang in A5 chuẩn (148x210mm). Thẻ root DUY NHẤT cho mẫu A5. Tự động cắt trang theo các thẻ con trực tiếp: TUYỆT ĐỐI KHÔNG bọc toàn bộ nội dung trong 1 thẻ <div>; hãy chia nhỏ thành nhiều block con trực tiếp để tự động phân bổ sang các trang .page-a5-sheet.',
    props: {
      ':landscape': 'true nếu là khổ ngang',
      ':auto-paginate': 'true/false bật tắt tự động cắt trang (mặc định true)',
      style: 'padding trang (khuyến nghị "padding: 8mm 10mm;")',
    },
    example:
      '<PageA5 style="padding: 8mm 10mm;"><header>...</header><section>...</section></PageA5>',
  },
  Textarea: {
    description:
      'Component nhập văn bản CHUẨN duy nhất cho CẢ trường 1 dòng (Họ tên, Địa chỉ, Điện thoại, Phòng/Giường...) LẪN đoạn nhiều dòng. Mặc định rows=1, có sẵn đường kẻ chấm (:line="true") và tự giãn dòng khi nhập dài. TUYỆT ĐỐI không thay thế bằng thẻ <input> hay <textarea> HTML thuần.',
    props: {
      'v-model': 'Đường dẫn dữ liệu có thể sửa (vd: data.hoTen hoặc hsBenhAn.BenhNhan.HoTen)',
      ':modelValue': 'Dùng kèm readonly cho trường chỉ hiển thị từ hsBenhAn (vd: readonly :modelValue="hsBenhAn.Ma")',
      label: 'Nhãn đứng trước vùng nhập (hoặc dùng slot <template #label><b>...</b></template> khi cần định dạng HTML)',
      ':line': 'true để hiện dòng kẻ chấm ngầm (mặc định true, khớp chiều cao dòng 20px chuẩn)',
      type: 'text | number',
      rows: 'Số dòng tối thiểu (mặc định 1)',
      maxlength: 'Giới hạn số ký tự tối đa (vd: 4 cho ô sinh hiệu)',
      readonly: 'Chỉ đọc',
      'textarea-style': 'CSS riêng cho thẻ textarea bên trong (vd: font-weight: bold; text-transform: uppercase;).',
    },
    example:
      '<Textarea v-model="data.hoTen" label="Họ và tên:" :line="true"></Textarea>',
  },
  DatePicker: {
    description: 'Chọn hoặc nhập ngày/giờ theo định dạng moment.',
    props: {
      'v-model': 'Đường dẫn lưu chuỗi ngày giờ',
      label: 'Nhãn đứng trước',
      format: 'Định dạng hiển thị (vd: DD/MM/YYYY, HH:mm DD/MM/YYYY, DD [tháng] MM [năm] YYYY)',
      'minute-step': 'Bước nhảy phút',
      'input-style': 'CSS riêng cho ô input',
    },
    example: '<DatePicker v-model="data.ngayKy" label="Ngày khám:" format="DD/MM/YYYY"></DatePicker>',
  },
  InputOTP: {
    description: 'Ô nhập mã số tách từng ô rời (mã bệnh nhân, mã BHYT, tuổi...).',
    props: {
      'v-model': 'Đường dẫn chuỗi giá trị',
      ':mask-length': 'Mảng số lượng ký tự mỗi cụm ô (vd: [1,1,1,1])',
      type: 'text | number',
      'pad-char': 'Ký tự đệm khi thiếu độ dài',
      'pad-start': 'Ký tự đệm phía trước',
    },
    example: '<InputOTP v-model="data.maYTe" :mask-length="[1,1,1,1,1,1]"></InputOTP>',
  },
  Select: {
    description: 'Menu chọn danh mục (mảng options trả về từ Script top-level).',
    props: {
      'v-model': 'Đường dẫn lưu giá trị đã chọn',
      label: 'Nhãn đứng trước',
      ':items': 'Tên biến mảng trong script hoặc literal array',
      'bind-label': 'Tên trường hiển thị',
      'bind-value': 'Tên trường giá trị',
      ':multiple': 'true nếu cho phép chọn nhiều',
      'search-by-keys': 'Danh sách key tìm kiếm',
    },
    example:
      '<Select v-model="data.ketQua" label="Kết quả điều trị:" :items="ketQuaList" bind-label="ten" bind-value="ma"></Select>',
  },
  Checkbox: {
    description: 'Hộp kiểm đánh dấu tích đơn hoặc nhóm lựa chọn.',
    props: {
      'v-model': 'Đường dẫn lưu boolean hoặc chuỗi enum đã chọn',
      native: 'Thêm thuộc tính native (kèm :value="true") cho checkbox boolean độc lập; BỎ native khi dùng chọn 1 trong nhiều giá trị enum',
      value: 'Giá trị gắn với checkbox (vd: value="BHYT", :value="true", :value="false")',
      'before-text': 'Chữ đứng trước ô checkbox (hoặc dùng slot <template #beforeText>...</template>)',
      'after-text': 'Chữ đứng sau ô checkbox',
      size: 'sm | md | lg | xl (mặc định md)',
    },
    example:
      '<Checkbox v-model="data.daDongY" :native="true" size="md" after-text="Tôi đồng ý thực hiện thủ thuật"></Checkbox>',
  },
  Paint: {
    description: 'Khung vẽ hình, khoanh vùng tổn thương hoặc ghi chú trực quan trên ảnh nền giải phẫu.',
    props: {
      'v-model': 'Đường dẫn lưu chuỗi ảnh base64 đã vẽ',
      src: 'Đường dẫn ảnh nền tĩnh (nếu có)',
      ':line-width': 'Độ dày nét vẽ mặc định (mặc định 3)',
      color: 'Màu nét vẽ mặc định (mặc định #000000)',
    },
    example:
      '<Paint v-model="data.soDoTonThuong" style="width: 100%; height: 180px;" color="#dc2626" :line-width="2"></Paint>',
  },
  IcdGroupItem: {
    description: 'Cụm nhập 1 mã bệnh ICD-10 gồm tên bệnh và ô mã ICD rời.',
    props: {
      'v-model': 'Đường dẫn lưu GUID mã bệnh ICD (vd: hsBenhAn.BenhAnChiTietObj.IcdKKBCC)',
      'v-model:ten': 'Đường dẫn lưu tên bệnh ICD',
      'v-model:ma': 'Đường dẫn lưu mã bệnh ICD',
      label: 'Nhãn đầu dòng (vd: 22. Cấp cứu, KKB:)',
      type: 'YHHD | YHCT',
      ':index': 'Chỉ số thứ tự nếu nằm trong danh sách',
    },
    example:
      '<IcdGroupItem label="22. Cấp cứu, KKB:" v-model="hsBenhAn.BenhAnChiTietObj.IcdKKBCC" v-model:ten="hsBenhAn.BenhAnChiTietObj.IcdKKBCCTen" v-model:ma="hsBenhAn.BenhAnChiTietObj.IcdKKBCCMa" />',
  },
  IcdList: {
    description: 'Danh sách nhiều mã bệnh ICD-10 (bệnh kèm theo).',
    props: {
      ':items': 'Mảng các item bệnh kèm theo ({ TenVN, Ma })',
      type: 'YHHD | YHCT',
      'path-items': 'Tên chuỗi path dữ liệu tương ứng để context-menu thêm/xóa bệnh',
    },
    example:
      '<IcdList :items="data.ListBenhKemTheo" path-items="data.ListBenhKemTheo" type="YHHD"></IcdList>',
  },
  Signature: {
    description:
      'Điểm neo vị trí ký số trên bản PDF và tự động đồng bộ vào danh mục vị trí ký HS106. Không dùng prop title và không dùng ký điện tử HTML.',
    props: {
      code: 'Mã vị trí ký duy nhất (vd: BacSiDieuTri, TruongKhoa, NguoiBenh)',
      label: 'Tên hiển thị vị trí ký để HS106 tự tạo cấu hình ký số',
    },
    example: '<Signature code="BacSiDieuTri" label="Bác sĩ điều trị"></Signature>',
  },
};
