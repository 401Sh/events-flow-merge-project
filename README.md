# Our events backend - NestJS + TypeScript + Axios

## Цель проекта

Разработать бэкенд, который будет агрегировать и предоставлять данные о мероприятиях с двух независимых API: Leader-id и Timepad.

### Задачи

- [X] Получение общего списка мероприятий
- [X] Фильтрация мероприятий по городу пользователя
- [X] Определение города по координатам пользователя
- [X] Просмотр информации о мероприятии
- [ ] Вход по OAuth Timepad
- [X] Вход по OAuth Leader-ID
- [X] Список посещенных пользователем мероприятий Leader-ID
- [ ] Список посещенных пользователем мероприятий Timepad
- [X] Список мероприятий на которые записался пользователь Leader-ID
- [ ] Список мероприятий на которые записался пользователь Timepad
- [ ] Регистрация и авторизация пользователей
- [ ] CRUD для собственных мероприятий

### Технологии

- **TypeScript** - статическая типизация для повышения надежности кода.
- **Class-Validator** - валидация клиентских запросов.
- **NestJS** - обработка маршрутов.
- **@NestJS/Axios** - формирование запросов к API.
- **TypeORM** - работа с БД

## Установка

1. Клонируйте репозиторий

```bash
git clone https://gitverse.ru/studentlabs/our_events_backend
```

2. Перейдите в директорию проекта

```bash
cd our_events_backend
```

## Локальный запуск

1. Установите зависимости

```bash
npm install
```

2. Запустите проект.

```bash
npm run start
```

Для запуска проекта потребуется создать файл .env в корне каталога и настроить его. Пример конфигурации - example.env файл.
В данный момент проект не может работать без предоставления токена доступа к API timepad и client_id с secret_id от API leader-id, а также без Postgis базы данных.
- Получить токен доступа timepad можно ссылке: https://dev.timepad.ru/api/oauth/
- Получить client_id и secret_id от leader-id можно по ссылке: https://leader-id.ru/en/developers

После запуска проект будет доступен по адресу {HOST}:{PORT}/api/v1, а Swagger по адресу {HOST}:{PORT}/api/v1/docs

## Запуск в Docker контейнере

### Полный стек

1. Запустите docker-compose

```bash
docker-compose -f docker-compose.stack.yml up -d
```

Для запуска проекта потребуется создать файл .env в корне каталога и настроить его. Пример конфигурации - example.env файл.
После запуска проект будет доступен по адресу {HOST}:{PORT}/api/v1, а Swagger по адресу {HOST}:{PORT}/api/v1/docs

### Отдельный запуск

1. Запустите docker-compose

```bash
docker-compose up -d
```

Для запуска проекта потребуется создать файл .env в корне каталога и настроить его. Пример конфигурации - example.env файл.
После запуска проект будет доступен по адресу {HOST}:{PORT}/api/v1, а Swagger по адресу {HOST}:{PORT}/api/v1/docs

---

При необходимости можно развернуть контейнеры Postgis или Minio для локального запуска БД или s3 соотвественно:

- Запуск Postgis БД контейнера
  
```bash
docker-compose -f docker-compose.postgis.yml up -d
```

- Запуск Minio S3 контейнера
  
```bash
docker-compose -f docker-compose.minio.yml up -d
```

## Миграции БД

1. Создание миграции

```bash
# Автоматическая генерация схемы миграции с изменениями
npm run migration:generate

# Генерация шаблона миграции для ручного ввода изменений
npm run migration:create
```

2. Применение миграции

```bash
npm run migration:run
```

3. Отмена миграции

```bash
npm run migration:revert
```

Миграции доступны по пути /src/database/migrations/

### Структура проекта

```
src/
│
│── auth/               # Модули аунтентификации и авторизации
│   ├── dto/
│   ├── entities/
│   ├── guards/
│   ├── strategies/
│   ├── types/
│
├── client-auth/        # Модуль получения токенов доступа к API
│
│── common/
│   ├── api-utils/
│   ├── configs/
│   ├── constants/
│   ├── guards/
│
│── database/           # Вспомогательный функционал для БД (сиды и миграции)
│
│── dictionaries/       # Модуль словарей
│   ├── dto/
│   ├── entities/       # Сущности БД
│
│── events/             # Модуль мероприятий
│   ├── dto/
│   ├── entities/       # Сущности БД
│   ├── enums/
│   ├── guards/
│   ├── validators/       # Кастомные валидаторы для DTO
│
│── external-events/    # Модуль мероприятий сторонних API
│   ├── dto/
│   ├── enums/
│   ├── interfaces/
│   ├── services/       # Сервисы логики запросов данных со сторонних API
│
│── external-users/     # Модуль пользователей сторонних API
│   ├── api-utils/      # Мапперы для приведения данных к visited events
│   ├── dto/
│   ├── enums/
│   ├── guards/
│   ├── interfaces/
│   ├── services/       # Сервисы логики запросов данных со сторонних API
│
│── geo/                # Модуль городов и местоположения
│   ├── dto/
│   ├── entities/       # Сущности БД
│
├── oauth/              # Модуль пользовательской аутентификации
│   ├── dto/
│   ├── guards/
│   ├── interfaces/
│   ├── services/       # Сервисы логики запросов данных со сторонних API
│
│── users/              # Модуль пользователей
│   ├── entities/       # Сущности БД
│
.env
tsconfig.json
package.json
```

## Используемые роуты

Все маршруты защищенны api ключом доступа, который нужно передавать в заголовке x-api-key.

### Модуль dictionaries

- **GET    /dictionaries/themes**                    - Получение списка общих категорий/тем для фильтрации

### Модуль external-events

- **GET    /external/events**                              - Получение общего списка событий от двух источников
- **GET    /external/events/:source**                      - Получение списка событий от источника
- **GET    /external/events/:source/:eventId**             - Получение данных о событии от источника (в данный момент работает только для timepad)

### Модуль geo

- **GET    /geo**                                 - Получение списка городов
- **GET    /geo/:cityId/nearest**                 - Получение списка ближайших городов к конкретному городу
- **GET    /geo/coords**                          - Получение id ближайшего города по координатам

### Модуль external-users

- **GET    /external/users/:userId/leaderId**                                          - Получение данных пользователя leaderId
- protected **GET    /external/users/:userId/leaderId/participations**                 - Получения посещенных и предстоящих мероприятий пользователя leaderId
- protected **GET    /external/users/:userId/leaderId/participations/:completed**      - Получения посещенных или предстоящих мероприятий пользователя leaderId
- protected **POST   /external/users/:userId/leaderId/participations**                 - Запись на мероприятие leaderId
- protected **DELETE /external/users/:userId/leaderId/participations/:uuid**           - Отмена записи на мероприятие leaderId

### Модуль oauth

- **GET    /oauth/redirect/:source**                          - Редирект на авторизацию в источнике
- **GET    /oauth/callback/leaderId**                         - Обмен кода leaderId на токены доступа
- protected **POST   /oauth/refresh/leaderId**                - Обновление токенов доступа leaderId по refresh токену

### Модуль auth

- **POST   /auth/signup**                       - Регистрация аккаунта по почте и паролю
- **GET    /auth/signup/confirm**               - Подтверждение регистрации
- **POST   /auth/signin**                       - Авторизация пользователя
- protected **DELETE /auth/logout**             - Удаление пользовательской сессии
- protected **POST   /auth/refresh**            - Обновление токенов доступа

## Статус проекта

Проект находится в разработке - активно ведётся разработка базового функционала и архитектуры.