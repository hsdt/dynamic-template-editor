<template>
  <DatePickerPortal />
  <Preview v-model:template="template" v-model:editMode="editMode" :context="context" />
  <!-- <Codemirror v-model:value="template" :options="{ mode: 'text/html', theme: 'default', tabSize: 2 }" height="400px" :border="true" /> -->
</template>

<script lang="ts">
import Preview from './Preview.vue';
import "codemirror/mode/htmlmixed/htmlmixed.js"
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import DatePickerPortal from '../forms/DatePickerPortal.vue';

export default {
  name: 'PreviewWrapper',
  components: { Preview, DatePickerPortal },
  data() {
    return {
      editMode: true,
      template: `
      <PageA4 style="padding:3mm 15mm">
        <div><b>Textarea</b></div>
        <Textarea v-model="data.name" label="Họ và tên:" line :suffix="{ length:1, char:'❤️' }" />
        <Textarea v-model="data.name" line :suffix="{ length:1, char:'❤️' }">
          <template #label> Họ và tên: </template>
        </Textarea>

        <div><b>InputOTP</b></div>
        <InputOTP v-model="data.age" :mask-length="[1,1,1]" pad-start="0" />

        <div><b>Context menu (directive v-context-menu)</b></div>
        <div v-for="item in contextItems" :key="item.id" v-context-menu:ctxMenu="item" style="padding:8px;border:1px dashed #aaa;margin-bottom:6px">
          Chuột phải vào: {{ item.label }}
        </div>
        <ContextMenu ref="ctxMenu">
          <template #default="{ subject }">
            <li @click="log(subject)">Sửa</li>
            <li @click="log(subject)">Xóa</li>
            <li @click="log(subject)">Nhân bản</li>
          </template>
        </ContextMenu>

        <div><b>Select one</b></div>
        <Select v-model="data.category" label="Danh mục:" placeholder="Chọn danh mục"
          bind-label="name" bind-value="id" :items="categoryList" />

        <div><b>Select multiple</b></div>
        <Select v-model="data.tags" label="Tags:" placeholder="Chọn tags"
          bind-label="label" bind-value="value" :items="tagList" multiple />
        <div style="color:#0066cc">Tags đã chọn {{ data.tags }}</b></div>

        <div><b>DatePicker - Chọn ngày sinh</b></div>
        <DatePicker label="Ngày sinh" v-model="data.birthday" placeholder="Chọn ngày sinh" format="DD/MM/YYYY"/>
        <DatePicker v-model="data.birthday" placeholder="Chọn ngày sinh" format="DD/MM/YYYY">
          <template #label> Ngày sinh </template>
        </DatePicker>
        <div style="color:#0066cc">Ngày sinh đã chọn: <b>{{ data.birthday }}</b></div>

        <div><b>DatePicker - Định dạng chữ</b></div>
        <DatePicker
          v-model="data.birthdayText"
          placeholder="DD tháng MM năm YYYY"
          format="DD [tháng] MM [năm] YYYY"
        />
        <div style="color:#0066cc">Giá trị: <b>{{ data.birthdayText }}</b></div>

        <div><b>DatePicker (datetime) - Giờ hẹn</b></div>
        <DatePicker v-model="data.appointment" placeholder="Chọn ngày giờ"
          format="HH:mm DD/MM/YYYY" :minute-step="15"
        />
        <div style="color:#0066cc">Ngày giờ đã chọn: <b>{{ data.appointment }}</b></div>

        <div><b>Checkbox - Size</b></div>
        <Checkbox v-model="data.sizeTest" value="small"  beforeText="[sm]" afterText="Small" size="sm" />
        <Checkbox v-model="data.sizeTest" value="medium" beforeText="[md]" afterText="Medium" size="md" />
        <Checkbox v-model="data.sizeTest" value="large"  beforeText="[lg]" afterText="Large" size="lg" />
        <Checkbox v-model="data.sizeTest" value="xlarge" beforeText="[xl]" afterText="X-Large" size="xl" />

        <div style="color:#0066cc">Giá trị: <b>{{ data.sizeTest }}</b></div>

        <div><b>Paint - Chữ ký</b></div>
        <Paint style="width:400px; height:150px;" v-model="data.signature"
          src="https://fastly.picsum.photos/id/237/250/250.jpg?hmac=tNmO3YWXALG9JM81cghI9nflo3dWc3e5vlNsf_jmKWw"
        />
        <div v-if="data.signature">
          <div>Ảnh đã lưu:</div>
          <img :src="data.signature" alt="signature" style="max-width:200px;border:1px solid #ccc;" />
        </div>

        <div><b>Signature - Ký</b></div>
        <Signature code="BacSi" />
      </PageA4>
      `,
      context: {
        log: console.log,
        config: {
          TenBenhVien: "BV ĐK H. PHÚ XUYÊN",
        },
        "hsBenhAn": {
          "sHoTenBenhNhan": null,
          "sDiaChi": null,
          "sNgaySinh": "0001-01-01T00:00:00",
          "sTenLoaiBenhAn": null,
          "HoTenBN": null,
          "Domain": "01821",
          "IdLoaiBenhAn": "54970a97-9f69-47e6-9df0-fedb94160c6c",
          "IdBenhNhan": "28615616-c30a-4d25-9137-439004e9ae1e",
          "Ma": "BA25006097",
          "MaBV": "BA25006097",
          "SoVaoVien": "0624",
          "SoVaoKhoa": null,
          "MaYTe": "10182125005781",
          "HoTenBenhNhan": "Đỗ Như Muốn",
          "DiaChi": "TK PHÚ MỸ, Thị trấn Phú Xuyên, Huyện Phú Xuyên, Thành phố Hà Nội",
          "NgaySinh": "1977-03-05T00:00:00",
          "SoBHYT": "BT2010123881042",
          "NgayHieuLucBH": "2025-01-01T00:00:00",
          "NgayHetHanBH": "2025-12-31T00:00:00",
          "BenhAnChiTietObj": {
            "SoNgayDieuTriKhoaDau": 10,
            "ListIcdRaVienBenhKemTheo": [],
            "ListBenhYHCT": [],
            "IcdNoiChuyenDen": null,
            "IcdNoiChuyenDenMa": null,
            "IcdNoiChuyenDenTen": "",
            "IcdKKBCC": "a5efd89c-d049-445c-83b1-93de9213642c",
            "IcdKKBCCMa": "J18",
            "IcdKKBCCTen": "Viêm phổi, tác nhân không xác định",
            "IcdVaoKhoaDieuTri": null,
            "IcdVaoKhoaDieuTriMa": null,
            "IcdVaoKhoaDieuTriTen": "",
            "IcdRaVienBenhChinh": "a5efd89c-d049-445c-83b1-93de9213642c",
            "IcdRaVienBenhChinhMa": "J18",
            "IcdRaVienBenhChinhTen": "Viêm phổi, tác nhân không xác định",
            "IcdTruocPT": null,
            "IcdTruocPTMa": null,
            "IcdTruocPTTen": "",
            "IcdSauPT": null,
            "IcdSauPTMa": null,
            "IcdSauPTTen": "",
            "CoSoTrucThuoc": "SỞ Y TẾ HÀ NỘI",
            "TenBenhVien": "BV ĐK H. PHÚ XUYÊN",
            "TenViTriGDPhieuTTHC": "Giám đốc",
            "LyDoVaoVien": "hO đờm, khó thở ",
            "QuaTrinhBenhLy": "Cách vào viện vài ngày, bệnh nhân ở nhà xuất hiện ho đờm, tức ngực, khó thở, mệt mỏi. vào viện",
            "TienSuBenh_BanThan": "khoẻ mạnh ",
            "TienSuBenh_GiaDinh": "Khoẻ mạnh ",
            "KhamBenh_ToanThan": "Bệnh nhân tỉnh, tiếp xúc tốt \\nDa, niêm mạc kém hồng \\nThể trạng trung bình\\nKhông phù, không XHDD\\nTuyến giáp không to, hạch ngoại vi không sờ thấy ",
            "KhamBenh_TuanHoan": "Chưa phát hiện tiếng tim bệnh lý \\nT1, T2 đều rõ ",
            "KhamBenh_HoHap": "Phổi rales ẩm rải rác 2 bên phổi ",
            "KhamBenh_TieuHoa": "Bụng mềm, không chướng ",
            "KhamBenh_ThanKinh": "Chưa ghi nhận bất thường",
            "KhamBenh_CoXuongKhop": "Chưa ghi nhận bất thường",
            "KhamBenh_TaiMuiHong": "Chưa ghi nhận bất thường",
            "KhamBenh_RangHamMat": "Chưa ghi nhận bất thường",
            "KhamBenh_TietNieu": "Chưa ghi nhận bất thường",
            "KhamBenh_xetNghiemCLSCanLam": "Tổng pttb máu, SHM, XQ ngực ",
            "KhamBenh_tomTatBenhAn": "Bệnh nhân ở nhà xuất hiện ho, khó thở, Qua hỏi, khám tháy \\nHC nhiễm trùng (+)\\nTim đều \\nBụng mềm \\nPhổi rales ẩm, rales nổ ",
            "KhamBenh_TienLuong": "Khá",
            "KhamBenh_HuongDieuTri": "nội khoa ",
            "KhamBenh_Mat": "Chưa ghi nhận bất thường",
            "KhamBenh_NoiTiet": "Chưa ghi nhận bất thường",
            "Mach": "82",
            "NhietDo": "36.8",
            "HuyetApToiDa": "120",
            "HuyetApToiThieu": "70",
            "NhipTho": "20"
          },
          "BenhNhan": {
            "Domain": "01821",
            "Ma": "2100052345",
            "MaTiemChung": null,
            "CMND": null,
            "HoTen": "Đỗ Như Muốn",
            "HoTenKoDau": "do nhu muon",
            "GioiTinh": false,
            "NgaySinh": "1977-03-05T00:00:00",
            "IsNamSinh": false,
            "DiaChi": "TK PHÚ MỸ, Thị trấn Phú Xuyên, Huyện Phú Xuyên, Thành phố Hà Nội",
            "SoNha": "TK PHÚ MỸ",
            "TenXa": "Thị trấn Phú Xuyên",
            "ThonPho": null,
            "IdQuocTich": "e28c648f-be25-4597-90ce-7ec40031625e",
            "MaQuocTich": "000",
            "TenQuocTich": "Việt Nam",
            "IdTinhThanh": "746df3a2-6488-4cd4-8ec9-0fc21d497ca9",
            "TenTinh": "Thành phố Hà Nội",
            "IdQuanHuyen": "f6e9ca34-c945-4a3d-9ab9-e5dbe28b23f9",
            "TenHuyen": "Huyện Phú Xuyên",
            "IdXaPhuong": "730efe32-15ed-433a-ba26-ddece4593d61",
            "TenXaPhuong": null,
            "TenDanToc": "Kinh",
            "IdDanToc": "0ce19546-7d3c-4cb9-b328-4fb6bed417d2",
            "IdNhomMau": null,
            "IdNgheNghiep": "f39d6834-74a5-4aac-8603-2a26ab002023",
            "MaNgheNghiep": "00000",
            "TenNgheNghiep": "Khác",
            "NoiLamViec": null,
            "MaSoThue": null,
            "DienThoai": "00000000000",
            "MaYTe": "0123881042",
            "Ten": "muốn",
            "GhiChu": null,
            "DmBHYT": null,
            "SoBHYT": null,
            "NgayHieuLuc": "0001-01-01T00:00:00",
            "NgayHetHan": "0001-01-01T00:00:00",
            "NoiDKBD": null,
            "DiaChiBH": null,
            "NgayTao": "2021-11-11T13:59:45.633",
            "SearchValue": "2100052345;Đỗ Như Muốn;do nhu muon;;;00000000000;",
            "DiaChiNoiLamViec": null,
            "MaSoThueCongTy": null,
            "NgayBatDTARV": null,
            "NgayBatDTARVTaiVien": null,
            "MaNhomARV": null,
            "MaARV": null,
            "MaNhomBN": null,
            "TenNhomBN": null,
            "NgayKhangDinhARV": null,
            "NoiKhangDinh": null,
            "Email": null,
            "GhiChuDonTiep": null,
            "IdNguonDonTiep": "00000000-0000-0000-0000-000000000000",
            "IdThongTinHanhChinh": "00000000-0000-0000-0000-000000000000",
            "MaDanToc": "01",
            "IsNgaySinhKhongXD": false,
            "IsGioiTinhKhongXD": false,
            "IdBenhAn": null,
            "CMNDNgayCap": null,
            "CMNDNoiCap": null,
            "MaHuyen": "280",
            "MaTinh": "01",
            "MaXaPhuong": "10273",
            "ListPhieuKham": null,
            "IsDonTiepCCCD": false,
            "Id": "28615616-c30a-4d25-9137-439004e9ae1e",
            "Active": true,
            "State": 0,
            "AuditUserInfo": null
          },
          "DmBHYT": {
            "Domain": "01821",
            "SoBHYT": "BT2010123881042",
            "NgayDangKy": "2025-01-01T00:00:00",
            "NgayHieuLuc": "2025-01-01T00:00:00",
            "NgayHetHan": "2025-12-31T00:00:00",
            "NoiDKBD": "01M52",
            "TenBenhVienDKBD": "Trạm y tế thị trấn Phú Xuyên (TTYT h. Phú Xuyên)",
            "DiaChi": "TT Phú Xuyên - H. Phú Xuyên",
            "IdBenhNhan": "28615616-c30a-4d25-9137-439004e9ae1e",
            "MaKV": null,
            "IsBHYT5Nam": false,
            "NgayDu5Nam": "2019-01-01T00:00:00",
            "HoTen": null,
            "NgaySinh": null,
            "GioiTinh": null,
            "IsMaTheMoi": false,
            "Nhom": "2",
            "MaHoSo": null,
            "MaSoBHXH": "0123881042",
            "NgayKham": null,
            "Id": "0ba288a5-69d3-494f-980b-87c12fad81f5",
            "Active": true,
            "State": 0,
            "AuditUserInfo": null
          },
          "TenBacSi": "Hoàng Đức Tuyên",
          "MaBacSiDT": "000475/HNO-GPHN",
          "ChucDanhBacSiDT": "Bs",
          "MaDoanPTTT": null,
          "IdBenhVien": "5f2a991f-a74a-4d71-b183-5d18919d0957",
          "IdKhoaKham": "40ae8ca6-eca8-490c-8362-1c4ee1a97f3c",
          "IdPhongKham": "5e37bb1d-be28-4dd7-a249-970e7635a698",
          "IdKhoaBanDau": "40ae8ca6-eca8-490c-8362-1c4ee1a97f3c",
          "TenKhoaBanDau": "Khoa Cấp cứu",
          "MaKhoaBanDau": "K02.1",
          "NgayVaoKhoa": "2025-04-15T19:11:00",
          "NgayChuyenVaoVien": "2025-04-15T19:08:00",
          "IsNamNoiTru": true,
          "IsCapCuu": true,
          "MaBenhVienTruoc": null,
          "TenBenhVienTruoc": null,
          "ChanDoanTuyenDuoi": null,
          "Tuoi": "48",
          "DoiTuong": "BHYT",
          "IsBHYT": true,
          "HoTenNguoiNha": "Con Lê Hộng Nhung",
          "DiaChiNguoiNha": "Cùng Địa chỉ",
          "DienThoaiNguoiNha": "0988766412",
          "NgayVaoVien": "2025-04-15T18:19:00",
          "IsCongVienChuc": false,
          "IsThanhThi": false,
          "LoaiVaoVien": "CAP_CUU",
          "NoiGioiThieu": null,
          "LanVaoVienDoBenhNay": null,
          "ChuyenVien": null,
          "IdVienChuyenToi": null,
          "NgayRaVien": null,
          "LoaiRaVien": null,
          "TongSoNgayDieuTri": null,
          "SoPhong": "Phòng 109",
          "SoGiuong": "T014",
          "ChanDoan": "Viêm phổi, tác nhân không xác định",
          "ChanDoanPT": null,
          "ChanDoanCuaNoiGioiThieu": "Viêm phổi",
          "IcdNoiChuyenDen": null,
          "IcdNoiChuyenDenMa": null,
          "IcdNoiChuyenDenTen": null,
          "IcdKKBCC": "a5efd89c-d049-445c-83b1-93de9213642c",
          "IcdKKBCCMa": "J18",
          "IcdKKBCCTen": "Viêm phổi, tác nhân không xác định",
          "IcdVaoKhoaDieuTri": null,
          "IdBacSiDieuTri": "8a5fd499-2582-4c07-9bb5-a1efedd7f363",
          "IcdVaoKhoaDieuTriMa": null,
          "IcdVaoKhoaDieuTriTen": null,
          "CoThuThuat": true,
          "CoPhauThuat": false,
          "SoNgayDieuTriSauPT": null,
          "SoLanPTT": null,
          "IcdTruocPT": null,
          "IcdTruocPTMa": null,
          "IcdTruocPTTen": null,
          "IcdSauPT": null,
          "IcdSauPTMa": null,
          "IcdSauPTTen": null,
          "IcdRaVienBenhChinh": null,
          "IcdRaVienBenhChinhMa": null,
          "IcdRaVienBenhChinhTen": null,
          "DsIcdRaVienBenhKemTheo": "",
          "ListIcdRaVienBenhKemTheo": null,
          "CoTaiBien": true,
          "CoBienChung": true,
          "NguyenNhanTBBC": null,
          "NguyenNhanBenhChinh": null,
          "KetQuaDieuTri": null,
          "GiaiPhauBenh": null,
          "GioTuVong": null,
          "NguyenNhanTuVong": null,
          "ThoiGianTuVong": null,
          "IcdTuVong": null,
          "IcdTuVongMa": null,
          "IcdTuVongTen": null,
          "IcdKhamNghiemTuThi": null,
          "IcdKhamNghiemTuThiMa": null,
          "IcdKhamNghiemTuThiTen": null,
          "CoKhamNghiemTuThi": false,
          "IdTrangThaiHoSo": "82394e05-dd1b-4c6f-9501-24239dcd0c8d",
          "IdTrangThaiKy": null,
          "MaTrangThaiKy": null,
          "IsDongBenhAn": false,
          "SoLuuTru": null,
          "NgayLuuTru": null,
          "PhuongPhapDieuTri": null,
          "PhuongPhapPT": null,
          "LoiDanBacSi": null,
          "PhauThuatVienChinh": null,
          "NgayInGiayRaVien": null,
          "IdGiayRaVien": null,
          "IdGiayRaVienMa": null,
          "IdGiayRaVienTen": null,
          "IdDefProcinst": "ae660716-a4c4-4f66-be7a-bba0fbb7df76",
          "CanNang": 55,
          "TrangThaiHoSo": "DieuTri",
          "TongTienConLai": 0,
          "TongTienTamUng": 0,
          "TrangThaiThuoc": null,
          "IdLoaiLuuTru": null,
          "IdDoanPhauThuatTinhThuong": null,
          "IdPhanLoaiBenh": null,
          "IsDaThanhToan": false,
          "MaLoaiLuuTru": null,
          "TenLoaiLuuTru": null,
          "NhomMauRH": null,
          "NhomMauTen": null,
          "IsMienGiam": false,
          "IsThatThu": false,
          "IsCanhBaoRaVien": false,
          "IsRaVien": false,
          "IsTinhThuong": false,
          "IsBenhNhanARV": false,
          "IsChotBangKe": false,
          "IsBNThanhUy": false,
          "ViTriLuuTru": null,
          "ThuMucHoSoGoc": "\\Content\\HSDT\\2025\\4\\BA25006097",
          "IdThongTinHanhChinh": "353fb6d4-81ad-45ef-ba65-e5458d47ba9f",
          "IsBADT": false,
          "IsTEKT": false,
          "IsKhoaThuNgan": false,
          "IsThanhToanTungLanKham": false,
          "MauPhieuRaVien": null,
          "MaCDC": null,
          "ChanDoanVaoVien": "Viêm phổi",
          "SuatAn": null,
          "TrangThaiDeXuat": null,
          "IsMenuBADTMoi": true,
          "NgayDeXuatRaVien": null,
          "IsBenhAnTTTheoDot": false,
          "DSIcdBenhYHCT": "",
          "SoGiayChuyenTuyen": null,
          "MaLoaiKCB": "03",
          "ListBenhYHCT": null,
          "IdChotGuiBH": null,
          "MaDinhChiThai": null,
          "NguyenNhanDinhChiThai": null,
          "ThoiGianDinhChiThai": null,
          "TuoiThai": null,
          "IcdBenhYHCTMa": null,
          "IcdBenhYHCTTen": null,
          "ChieuCao": 170,
          "HuongDieuTri": null,
          "ISangLocDD": 0,
          "GhiChuTrangThaiSangLocDD": null,
          "DoThanhThanCrea": null,
          "KetQuaCreatinin": null,
          "IsDaXuatPDF": false,
          "TenKhoaKham2": null,
          "TenLoaiBenhAn": "CC - HSTC - CÐ",
          "MaLoaiBenhAn": "CC01",
          "TenKhoaKham": "Khoa Cấp cứu",
          "MaBenhNhan": "2100052345",
          "LoaiBenhAn": {
            "Ma": "CC01",
            "Ten": "CC - HSTC - CÐ",
            "PhieuVaoVien": "PhieuKhamVaoVien",
            "DSKhoaKham": null,
            "ChuYObj": "",
            "UuTien": "5",
            "IsThanhToanTungLanKham": false,
            "LoaiHienThiBA": 2,
            "IsBenhAnTTTheoDot": false,
            "BiaBenhAn": "bia-benh-an",
            "Id": "54970a97-9f69-47e6-9df0-fedb94160c6c",
            "Active": true,
            "State": 0,
            "AuditUserInfo": null
          },
          "KhoaKham": {
            "Code": "K02.1",
            "Name": "Khoa Cấp cứu",
            "Address": "Khoa Cấp cứu",
            "Domain": "01821",
            "IdHospital": "5f2a991f-a74a-4d71-b183-5d18919d0957",
            "TenBenhVien": null,
            "IdParent": null,
            "TenCha": null,
            "Level": 0,
            "IdLoai": "ab1f816c-af94-4fdf-a153-1234cf111141",
            "TenLoai": null,
            "sMaLoai": null,
            "sMaLoaiLever": null,
            "UuTien": 10,
            "IdKho": "f38c90ad-ff6e-4ffe-9437-07a9d8daa6b0",
            "TenKho": null,
            "GhiChu": null,
            "MaBH": "K02",
            "MaLoaiBenhAn": "CC01",
            "MaLIS": null,
            "IsSuDungBADT": false,
            "MauPhieuRaVien": null,
            "IdPMVBNS": null,
            "IsDuyetDonNgoaiTru": false,
            "IdCongKhamBanDau": "a9e068e7-1df4-4711-928e-30e9ed18502b",
            "CongKham": null,
            "Id": "40ae8ca6-eca8-490c-8362-1c4ee1a97f3c",
            "Active": true,
            "State": 0,
            "AuditUserInfo": null
          },
          "DSChuyenKhoa": [
            {
              "Domain": "01004",
              "IdBenhAn": "d8f5a0b6-a899-4f1e-85a1-9a7c88bc48a1",
              "IdKhoaKham": "279e383d-7623-41df-a499-553b4b4d196e",
              "IdKhoaTruoc": "866315ab-f814-460e-9364-f8e3c3cb15a4",
              "TenKhoaKham": "Covid nhẹ 1",
              "MaKhoa": "K11.2",
              "IdNguoiTao": "649565c9-1a00-4b3a-9219-d52621eefe39",
              "NgayChuyen": "2025-05-06T17:19:39.767",
              "GhiChu": null,
              "SoNgayDieuTri": 60.00,
              "Id": "0ff6c3ac-6dfa-4c76-8074-5984f25512f2",
              "Active": true,
              "State": 0,
              "AuditUserInfo": null
            },
            {
              "Domain": "01004",
              "IdBenhAn": "d8f5a0b6-a899-4f1e-85a1-9a7c88bc48a1",
              "IdKhoaKham": "866315ab-f814-460e-9364-f8e3c3cb15a4",
              "IdKhoaTruoc": "279e383d-7623-41df-a499-553b4b4d196e",
              "TenKhoaKham": "Lão",
              "MaKhoa": "KL",
              "IdNguoiTao": "649565c9-1a00-4b3a-9219-d52621eefe39",
              "NgayChuyen": "2025-05-06T17:39:15.923",
              "GhiChu": null,
              "SoNgayDieuTri": null,
              "Id": "632b8c01-21b3-45ae-babd-1dee9ecdde52",
              "Active": true,
              "State": 0,
              "AuditUserInfo": null
            }
          ],
          "DSHSChiDinhSuatAn": null,
          "Id": "3575957b-4948-4a90-878f-b0a6b472a8a8",
          "Active": true,
          "State": 0,
          "AuditUserInfo": null
        },
        data: {
          name: "duynnz",
          age: "18",
          tags: ['vue', 'typescript' ],
          category: 'tech',
          gender: 'male',
          sizeTest: 'large',
          birthday: '',
          birthdayText: '',
          appointment: '',
          signature: ''
        },
        categoryList: [
          { id: 'tech', name: 'Công Nghệ' },
          { id: 'business', name: 'Kinh Doanh' },
          { id: 'other', name: 'Khác' }
        ],
        tagList: [
          { value: 'vue', label: 'Vue' },
          { value: 'typescript', label: 'TypeScript' },
          { value: 'tailwind', label: 'Tailwind' },
          { value: 'react', label: 'React' }
        ],
        contextItems: [
          { id: 1, label: 'Hàng số 1' },
          { id: 2, label: 'Hàng số 2' },
          { id: 3, label: 'Hàng số 3' }
        ],

        // required functions, data for Signature component
        MauHoSo: 'HSThongTinBenhAn',
        openSignatureHistory: (code: string) => {
          console.log('openSignatureHistory', code);
        },
        handleSign: (code: string) => {
          console.log('handleSign', code);
        },
        "signature": {
          "BacSi": [
            {
              "Domain": "01004",
              "IdBenhAn": "9e3b5531-bc6d-4486-8b38-7777c2a3ffbc",
              "IdHoSo": "9e3b5531-bc6d-4486-8b38-7777c2a3ffbc",
              "MauHoSo": "HSThongTinBenhAn",
              "ViTri": "BacSi",
              "IdNguoiKy": "649565c9-1a00-4b3a-9219-d52621eefe39",
              "NguoiKy": "Nguyễn Thị Tĩnh Tĩnh",
              "IdChuKy": "2545fb0d-cdb5-4b9a-b416-66aa4dda6b54",
              "AnhChuKy": "\\Content\\folderUploadChuKy\\ChuKy\\202412250142422545fb0d-cdb5-4b9a-b416-66aa4dda6b54.png",
              "ThongTinChuKy": "Chữ ký nội bộ",
              "NgayKy": "2025-04-14T14:07:16.937",
              "FileXML": "\\Content\\HSDT\\2025\\3\\BA25000131\\20250414020716_BA25000131_HSThongTinBenhAn_1.xml",
              "LanKySo": 1,
              "IsChuKyNhay": false,
              "IdNguoiHuy": "649565c9-1a00-4b3a-9219-d52621eefe39",
              "NguoiHuy": "Nguyễn Thị Tĩnh Tĩnh",
              "NgayHuy": "2025-04-14T14:07:59.53",
              "Active": false,
              "IsChuKySo": false,
              "IsChuKyVietTay": false,
              "IdDiKemViTriKy": "0f4d0816-49f5-4d9b-b75d-374586fe44fc",
              "IdHSDiKem": "b8b3bf57-5ef6-4f07-83b3-c40f0dde700d",
              "Id": "9b1c86e3-e5cc-4b57-82ae-aae439cc7855",
            },
            {
              "Domain": "01004",
              "IdBenhAn": "9e3b5531-bc6d-4486-8b38-7777c2a3ffbc",
              "IdHoSo": "9e3b5531-bc6d-4486-8b38-7777c2a3ffbc",
              "MauHoSo": "HSThongTinBenhAn",
              "ViTri": "BacSi",
              "IdNguoiKy": "649565c9-1a00-4b3a-9219-d52621eefe39",
              "NguoiKy": "Nguyễn Thị Tĩnh Tĩnh",
              "IdChuKy": "2545fb0d-cdb5-4b9a-b416-66aa4dda6b54",
              "AnhChuKy": "\\Content\\folderUploadChuKy\\ChuKy\\202412250142422545fb0d-cdb5-4b9a-b416-66aa4dda6b54.png",
              "ThongTinChuKy": "Chữ ký nội bộ",
              "NgayKy": "2025-04-14T14:08:07.373",
              "FileXML": "\\Content\\HSDT\\2025\\3\\BA25000131\\20250414020807_BA25000131_HSThongTinBenhAn_1.xml",
              "LanKySo": 1,
              "IsChuKyNhay": false,
              "Active": true,
              "IsChuKySo": false,
              "IsChuKyVietTay": false,
              "IdDiKemViTriKy": "0f4d0816-49f5-4d9b-b75d-374586fe44fc",
              "IdHSDiKem": "b8b3bf57-5ef6-4f07-83b3-c40f0dde700d",
              "Id": "f074d6af-71e3-4c4c-8221-5361751459ec",
            }
          ]
        }
      }
    }
  }
}
</script>
