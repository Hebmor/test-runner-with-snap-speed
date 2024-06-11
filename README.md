<h1>Storybook Test Runner With Test Optimization</h1>

[Оригинальная документация Storybook Test Runner](https://github.com/storybookjs/test-runner)

# Оптимизация запуска тестов

![Пример визуализации](https://www.chromatic.com/docs/assets/turbosnap-dep-tracking.mp4)

## 💡 Идея

При запуске тестов, нам не нужно выполнять тесты для каждого компонента, а только для тех, которые были изменены. Важно учитывать глубокие связи между файлами и компонентами. Например, если мы изменили компонент Text, и он используется в компоненте Card, то тесты для компонента Card также должны быть запущены, так как они взаимосвязаны. 

Отсюда вытекают две основные задачи:

1. Как определить различия между веткой MR и основной веткой?
2. Как определить, какие изменения влияют на компоненты, и какие тесты компонентов необходимо запустить?

### git diff

С помощью команды `git diff` можно узнать, какие файлы изменились между ветками:

` git --no-pager diff --minimal --name-only ${название ветки}`

Эта команда выведет список измененных файлов, который можно использовать для анализа их связей с компонентами.

### dependency cruiser

`dependency-cruiser` — утилита для анализа зависимостей между файлами. Она обычно используется для построения графа зависимостей в виде изображения. Утилита имеет API, которое позволяет по списку файлов получать все их зависимости.

### 🛠 Реализация

Реализация для двух основных задач найдена. Теперь необходимо внедрить эту логику в [storybookjs/test-runner](https://github.com/storybookjs/test-runner). Для этого был сделан форк и добавлен новый флаг `--changed`.

##### Шаги интеграции

- **Получение списка измененных файлов:** Используйте команду `git diff` для получения списка измененных файлов между ветками.

`git --no-pager diff --minimal --name-only ${название ветки}`

- **Анализ зависимостей:**
Примените `dependency-cruiser` для анализа зависимостей измененных файлов.

`const dependencyCruiser = require('dependency-cruiser');`

`const result = dependencyCruiser.cruise(['<список измененных файлов>']);`
`console.log(result.output);`

- **Запуск тестов для измененных компонентов:** Используйте полученные данные для определения связанных компонентов и запуска их тестов.

## Работа с плагином

### 💿 Установка пакета

Установите пакет с помощью команды:

`npx yarn add -D @webdev/test-runner-with-test-optimization`

Установите его в директории вашего проекта с Storybook.

Если вы используете Yarn Berry в режиме PnP, добавьте следующее в ваш `.yarnrc.yml`:

```
npmScopes:
  webdev:
    npmRegistryServer: 'https://git.ftc.ru/api/v4/projects/5712/packages/npm/'
```
### 🏗 Настройка конфигурации
Для корректной работы создайте файл `to-config.json` в корне вашего проекта и укажите настройки:

| Название       | Описание                                                                       | Пример                                                                            | Значение по умолчанию |
| -------------- |--------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|---------------------|
| dirs           | Список директорий, где dependency cruiser будет искать файлы с метками marks.  | /packages/ui/src/components                                                       |                     |
| marks          | Метки файлов историй Storybook                                                 | [.stories]                                                                        | [.stories]          |
| gitPaths | Позволяет включать и исключать пути из разницы между целевой и текущей веткой. | ["src/components", "!src/components/index.ts"]                                    |                     |
| mainBranch     | Целевая ветка для сравнения                                                    | origin/main                                                                       | main                |
| options        | Опции для dependency cruiser                                                   | https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md |                     |

Пример `to-config.json`:

```
{
  "dirs": ["/packages/ui/src/components"],
  "marks": [".stories"],
  "gitPaths": ["!index.ts", "!CHANGELOG.md", "!package.json", "!tsconfig.json", "!tsup.config", "/ui/src", "!packages/ui/src/styles/theme.ts", "/storybook/styles", "/storybook/.storybook/", "/lib/src", "/icons/src", "!.png", "!.svg","/map/src/components"],
  "mainBranch": "origin/main",
  "options": {
    "exclude": {
      "path": "(coverage|test|node_modules|index.ts|theme.ts)"
    }
  }
}
```

### ✨ Активируем отслеживание изменений

Чтобы активировать отслеживание изменений, добавьте флаг `--changed` в команду плагина test-runner:

`test-storybook --junit --ci --maxWorkers=2 -i --changed --browsers chromium webkit`

### 👀 Особенности работы

`dependency-cruiser`, лежащий в основе плагина, ищет все зависимости, что может создавать проблемы. Например, если вы используете `index.ts` для экспорта компонентов, то изменение одного компонента вызовет изменение всех экспортируемых компонентов. Чтобы этого избежать, исключите `index.ts` файлы из отслеживания, добавив их в `to-config.json`:

```
{
  "options": {
    "exclude": {
      "path": "(coverage|test|node_modules|index.ts|theme.ts)"
    }
  }
}
```

### 💽 Обновление пакета

Для обновления пакета выполните следующие команды:

```
npx yarn build 
npx yarn npm publish
```

Пакет будет опубликован здесь: [https://git.ftc.ru/webdev/frontend/test-runner-with-test-optimization/-/packages](https://git.ftc.ru/webdev/frontend/test-runner-with-test-optimization/-/packages)

### 🙄 Обзор изменений в TestRunner

- Добавлена опция `--changed`, включающая запуск тестов только для изменившихся компонентов.
- В `src/test-storybook.ts` добавлена логика получения изменённых файлов при активированном флаге `--changed` и списка stories, для которых нужно запустить тесты.
- В `src/jest-playwright.ts` добавлена логика фильтрации тестов, чтобы они запускались только для изменённых компонентов.

### 🚧 [CHANGELOG](https://git.ftc.ru/webdev/frontend/test-runner-with-test-optimization/-/blob/main/CHANGELOG-OPTIMIZATION.md?ref_type=heads)
