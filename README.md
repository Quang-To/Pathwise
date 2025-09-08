# Pathwise: Hệ Thống Quản Lý Lộ Trình Học Tập & Gợi Ý Khóa Học

Pathwise là nền tảng quản lý học tập dành cho doanh nghiệp và tổ chức giáo dục, hỗ trợ gợi ý khóa học, xây dựng kỹ năng cần thiết, phản hồi học tập và quản trị người dùng. Ứng dụng AI cùng hạ tầng AWS Cloud (EC2, Milvus, RDS), Pathwise mang đến trải nghiệm học tập hiện đại, linh hoạt và cá nhân hóa cho từng người dùng.---
## Kiến trúc hệ thống

!(assets/img1.png)  
!(assets/img2.png)  
!(assets/img3.png)

## Tính Năng Nổi Bật

- **Xác thực & Phân quyền:** Đăng nhập, xác thực JWT, phân quyền theo vai trò (employee, manager, hr, admin).
- **Gợi ý khóa học AI:** Đề xuất khóa học phù hợp dựa trên kỹ năng còn thiếu, mục tiêu nghề nghiệp và embedding AI.
- **Dashboard học tập:** Tổng hợp mục tiêu, khóa học đề xuất, mapping sang course_id.
- **Thiết lập mục tiêu:** Cập nhật mục tiêu nghề nghiệp, tự động cập nhật gợi ý khóa học.
- **Mapping kỹ năng:** Trả về mapping giữa các khóa học đã học và kỹ năng đạt được.
- **Feedback khóa học:** Nhận và lưu phản hồi của người dùng cho từng khóa học.
- **Quản lý & nhúng dữ liệu Coursera:** Crawl, lưu trữ, embedding và mapping dữ liệu khóa học từ Coursera.
- **Tích hợp Milvus & PostgreSQL:** Lưu trữ embedding, dữ liệu khóa học, nhân viên, kỹ năng.

---

## Cấu Trúc Dự Án

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

## Cấu hình trước khi khởi động

### 1. Xây dựng hệ cơ sở dữ liệu
- Trong thư mục `\data` có các file dữ liệu, import vào **PostgreSQL trên RDS**.

### 2. Chuẩn bị thư viện cần thiết
```bash
pip install -r requirements.txt
```

### 3. Xây dựng danh sách khóa học gợi ý

Trong **PostgreSQL (RDS)**, tạo **schema** và **table** để lưu trữ thông tin khóa học:  

- **Schema:** `course`  
- **Table:** `courses`  

| Cột           | Kiểu dữ liệu (gợi ý) | Ý nghĩa |
|---------------|----------------------|---------|
| `id`          | SERIAL / UUID        | Mã định danh khóa học |
| `name`        | TEXT                 | Tên khóa học |
| `description` | TEXT                 | Mô tả khóa học |
| `level`       | VARCHAR              | Trình độ yêu cầu (Beginner, Intermediate, Advanced, …) |
| `skills`      | TEXT[] / JSONB       | Các kỹ năng khóa học cung cấp |
| `domainTypes` | TEXT[] / JSONB       | Lĩnh vực / chuyên ngành |
| `feedback`    | FLOAT / JSONB        | Điểm/nhận xét từ người học |
| `uri`         | TEXT                 | Đường dẫn khóa học |

---

### 4. Xây dựng cơ sở lưu trữ vector database

Sử dụng **Milvus** để lưu trữ embedding của khóa học (từ mô tả, kỹ năng, domain).  
- Cho phép tìm kiếm khóa học theo **semantic similarity**.  
- Tích hợp với PostgreSQL để mapping giữa `course_id` và vector embedding.

### 5. Chuẩn bị `.env`

- Sao chép file mẫu `.env.example` ở thư mục gốc, đổi tên thành `.env`.  
- Điền đầy đủ các thông tin cấu hình, lưu ý
```bash
# Coursera
URI_COURSERA=https://api.coursera.org/api/courses.v1
```

### 5. Chạy Toàn Bộ Hệ Thống

- Tại terminal thứ nhất, chạy lệnh sau
```bash
uvicorn main:app --reload
```
- Tạo một terminal thứ hai, chạy lệnh sau
```bash
npm install
npm start
```
- Đăng nhập thử với thông tin sau:
  + usernam: lethithao
  + password: 123456

### 6. Truy Cập Ứng Dụng
- **Backend API:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Frontend:** [http://localhost:3000](http://localhost:3000)

---

## Phát Triển & Debug

- **Backend:**  
  - Sửa file Python → container backend tự reload (`--reload`).  
  - Xem log: `docker logs -f pathwise-backend`  
  - Vào bash: `docker exec -it pathwise-backend bash`  

- **Frontend:**  
  - Sửa file trong `front_end/src` → frontend tự reload.  
  - Xem log: `docker logs -f pathwise-frontend`  

- **Database:**  
  - Vào psql: `docker exec -it pathwise-db psql -U postgres -d pathwise`  

- **Build docker:**  
  - `docker build . -t <tên-image>`

---

## Các Endpoint Chính

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

## Công Nghệ Sử Dụng

- **Backend:** FastAPI, SQLAlchemy, Milvus, PostgreSQL, Pydantic, python-jose, Uvicorn
- **Frontend:** ReactJS, Material UI (MUI)
- **Vector DB:** Milvus
- **Database:** PostgreSQL
- **AI:** Google Generative AI (embedding, mapping kỹ năng)

---

## Một Số File Quan Trọng

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