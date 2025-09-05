# Pathwise: Hệ Thống Quản Lý Lộ Trình Học Tập & Gợi Ý Khóa Học

Pathwise là nền tảng API và giao diện quản lý học tập, gợi ý khóa học, mapping kỹ năng, phản hồi và quản trị người dùng dành cho doanh nghiệp hoặc tổ chức giáo dục. Hệ thống tích hợp AI, Milvus, PostgreSQL và ReactJS để mang lại trải nghiệm học tập cá nhân hóa, hiện đại.

---

## 🚀 Tính Năng Nổi Bật

- **Xác thực & Phân quyền:** Đăng nhập, xác thực JWT, phân quyền theo vai trò (employee, manager, hr, admin).
- **Gợi ý khóa học AI:** Đề xuất khóa học phù hợp dựa trên kỹ năng còn thiếu, mục tiêu nghề nghiệp và embedding AI.
- **Dashboard học tập:** Tổng hợp mục tiêu, khóa học đề xuất, mapping sang course_id.
- **Thiết lập mục tiêu:** Cập nhật mục tiêu nghề nghiệp, tự động cập nhật gợi ý khóa học.
- **Mapping kỹ năng:** Trả về mapping giữa các khóa học đã học và kỹ năng đạt được.
- **Feedback khóa học:** Nhận và lưu phản hồi của người dùng cho từng khóa học.
- **Quản lý & nhúng dữ liệu Coursera:** Crawl, lưu trữ, embedding và mapping dữ liệu khóa học từ Coursera.
- **Tích hợp Milvus & PostgreSQL:** Lưu trữ embedding, dữ liệu khóa học, nhân viên, kỹ năng.

---

## 🗂️ Cấu Trúc Dự Án

```
Pathwise/
├── main.py
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env
├── access_control/         # Xác thực, phân quyền, quản lý user/role
├── api/                   # Định nghĩa các endpoint RESTful
├── apps/                  # Logic nghiệp vụ cho từng module
├── core/                  # Cấu hình hệ thống
├── database/              # Kết nối, truy vấn PostgreSQL & Milvus
├── schemas/               # Định nghĩa schema Pydantic
├── front_end/             # ReactJS frontend
└── README.md
```

---

## ⚡️ Khởi Động Nhanh Với Docker Compose

### 1. Chuẩn Bị `.env`
Tạo file `.env` ở thư mục gốc, ví dụ:
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=pathwise
SECRET_KEY=your_secret_key
```

### 2. Build & Chạy Toàn Bộ Hệ Thống
```bash
docker-compose up --build
```

### 3. Truy Cập Ứng Dụng
- **Backend API:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Frontend:** [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Phát Triển & Debug

- **Backend:** Sửa file Python, container backend tự reload (nhờ `--reload`).
- **Frontend:** Sửa file trong `front_end/src`, frontend tự reload.
- **Xem log backend:** `docker logs -f pathwise-backend`
- **Xem log frontend:** `docker logs -f pathwise-frontend`
- **Vào bash backend:** `docker exec -it pathwise-backend bash`
- **Vào psql:** `docker exec -it pathwise-db psql -U postgres -d pathwise`

---

## 🧩 Các Endpoint Chính

| Chức năng                | Method & Endpoint                  | Mô tả ngắn gọn                      |
|--------------------------|------------------------------------|-------------------------------------|
| Đăng nhập                | `POST /auth/token`                 | Lấy JWT token                       |
| Gợi ý khóa học           | `POST /ai/recommend-courses`       | Nhập user_id, trả về khóa học phù hợp|
| Dashboard học tập        | `GET /user/learning-dashboard`     | Trả về mục tiêu, khóa học, course_id |
| Thiết lập mục tiêu       | `POST /goal/set`                   | Cập nhật mục tiêu, refresh gợi ý     |
| Feedback khóa học        | `POST /feedback`                   | Gửi feedback cho khóa học            |
| Mapping kỹ năng          | `GET /skills-mapping`              | Trả về mapping khóa học - kỹ năng    |
| Cập nhật Coursera        | `GET /external-courses`            | Crawl, embedding dữ liệu Coursera    |

---

## 🏗️ Công Nghệ Sử Dụng

- **Backend:** FastAPI, SQLAlchemy, Milvus, PostgreSQL, Pydantic, python-jose, Uvicorn
- **Frontend:** ReactJS, Material UI (MUI)
- **Vector DB:** Milvus
- **Database:** PostgreSQL
- **AI:** Google Generative AI (embedding, mapping kỹ năng)

---

## 📁 Một Số File Quan Trọng

- `main.py`: Khởi tạo FastAPI và khai báo router.
- `api/recommendation.py`: Endpoint gợi ý khóa học.
- `api/learning_dashboard.py`: Endpoint dashboard học tập.
- `api/goal.py`: Endpoint thiết lập mục tiêu.
- `api/feedback.py`: Endpoint gửi feedback.
- `api/skills_mapping.py`: Endpoint mapping kỹ năng.
- `api/external_courses.py`: Endpoint cập nhật dữ liệu Coursera.
- `apps/recommendation/pipeline.py`: Pipeline gợi ý khóa học.
- `apps/external_courses/coursera.py`: Crawl dữ liệu Coursera.
- `core/config.py`: Quản lý cấu hình hệ thống.

---

## 💡 Đóng Góp & Phát Triển

- Fork, tạo branch mới và gửi pull request.
- Đảm bảo code tuân thủ chuẩn PEP8 và có unit test nếu cần.
- Mọi ý kiến đóng góp, pull request đều được hoan nghênh!

---

## 📞 Liên Hệ

- **Email:** your_email@example.com
- **Zalo/Telegram:** your_contact (nếu muốn)

---

**Pathwise - Nền tảng học tập thông minh, cá nhân hóa cho doanh nghiệp và tổ chức