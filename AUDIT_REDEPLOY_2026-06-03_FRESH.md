# EVA-X / ATLAS DevOS — Свежий редеплой и аудит

**Дата:** 2026-06-03
**Pod preview URL:** https://mobile-build-test-19.preview.emergentagent.com
**Источник:** https://github.com/svetlanaslinko057/Evaaaa @ `main`
**Базовый образ pod:** `expo_mongo_base_image_cloud_arm:release-02062026-4` (Expo + MongoDB)

---

## 1. Что было сделано

1. Клонировал репозиторий https://github.com/svetlanaslinko057/Evaaaa в `/tmp/Evaaaa`.
2. Перенёс содержимое в `/app`, сохранив:
   - `.git/` и `.emergent/` текущего pod (без перезаписи)
   - Защищённые переменные окружения: `EXPO_PACKAGER_*`, `EXPO_PUBLIC_BACKEND_URL`, `EXPO_TUNNEL_SUBDOMAIN` во `frontend/.env`
   - `MONGO_URL`, `DB_NAME` в `backend/.env`
3. Установил зависимости backend: `pip install -r backend/requirements.txt` (138 пакетов).
4. Установил зависимости frontend: `yarn install` (после полной очистки `node_modules` для устранения сломанного кеша `@expo/cli`).
5. Перезапустил supervisor: `backend`, `expo`, `mongodb` — все `RUNNING`.
6. Создал `/app/memory/test_credentials.md` со списком всех seed-пользователей (для testing-agent / форков).

## 2. Состояние сервисов

| Сервис   | Команда                                                              | Порт  | Статус   |
|----------|----------------------------------------------------------------------|-------|----------|
| backend  | `uvicorn server:app --host 0.0.0.0 --port 8001 --workers 1 --reload` | 8001  | RUNNING  |
| expo     | `yarn expo start --tunnel --port 3000`                                | 3000  | RUNNING  |
| mongodb  | `mongod --bind_ip_all`                                                | 27017 | RUNNING  |

### Smoke-тесты (✅ все зелёные)

- `GET /api/healthz` → `{"status":"ok"}` (200)
- `GET /api/` → `{"message":"Development OS API","version":"1.0.0"}` (200)
- `GET /openapi.json` → **750 путей / 785 операций**
- `POST /api/auth/quick {"email":"admin@atlas.dev"}` → 200, `user_id=user_45f8effa43c9`
- `GET /api/integrations/manifest` → 200 (все провайдеры в `mock` режиме — ключи не заданы)
- Frontend preview URL `/` → 200, лендинг **EVA-X** «Build real products. Not tasks.» рендерится (EN/UK переключатель, SEQ-01/02/03, CTA «See my product plan»)

## 3. Backend (FastAPI · MongoDB)

| Метрика                              | Значение |
|--------------------------------------|----------|
| `backend/server.py`                  | 28 359 строк |
| Всего `.py` файлов в `backend/`      | 198 (154 без `tests/`) |
| API endpoints (paths)                | 750 |
| API operations                       | 785 |
| Коллекций MongoDB после seed         | 44 |
| `users`                              | 12 (2 admin + 6 dev pool + 4 quick-access) |

### Boot-последовательность (всё OK)

- ✅ DEV POOL seed: 6 devs, 89 modules, 81 QA decisions, 6 canonical money states
- ✅ MOCK SEED: 2 projects, 7 modules, 6 earnings, 6 invoices, 2 deliverables, 3 tickets, 3 notifications
- ✅ SEED_REPLAY `boot_replay_v1`: 70 events (overrides:16, qa_fail:14, reassign:19, overload:12, suppression:9)
- ✅ Notifications: 5 admin + 3 john + 3 client; Tester: 5 validations + 1 issue
- ✅ Indexes ensured: `money_ledger`, `payouts_v2`, `validation_campaigns`, `competitor_cache`
- ✅ Daemons running: `MODULE MOTION (15s)`, `AUTO GUARDIAN (120s)`, `CONTRACT REMINDER (6h)`, `OPERATOR SCHEDULER (5min)`, `PAY-V2 worker/reaper/mock advancer`, `RECONCILE LOOP (30min)`, `EVENT ENGINE (15min)`
- ✅ Money substrate sealed (Phase 2B PR-1 + Phase 2C B4.5); MoneyService initialised; Divergence Observer passive ON

### Известные предупреждения (не блокеры)

- `sentence_transformers` не установлен → embeddings для scope-шаблонов недоступны (4 шаблона залогированы как `Embedding error`, шаблоны при этом сидируются).
- `Duplicate Operation ID audit_log_api_admin_audit_log_get` — FastAPI warning, не влияет на работу.

