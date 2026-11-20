import type { CanonicalToolDefinition } from '../types/mcp-tool.interface';

export const EMR_TEMPLATE_TOOLS: CanonicalToolDefinition[] = [
  {
    name: 'template_get_outline',
    description:
      'Lấy cây cấu trúc DOM phân cấp của template đang mở kèm c-id, v-model, giá trị hiện tại, nhãn, danh sách options của Select (từ script), thuộc tính form control và ngữ cảnh hồ sơ.',
    inputSchema: {
      type: 'object',
      properties: {
        maxDepth: {
          type: 'number',
          description: 'Độ sâu tối đa của cây (mặc định: 8)',
        },
      },
    },
  },
  {
    name: 'template_query_elements',
    description:
      'Tìm nhiều linh kiện cùng loại trong template và trả danh sách phẳng gồm c-id cùng các thuộc tính cần thiết. Dùng trước template_batch_patch khi cần sửa hàng loạt.',
    inputSchema: {
      type: 'object',
      properties: {
        tag: {
          type: 'string',
          description: 'Tên thẻ hoặc component cần tìm, ví dụ Checkbox, Textarea, Signature',
        },
        attributes: {
          type: 'object',
          description: 'Các thuộc tính dùng để lọc chính xác, ví dụ { "size": "md" }',
        },
        include: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['attributes', 'innerHTML', 'outerHTML'],
          },
          uniqueItems: true,
          description: 'Dữ liệu cần trả thêm; mặc định là attributes',
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 100,
          description: 'Số kết quả tối đa, mặc định 100',
        },
      },
      required: ['tag'],
    },
  },
  {
    name: 'template_inspect_element',
    description: 'Xem chi tiết và tự động cuộn/highlight linh kiện trực tiếp trên màn hình Client qua c-id.',
    inputSchema: {
      type: 'object',
      properties: {
        cid: {
          type: 'string',
          description: 'c-id của linh kiện cần xem chi tiết',
        },
      },
      required: ['cid'],
    },
  },
  {
    name: 'template_insert_element',
    description: 'Chèn linh kiện mới vào mẫu trực tiếp trên màn hình Client trình duyệt.',
    inputSchema: {
      type: 'object',
      properties: {
        targetCid: {
          type: 'string',
          description: 'c-id của phần tử mốc để chèn',
        },
        position: {
          type: 'string',
          enum: ['before', 'after', 'append', 'prepend'],
          description: 'Vị trí chèn tương quan so với targetCid',
        },
        tag: {
          type: 'string',
          description: 'Tên thẻ hoặc component (vd: Textarea, DatePicker, Select, Paint, div, Signature)',
        },
        attributes: {
          type: 'object',
          description: 'Thuộc tính component (ví dụ: { "label": "Họ tên:", "v-model": "data.hoTen" })',
        },
        textContent: {
          type: 'string',
          description: 'Nội dung chữ bên trong thẻ',
        },
        rawInnerHtml: {
          type: 'string',
          description: 'Nội dung HTML thô bên trong',
        },
        html: {
          type: 'string',
          description: 'Chuỗi HTML đầy đủ cần chèn (nếu không dùng tag/attributes)',
        },
      },
      required: ['targetCid', 'position'],
    },
  },
  {
    name: 'template_patch_element',
    description:
      'Chỉnh sửa thuộc tính, CSS styles hoặc nội dung của một linh kiện trực tiếp trên màn hình Client qua c-id. Bắt buộc truyền cid và ít nhất một trong attributes, removeAttributes, textContent hoặc innerHtml.',
    inputSchema: {
      type: 'object',
      properties: {
        cid: {
          type: 'string',
          description: 'c-id của component cần chỉnh sửa',
        },
        attributes: {
          type: 'object',
          description: 'Các thuộc tính cần cập nhật (ví dụ: { "style": "color: #1e3a8a;" })',
        },
        removeAttributes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Danh sách thuộc tính cần xóa bỏ',
        },
        textContent: {
          type: 'string',
          description: 'Nội dung text mới',
        },
        innerHtml: {
          type: 'string',
          description: 'HTML con mới bên trong',
        },
      },
      required: ['cid'],
    },
  },
  {
    name: 'template_batch_patch',
    description:
      'Chỉnh sửa nhiều linh kiện đang tồn tại trong một lần gọi. Toàn bộ danh sách được áp dụng cùng lúc; nếu một patch hoặc c-id không hợp lệ thì không thay đổi linh kiện nào.',
    inputSchema: {
      type: 'object',
      properties: {
        patches: {
          type: 'array',
          minItems: 1,
          maxItems: 100,
          description: 'Danh sách các chỉnh sửa cần áp dụng theo thứ tự.',
          items: {
            type: 'object',
            properties: {
              cid: { type: 'string', description: 'c-id của component cần chỉnh sửa' },
              attributes: { type: 'object', description: 'Các thuộc tính cần cập nhật' },
              removeAttributes: {
                type: 'array',
                items: { type: 'string' },
                description: 'Danh sách thuộc tính cần xóa bỏ',
              },
              textContent: { type: 'string', description: 'Nội dung text mới' },
              innerHtml: { type: 'string', description: 'HTML con mới bên trong' },
            },
            required: ['cid'],
          },
        },
        message: {
          type: 'string',
          description: 'Thông báo tóm tắt nhóm thay đổi',
        },
      },
      required: ['patches'],
    },
  },
  {
    name: 'template_remove_element',
    description: 'Xóa bỏ một linh kiện khỏi mẫu trực tiếp trên màn hình Client qua c-id.',
    inputSchema: {
      type: 'object',
      properties: {
        cid: {
          type: 'string',
          description: 'c-id của component cần xóa',
        },
      },
      required: ['cid'],
    },
  },
  {
    name: 'template_move_element',
    description: 'Di chuyển một linh kiện sang vị trí mới trực tiếp trên màn hình Client.',
    inputSchema: {
      type: 'object',
      properties: {
        cid: { type: 'string', description: 'c-id của component cần di chuyển' },
        targetCid: { type: 'string', description: 'c-id của component mốc' },
        position: {
          type: 'string',
          enum: ['before', 'after', 'append', 'prepend'],
          description: 'Vị trí tương quan so với targetCid',
        },
      },
      required: ['cid', 'targetCid', 'position'],
    },
  },
  {
    name: 'template_get_code',
    description: 'Lấy toàn bộ mã nguồn HTML, Vue Script và Context Data hiện tại đang mở trong trình thiết kế.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'template_set_code',
    description:
      'Cập nhật trực tiếp mã nguồn HTML (template), Vue Script (script) hoặc Context Data (context) lên trình thiết kế. Dùng khi tạo mẫu mới hoặc thay đổi script/bố cục lớn.',
    inputSchema: {
      type: 'object',
      properties: {
        templateId: {
          type: 'string',
          description: 'Mã mẫu hồ sơ (nếu có).',
        },
        template: {
          type: 'string',
          description: 'Toàn bộ mã HTML template mới (bọc trong thẻ root DUY NHẤT là PageA4 hoặc PageA5)',
        },
        script: {
          type: 'string',
          description:
            'Tùy chọn — mặc định bỏ trống "" nếu không cần danh mục tĩnh/hàm tính mới. Toàn bộ biến trong context (hsBenhAn, phieuVaoVien, hsThongTinBenhAn, hsTongKetBenhAn, data, config, dm*, openPopupBuongGiuong, moment...) đã có sẵn trực tiếp trong template, KHÔNG khai báo lại hay return trùng tên. Nếu cần viết: top-level JS dùng reactive/computed/ref/moment/$context, chỉ return các biến/hàm MỚI, không dùng export default hoặc defineComponent.',
        },
        context: {
          type: 'object',
          description: 'Đối tượng Context Data schema mới ({ data: { ... } }) dùng cho blankFormData khi mở phiếu mới',
        },
      },
    },
  },
  {
    name: 'template_update_context',
    description:
      'Cập nhật dữ liệu mẫu trong context.data (hoặc schema giá trị mặc định) mà không thay đổi HTML/Script.',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Đối tượng chứa các trường tương ứng v-model="data.*". Không bọc thêm lồng context hay data.',
        },
        message: {
          type: 'string',
          description: 'Thông báo tóm tắt nội dung vừa cập nhật',
        },
      },
      required: ['data'],
    },
  },
  {
    name: 'template_get_catalog',
    description: 'Tra cứu thư viện linh kiện chuẩn của HIS/EMR kèm danh sách props và ví dụ code mẫu.',
    inputSchema: {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Tên linh kiện cần tra cứu (để trống nếu muốn xem tất cả)',
        },
      },
    },
  },
  {
    name: 'template_get_context_schema',
    description:
      'Tra cứu toàn bộ cấu trúc và đường dẫn biến dữ liệu có sẵn trong context (như hsBenhAn, phieuVaoVien, dmNgheNghiep, data...) kèm kiểu và giá trị mẫu để binding hoặc giải thích cho người dùng.',
    inputSchema: {
      type: 'object',
      properties: {
        prefix: {
          type: 'string',
          description: 'Lọc theo nhóm đầu đường dẫn (vd: hsBenhAn, hsBenhAn.BenhAnChiTietObj, hsBenhAn.BenhNhan, phieuVaoVien, data)',
        },
        keyword: {
          type: 'string',
          description: 'Từ khóa tìm kiếm tên trường hoặc giá trị mẫu (vd: HoTen, BHYT, LyDoVaoVien, Mach)',
        },
        limit: {
          type: 'number',
          description: 'Số trường tối đa trả về (mặc định 150)',
        },
      },
    },
  },
  {
    name: 'template_list_references',
    description:
      'Liệt kê các mẫu hồ sơ tùy chỉnh đã lưu sẵn trong HS106 (đã có mã HTML) để tham khảo bố cục, cách dùng linh kiện và binding dữ liệu khi tạo mẫu mới hoặc tạo biến thể. Mặc định lọc theo khung MauTuyChinh đang mở.',
    inputSchema: {
      type: 'object',
      properties: {
        mauTuyChinh: {
          type: 'string',
          description:
            'Khung loại mẫu cần lọc (ToBenhAnTC, PhieuVaoVienTC, HSThongTinBenhNhanTC, HSThongTinBenhAnTC, HSTongKetBenhAnTC). Truyền "ALL" để xem mọi khung; bỏ trống sẽ lọc theo khung đang mở.',
        },
        keyword: {
          type: 'string',
          description: 'Từ khóa tìm theo tên, mã mẫu hoặc loại bệnh án (hỗ trợ không dấu, vd: "vao vien", "tam than", "tong ket")',
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 50,
          description: 'Số mẫu tối đa trả về (mặc định 20)',
        },
      },
    },
  },
  {
    name: 'template_get_reference',
    description:
      'Đọc toàn bộ mã nguồn HTML (template), Script và Context của một mẫu hồ sơ đã có sẵn trong HS106 để học cấu trúc chuẩn hoặc làm khung tạo biến thể mới.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Id (GUID) của mẫu tham khảo lấy từ template_list_references',
        },
        ma: {
          type: 'string',
          description: 'Mã mẫu (Ma) nếu không truyền id',
        },
      },
    },
  },
  {
    name: 'template_capture',
    description:
      'Chụp ảnh các trang biểu mẫu đã render (.page-a4-sheet, .page-a5-sheet) hoặc một phần tử theo c-id trên khung xem trước để kiểm tra bố cục, tràn trang và thẩm mỹ in ấn.',
    inputSchema: {
      type: 'object',
      properties: {
        cid: {
          type: 'string',
          description: 'c-id của phần tử cần chụp (bỏ trống hoặc "123456" để chụp toàn bộ các trang)',
        },
        scale: {
          type: 'number',
          description: 'Hệ số phóng to độ nét (mặc định: 1.5)',
        },
      },
    },
  },
];
