# Тестовое задание на вакансию Backend-разработчик на Node.Js

Ссылка на вакансию: https://hh.ru/vacancy/45054153


## Результаты

Первое задание выполнено с учётом всех требований по фильтрации.

## Проблемы

Не смог справиться со вторым заданием, в краткие сроки не получилось разработать рабочий алгоритм для расчёта дат по дням недели без ошибок. Формально по тз всё верно, но возвращает id уроков, но создаёт оно их не всегда в правильные дни.

## Подготовка рабочего окружения

```bash
$ npm install
```

Для работы приложения необходимо инициализировать базу данных. 

```bash
$ createdb moy-klass-db
```

И загрузить в неё дамб:

```bash
$ psql moy-klass-db < test.sql
```

## Запуск и тестирование

Т.к. программа использует базу данных, к ней нужно подключиться. Передаём переменную среды:

```bash
DATABASE_URL=postgres://localhost:<port>/moy-klass-db npm start
```

### Тестирование

Для тестирования также требуется предоставить переменную среды к базе данных.

```bash
DATABASE_URL=postgres://localhost:<port>/moy-klass-db npm test
```