## 4. Mobile (Expo SDK 54 · React Native 0.81)

| Метрика                            | Значение |
|------------------------------------|----------|
| `.tsx`/`.ts` файлов в `frontend/app` | 100 |
| Expo SDK                           | 54.0.35 |
| React Native                       | 0.81.5 |
| Expo Router                        | 6.0.22 |
| Reanimated                         | 4.1.1 |
| Tunnel                             | ngrok, активен |
| Web bundle                         | ✅ 1540 модулей собрано (~26 c) |
| Node SSR bundle                    | ✅ 1469 модулей собрано (~24 c) |

Роли клиента: admin (21 экран), client (20), developer (18), tester (6), lead (2).

## 5. Web (отдельный CRA + craco проект)

| Метрика                           | Значение |
|-----------------------------------|----------|
| Файлов в `web/src/`               | 240 |
| Зависимостей                      | 56 |
| Скрипты                           | `start`, `build`, `test` |
| Состояние в pod                   | **НЕ развёрнут** (текущий pod заточен под Expo mobile) |

`web/` — это отдельный React 18 / Tailwind / Radix SPA. В текущем pod (`expo_mongo_base_image`) нет supervisor-программы под него, и `/` ингресс зарезервирован за Expo на порту 3000. Чтобы развернуть web, нужен либо другой pod-образ (`fastapi_react_mongo_shadcn_base_image`), либо отдельный поддомен/порт. См. `WEB_RESTORE.md` в репозитории.

## 6. Интеграции (текущий режим)

| Категория  | Провайдер             | Режим | Что нужно для LIVE                          |
|------------|------------------------|-------|----------------------------------------------|
| AI / LLM   | emergentintegrations   | mock  | `EMERGENT_LLM_KEY` в `backend/.env`         |
| Payment    | Stripe / WayForPay     | mock  | `STRIPE_SECRET_KEY` / `WAYFORPAY_*`         |
| Mail       | Resend                 | mock  | `RESEND_API_KEY`                            |
| Storage    | Cloudinary             | mock  | `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET`  |
| OAuth      | Google                 | unavailable | `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` |

Флаг `INTEGRATIONS_LIVE_ENABLED=0` (по умолчанию) → весь external boundary через mock-адаптеры.
Для live-режима: добавить ключи в `backend/.env` и поставить `INTEGRATIONS_LIVE_ENABLED=1`.

## 7. Учётные записи (полный список в `memory/test_credentials.md`)

Quick login без пароля: `POST /api/auth/quick {"email": "<email>"}`

| Роль       | Email                  |
|------------|------------------------|
| admin      | admin@atlas.dev        |
| admin      | admin@devos.io         |
| client     | client@atlas.dev       |
| tester     | tester@atlas.dev       |
| developer  | john@atlas.dev, alice.kim@, marco.rossi@, priya.shah@, luka.horvat@, sara.chen@, diego.silva@, multi@ |

## 8. Известные риски и наблюдения

1. **`sentence_transformers` отсутствует** — отключены embeddings для scope-шаблонов. Если фича нужна, добавить `sentence-transformers` в `backend/requirements.txt` (тяжёлый PyTorch dep).
2. **Web SPA не развёрнут** в текущем pod-образе. Решение — либо запросить смену образа на `fastapi_react_mongo_shadcn_base_image`, либо выделить web в отдельный pod.
3. **Все внешние интеграции в mock-режиме** — production-флоу (платежи, e-mail, OAuth) не работают пока ключи не заданы.
4. **750 endpoints + 100 mobile экранов** — кодовая база большая; для дальнейшей разработки рекомендую двигаться фичами/доменами через `testing_agent` после каждой существенной правки.
5. **Дубликат `audit_log` operationId** — стоит переименовать одну из реализаций в `admin_users_layer.py` или `admin_system.py`, чтобы избежать конфликта в OpenAPI.

## 9. Что готово к продолжению

- Backend `/api/*` отвечает, все daemon-петли работают.
- Mobile Expo-приложение собирается и рендерит лендинг через preview URL.
- MongoDB засеяна: 44 коллекции, 12 пользователей, 89+ модулей, deliverables, invoices, notifications.
- Все 5 ролей мобильного клиента доступны через quick-login.
- Документация по интеграциям и архитектуре сохранена (`memory/PRD.md`, `backend/CONTRACTS.md`, `web/ARCHITECTURE.md`, `WEB_RESTORE.md`).

Можно переходить к следующему шагу разработки — назовите конкретную фичу / экран / домен (например, «доделать describe-wizard», «починить payouts_v2 reconciler»), и я возьму её в работу.
