# Deploy tự động bằng Self-hosted GitHub Runner

Tài liệu setup CI/CD cho repo `louisdevzz/school-of-information-technology`.
Mỗi khi `git push origin prod`, server tự `git pull` → `pnpm build` → `pm2 reload`.
Nhánh deploy là `prod` (không phải `main`).

## Cơ chế hoạt động

```
git push origin prod
        │
        ▼
   GitHub (queue job)
        │  runner tự KẾT NỐI RA (outbound) — GitHub KHÔNG ssh vào server
        ▼
Self-hosted runner  ──chạy──►  deploy.sh
 (trên server hoặc mac)         ├─ git reset --hard origin/prod
                                ├─ pnpm install --frozen-lockfile
                                ├─ pnpm build   (backend + app + dashboard)
                                └─ pm2 startOrReload ecosystem.config.js
```

Vì runner tự tạo kết nối **đi ra** tới GitHub nên **server sau VPN/firewall vẫn dùng được** —
chỉ cần server `curl -I https://github.com` có phản hồi.

## File liên quan (đã có trong repo)

| File | Vai trò |
|------|---------|
| `deploy.sh` | Script deploy dùng chung cho cả local test lẫn server |
| `.github/workflows/deploy.yml` | Workflow: push `prod` → chạy trên runner `production`; bấm tay → chọn `local-test` |
| `ecosystem.config.js` | Cấu hình PM2 3 process: `sit-backend` (8080), `sit-app` (3000), `sit-dashboard` (4000) |

---

## Bảng tham số — ý nghĩa & cách lấy

### Tham số của `deploy.sh` (override bằng biến môi trường)

| Biến | Mặc định | Ý nghĩa | Cách lấy / chỉnh |
|------|----------|---------|------------------|
| `APP_DIR` | `/home/dev/dev/sit` | Thư mục đã `git clone` repo, nơi build & chạy | Server: đường dẫn bạn clone. Local test: đặt `/tmp/sit-test` |
| `BRANCH` | `prod` | Nhánh deploy | Đổi nếu deploy nhánh khác (vd `staging`) |
| `PATH` | tự vá nếu thiếu `pnpm` | Cho runner tìm thấy `node`/`pnpm`/`pm2` | Trên server sửa 2 đường dẫn cho khớp `which pnpm` và `which node` |

### Tham số khi đăng ký runner (`./config.sh`)

| Cờ | Giá trị cho repo này | Ý nghĩa | Cách lấy |
|----|----------------------|---------|----------|
| `--url` | `https://github.com/louisdevzz/school-of-information-technology` | Repo mà runner phục vụ | URL repo trên GitHub |
| `--token` | (chuỗi ngắn hạn) | Token đăng ký runner | **Settings → Actions → Runners → New self-hosted runner** — GitHub hiện token, chỉ sống ~1 giờ. Hết hạn thì mở lại trang lấy token mới |
| `--name` | `dev2026` (server) / `mac-test` (local) | Tên hiển thị runner | Tự đặt |
| `--labels` | `production` (server) / `local-test` (mac) | Nhãn để workflow chọn đúng runner | Tự đặt — **phải khớp** `runs-on` trong `deploy.yml` |
| `--work` | `_work` | Thư mục làm việc của runner | Để mặc định |

> ⚠️ `--token` KHÁC với Personal Access Token. Đây là **registration token** tự sinh trong trang "New self-hosted runner", không phải token cá nhân. Đừng commit nó vào repo.

### Bản runner cần tải (khớp máy)

| Máy | Nền tảng | Bản runner |
|-----|----------|-----------|
| Mac của bạn | macOS **arm64** (Apple Silicon) | `osx-arm64` |
| Server dev2026 | Ubuntu **x64** | `linux-x64` |

GitHub hiện sẵn lệnh `curl ... tar.gz` đúng bản khi bạn chọn OS ở trang New self-hosted runner — cứ copy lệnh đó.

---

## Phần A — Test trên máy mac trước (không cần server)

### A1. Push script + workflow lên `prod`
Workflow chạy `deploy.sh` từ bản clone tự pull, nên clone phải thấy được các file này ⇒ push trước.

```bash
git add deploy.sh .github/workflows/deploy.yml docs/deploy-self-hosted-runner.md
git commit -m "ci: self-hosted deploy workflow + script + docs"
git push origin prod
```
(An toàn: server chưa có runner `production` nên push không trigger deploy thật.)

### A2. Tải & giải nén gói runner
> `config.sh` KHÔNG có sẵn — nó nằm bên trong gói runner tải từ GitHub. Phải tải + giải nén trước.

Mở GitHub repo → **Settings → Actions → Runners → New self-hosted runner → macOS + Arm64**.
Trang này hiện lệnh `curl` với **version chính xác** và **token** — copy nguyên từ đó. Mẫu (mac arm64):

```bash
mkdir -p ~/actions-runner && cd ~/actions-runner
# URL bên dưới là VÍ DỤ — dùng version trang GitHub hiện ra
curl -o actions-runner-osx-arm64.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.328.0/actions-runner-osx-arm64-2.328.0.tar.gz
tar xzf actions-runner-osx-arm64.tar.gz
ls config.sh run.sh          # giờ mới thấy 2 file này
```

