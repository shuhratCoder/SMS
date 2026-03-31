# SMS Broadcast Admin Panel

Glassmorphism-дизайн административной панели для SMS рассылок.
Стек: **Next.js 14** + **TypeScript** + **Tailwind CSS** + **Framer Motion** + **Recharts**

---

## Почему Next.js 14 (App Router), а не CRA?

| Критерий | Next.js 14 | Create React App |
|---|---|---|
| Роутинг | Файловый, из коробки | Ручной (react-router-dom) |
| Layouts | Вложенные layout.tsx | Ручная обёртка |
| Производительность | Server Components, code splitting | Всё в браузере |
| Шрифты | next/font (без layout shift) | Ручная загрузка |
| SEO | Built-in metadata API | Ручной react-helmet |

Для этого проекта ключевое преимущество: **вложенные layout.tsx** — Sidebar и Header рендерятся один раз, не перемонтируясь при переходах между страницами.

---

## Быстрый старт

### 1. Создать проект с нуля

```bash
npx create-next-app@latest sms-broadcast \
  --typescript --tailwind --app --src-dir \
  --import-alias "@/*" --no-eslint

cd sms-broadcast
```

### 2. Установить все библиотеки одной командой

```bash
npm install framer-motion lucide-react recharts \
  react-hook-form date-fns clsx tailwind-merge \
  @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
  @radix-ui/react-select @radix-ui/react-tooltip
```

### 3. Скопировать файлы проекта

Скопируйте все файлы из папки `src/` и конфиги в корень проекта.

### 4. Запустить

```bash
npm run dev
```

Откройте http://localhost:3000 — автоматически редиректнет на `/login`.

---

## Структура проекта

```
sms-broadcast/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (шрифты, фон)
│   │   ├── page.tsx                # Редирект → /login
│   │   ├── login/
│   │   │   ├── layout.tsx          # Без сайдбара
│   │   │   └── page.tsx            # Страница входа
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Sidebar + Header
│   │   │   └── page.tsx            # Дашборд со статистикой
│   │   ├── contacts/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx            # Таблица контактов
│   │   ├── groups/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx            # Таблица групп
│   │   ├── send-sms/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx            # Форма отправки
│   │   ├── history/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx            # История SMS
│   │   └── settings/
│   │       ├── layout.tsx
│   │       └── page.tsx            # Настройки
│   ├── components/
│   │   ├── ui/
│   │   │   ├── GlassCard.tsx       # Стеклянная карточка (variants)
│   │   │   ├── Badge.tsx           # Статусные бейджи
│   │   │   └── Skeleton.tsx        # Loading скелетоны
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx         # Боковое меню
│   │   │   ├── Header.tsx          # Верхняя панель
│   │   │   └── PageTransition.tsx  # Обёртка анимации
│   │   └── charts/
│   │       └── SmsCharts.tsx       # BarChart + PieChart
│   ├── lib/
│   │   ├── mock-data.ts            # Все моковые данные
│   │   └── utils.ts                # cn(), getInitials() и т.д.
│   └── styles/
│       └── globals.css             # CSS-переменные, анимации
├── tailwind.config.ts              # Кастомные токены + тени
├── tsconfig.json
├── next.config.js
└── package.json
```

---

## Дизайн-система

### Цвета (CSS-переменные)

```css
--bg-primary:    #0a0520   /* основной фон */
--neon-purple:   #7c3aed   /* акцент */
--neon-blue:     #2563eb   /* вторичный акцент */
--neon-cyan:     #06b6d4   /* информация */
--glass-bg:      rgba(255,255,255,0.04)
--glass-border:  rgba(255,255,255,0.10)
```

### Кастомные тени (tailwind.config.ts)

```
shadow-glow-purple   — неоновое свечение фиолетовое
shadow-glow-blue     — неоновое свечение синее
shadow-glass         — тень стеклянной карточки
shadow-glass-lg      — усиленная тень
```

### Анимации (framer-motion)

- `GlassCard` — `initial: {opacity:0, y:16}` → staggered через `delay`
- `Sidebar` — slide-in из левого края при монтировании
- `Login` — scale + fade при появлении
- `PageTransition` — fade + translateY между страницами
- `Dropdown` — scale + fade при открытии

---

## Моковые данные

Все данные в `src/lib/mock-data.ts`:

- **15 контактов** из 7 стран с флагами и должностями
- **6 групп** (Marketing, Clients, Sales, Tech, VIP, Leads)
- **10 записей** истории SMS с разными статусами
- **Статистика** дашборда (1200 контактов, 96.3% доставка)
- **Данные графика** за 7 дней
- **4 последних активности** для дашборда

---

## Страницы

| Маршрут | Описание |
|---|---|
| `/login` | Вход с переключателем языка (O'z / Рус / Eng) |
| `/dashboard` | Статистика, графики, быстрые действия |
| `/contacts` | Таблица контактов с поиском и пагинацией |
| `/groups` | Таблица групп с управлением |
| `/send-sms` | Форма отправки с планировщиком |
| `/history` | История SMS с фильтром по статусу |
| `/settings` | Настройки системы |

---

## Адаптивность

Минимальная поддержка: **1024px (desktop/tablet)**.
Сайдбар фиксированный (220px), контент адаптируется через CSS Grid.
