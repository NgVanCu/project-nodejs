# Hướng dẫn sử dụng chức năng Admin - Web Bán Sách

> **Base URL:** `http://localhost:8080/api`  
> **Tool gợi ý:** Postman, Thunder Client, hoặc bất kỳ HTTP client nào

---

## Mục lục
1. [Tạo tài khoản Admin](#1-tạo-tài-khoản-admin)
2. [Đăng nhập tài khoản Admin](#2-đăng-nhập-tài-khoản-admin)
3. [Thêm sách mới](#3-thêm-sách-mới)
4. [Cập nhật sách](#4-cập-nhật-sách)
5. [Xóa sách](#5-xóa-sách)
6. [Khôi phục sách đã xóa](#6-khôi-phục-sách-đã-xóa)
7. [Lấy danh sách sách](#7-lấy-danh-sách-sách)

---

## 1. Tạo tài khoản Admin

Tài khoản mặc định sau khi đăng ký có `role: "user"`. Để có quyền admin, cần **vào MongoDB** và đổi trường `role` thành `"admin"` thủ công.

### Bước 1 — Đăng ký tài khoản thường

**POST** `/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Admin",
  "email": "admin@bookstore.com",
  "password": "123456",
  "phone": "0901234567",
  "address": "Hà Nội"
}
```

**Response thành công (201):**
```json
{
  "message": "Đăng ký thành công",
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Admin",
    "email": "admin@bookstore.com",
    "role": "user"
  }
}
```

### Bước 2 — Đổi role thành admin trong MongoDB

Chạy lệnh sau trong MongoDB Shell hoặc MongoDB Compass:

```js
db.users.updateOne(
  { email: "admin@bookstore.com" },
  { $set: { role: "admin" } }
)
```

---

## 2. Đăng nhập tài khoản Admin

**POST** `/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@bookstore.com",
  "password": "123456"
}
```

**Response thành công (200):**
```json
{
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "665f1a2b3c4d5e6f7a8b9c0d",
      "name": "Admin",
      "email": "admin@bookstore.com",
      "role": "admin"
    }
  }
}
```

> **Quan trọng:** Lưu lại `token` từ response. Token này cần gửi kèm ở tất cả các request yêu cầu quyền admin (thêm, sửa, xóa sách).
>
> Token có hiệu lực trong **1 ngày**.

---

## 3. Thêm sách mới

> Yêu cầu: Token Admin

**POST** `/api/book`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**

| Field         | Kiểu     | Bắt buộc | Mô tả                              |
|---------------|----------|----------|------------------------------------|
| `name`        | text     | ✅        | Tên sách                           |
| `price`       | number   | ✅        | Giá bán (VNĐ)                      |
| `originalPrice` | number | ❌        | Giá gốc (VNĐ)                      |
| `author`      | text     | ✅        | Tên tác giả                        |
| `quantity`    | number   | ✅        | Số lượng tồn kho                   |
| `description` | text     | ❌        | Mô tả sách                         |
| `category`    | text     | ❌        | ObjectId của danh mục              |
| `thumbnail`   | file     | ✅        | Ảnh bìa chính (1 file)             |
| `slider`      | file     | ❌        | Ảnh chi tiết (có thể nhiều file)   |

**Ví dụ với Postman:**
1. Chọn method **POST**, URL: `http://localhost:8080/api/book`
2. Tab **Headers**: thêm `Authorization: Bearer eyJhbGci...`
3. Tab **Body** → chọn **form-data**
4. Điền các trường như bảng trên, với `thumbnail` chọn loại **File** và upload ảnh

**Response thành công (201):**
```json
{
  "success": true,
  "message": "Thêm Book thành công",
  "data": {
    "_id": "665f1b2c3d4e5f6a7b8c9d0e",
    "name": "Lập Trình Node.js",
    "price": 150000,
    "originalPrice": 200000,
    "author": "Nguyễn Văn A",
    "quantity": 100,
    "description": "Sách học Node.js từ cơ bản đến nâng cao",
    "thumbnail": "/images/book/thumbnail_123.jpg",
    "slider": [],
    "sold": 0,
    "rating": 0,
    "createdAt": "2026-04-14T10:00:00.000Z"
  }
}
```

**Lỗi thường gặp:**

| Mã lỗi | Nguyên nhân                         |
|--------|-------------------------------------|
| 401    | Không có token / chưa đăng nhập     |
| 403    | Token không phải admin              |
| 400    | Thiếu file ảnh thumbnail            |

---

## 4. Cập nhật sách

> Yêu cầu: Token Admin

**PUT** `/api/book/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Params:**
- `:id` — ObjectId của sách cần cập nhật (lấy từ response khi tạo hoặc lấy danh sách)

**Body (form-data):** Tương tự như thêm sách, chỉ gửi các trường cần thay đổi.

**Ví dụ URL:** `http://localhost:8080/api/book/665f1b2c3d4e5f6a7b8c9d0e`

**Response thành công (200):**
```json
{
  "success": true,
  "message": "Cập nhật sách thành công",
  "data": { ... }
}
```

---

## 5. Xóa sách

> Yêu cầu: Token Admin  
> Đây là **soft delete** — sách bị ẩn nhưng vẫn còn trong database (có thể khôi phục).

**DELETE** `/api/book/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Ví dụ URL:** `http://localhost:8080/api/book/665f1b2c3d4e5f6a7b8c9d0e`

**Response thành công (200):**
```json
{
  "success": true,
  "message": "Xóa Book thành công",
  "data": { ... }
}
```

**Lỗi thường gặp:**

| Mã lỗi | Nguyên nhân                     |
|--------|---------------------------------|
| 401    | Không có token / chưa đăng nhập |
| 403    | Token không phải admin          |
| 404    | Không tìm thấy sách với id này  |

---

## 6. Khôi phục sách đã xóa

> Yêu cầu: Token Admin

**PATCH** `/api/book/:id/restore`

**Headers:**
```
Authorization: Bearer <token>
```

**Ví dụ URL:** `http://localhost:8080/api/book/665f1b2c3d4e5f6a7b8c9d0e/restore`

**Response thành công (200):**
```json
{
  "success": true,
  "message": "Restore Book thành công",
  "data": { ... }
}
```

---

## 7. Lấy danh sách sách

> Không yêu cầu đăng nhập

**GET** `/api/book`

**Query params (tùy chọn):**

| Param      | Mô tả                          |
|------------|--------------------------------|
| `page`     | Số trang (mặc định: 1)         |
| `limit`    | Số sách mỗi trang (mặc định: 10)|
| `name`     | Tìm kiếm theo tên sách         |
| `category` | Lọc theo danh mục (ObjectId)   |

**Ví dụ:** `http://localhost:8080/api/book?page=1&limit=10`

**Response thành công (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách sách thành công",
  "data": { ... }
}
```

---

## Tổng hợp các endpoint Admin

| Method   | Endpoint                  | Quyền   | Chức năng              |
|----------|---------------------------|---------|------------------------|
| POST     | `/api/auth/login`         | Public  | Đăng nhập              |
| POST     | `/api/auth/register`      | Public  | Đăng ký tài khoản      |
| POST     | `/api/book`               | Admin   | Thêm sách mới          |
| PUT      | `/api/book/:id`           | Admin   | Cập nhật sách          |
| DELETE   | `/api/book/:id`           | Admin   | Xóa sách (soft delete) |
| PATCH    | `/api/book/:id/restore`   | Admin   | Khôi phục sách đã xóa  |
| GET      | `/api/book`               | Public  | Lấy danh sách sách     |
| GET      | `/api/book/:id`           | Public  | Lấy chi tiết 1 sách    |
| GET      | `/api/user`               | Admin   | Lấy danh sách user     |
| DELETE   | `/api/user/:id`           | Admin   | Xóa user               |

---

## Cách gửi token trong Postman

1. Đăng nhập → copy giá trị `token` từ response
2. Ở request cần quyền admin, vào tab **Headers**
3. Thêm:
   - **Key:** `Authorization`
   - **Value:** `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (thay bằng token thực)