### A3. Đăng ký runner (thêm label `local-test`)
Vẫn trong `~/actions-runner`, chạy `config.sh` vừa giải nén — token lấy ở trang New runner (sống ~1h):

```bash
./config.sh \
  --url https://github.com/louisdevzz/school-of-information-technology \
  --token <REGISTRATION_TOKEN_GITHUB_HIEN> \
  --name mac-test \
  --labels local-test \
  --work _work
```

### A4. Clone thư mục test + chạy runner
```bash
git clone -b prod https://github.com/louisdevzz/school-of-information-technology.git /tmp/sit-test
cd ~/actions-runner && ./run.sh   # foreground, đủ cho test. Thấy "Listening for Jobs" là ok
```

### A5. Bấm chạy thử
GitHub → **Actions → Deploy → Run workflow** → chọn `local-test` → **Run workflow**.

Log sẽ: `git reset --hard` trên `/tmp/sit-test` → `pnpm install` → `pnpm build`.
Xanh = cơ chế chuẩn. `pm2` tự bỏ qua vì mac chưa cài (đúng ý — chỉ test build).

### A6. Dọn dẹp sau test
```bash
# Ctrl+C để dừng ./run.sh, rồi gỡ runner khỏi GitHub:
./config.sh remove --token <REGISTRATION_TOKEN_MOI>
rm -rf /tmp/sit-test
```

---

## Phần B — Cài trên server dev2026 (production)

### B1. Điều kiện trên server
```bash
curl -I https://github.com          # phải có phản hồi (kể cả sau VPN)
node -v && pnpm -v                   # cần Node 22 + pnpm. Thiếu thì cài trước
which pnpm && which node             # ghi lại 2 đường dẫn để chỉnh PATH ở B4
npm i -g pm2                         # cài PM2 nếu chưa có
```

### B2. Clone repo vào APP_DIR
```bash
git clone -b prod https://github.com/louisdevzz/school-of-information-technology.git /home/dev/dev/sit
```
> Nếu clone chỗ khác, sửa lại `APP_DIR` mặc định trong `deploy.sh` **và** `APP_DIR` trong `deploy.yml` cho khớp.

### B3. Đăng ký runner (label `production`)
Lấy token mới ở **Settings → Actions → Runners → New self-hosted runner → Linux**, rồi:
```bash
./config.sh \
  --url https://github.com/louisdevzz/school-of-information-technology \
  --token <REGISTRATION_TOKEN_MOI> \
  --name dev2026 \
  --labels production \
  --work _work
```

### B4. Chỉnh PATH trong deploy.sh (nếu cần)
Nếu `which pnpm` ở B1 khác đường dẫn mặc định, sửa dòng trong `/home/dev/dev/sit/deploy.sh`:
```bash
export PATH="$HOME/.local/share/pnpm:$HOME/.nvm/versions/node/v22/bin:$PATH"
```
cho khớp với `pnpm`/`node` thật trên server. (Script chỉ vá PATH khi không tìm thấy `pnpm`.)

### B5. Chạy runner như service (tự sống lại sau reboot)
```bash
./svc.sh install
./svc.sh start
./svc.sh status      # kiểm tra
```

### B6. Khởi động PM2 lần đầu + auto-start sau reboot
```bash
cd /home/dev/dev/sit
pnpm install --frozen-lockfile && pnpm build
pm2 start ecosystem.config.js
pm2 save
pm2 startup               # chạy lệnh nó in ra để PM2 tự khởi động cùng máy
```

### B7. Xong — deploy tự động
```bash
git push origin prod      # → server tự deploy
```
Trạng thái xem ở tab **Actions** trên GitHub, hoặc trên server: `pm2 ls`, `pm2 logs`.

---

## Cheat sheet PM2

| Lệnh | Tác dụng |
|------|----------|
| `pm2 ls` | Liệt kê 3 process + trạng thái |
| `pm2 logs sit-app` | Xem log realtime của public site |
| `pm2 reload ecosystem.config.js` | Reload thủ công (deploy.sh tự làm) |
| `pm2 restart all` | Restart cả 3 |
| `pm2 monit` | Dashboard CPU/RAM |

## Xử lý lỗi thường gặp

| Triệu chứng | Nguyên nhân / cách sửa |
|-------------|------------------------|
| Job kẹt ở "Waiting for a runner" | Runner offline, hoặc label không khớp `runs-on`. Kiểm tra Settings → Runners phải `Idle` |
| `pnpm: command not found` trong log | PATH trong `deploy.sh` sai — sửa theo `which pnpm` (B4) |
| `pnpm install` fail vì lockfile | Có ai đổi deps mà chưa commit `pnpm-lock.yaml`. Commit lại lock |
| Build xanh nhưng site không đổi | `pm2 reload` chưa chạy (mac test cố ý skip). Trên server kiểm tra `pm2 ls` |
| Token hết hạn khi `./config.sh` | Registration token chỉ sống ~1h — mở lại trang New runner lấy token mới |
| `git reset --hard` nuốt code đang sửa | Đúng thiết kế: **không bao giờ** chạy `deploy.sh` trong thư mục làm việc có code chưa commit. Chỉ chạy ở APP_DIR chuyên deploy |
