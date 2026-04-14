(function () {
  const DAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

  function toIsoDate(date) {
    const value = new Date(date);
    value.setHours(12, 0, 0, 0);
    return value.toISOString().slice(0, 10);
  }

  function daysFromNow(offset) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return toIsoDate(date);
  }

  function createId(prefix) {
    return prefix + "-" + Math.random().toString(36).slice(2, 10);
  }

  function createDefaultData() {
    return {
      version: 1,
      admin: {
        username: "admin",
        password: "beauty-lab2026",
      },
      site: {
        brand: "Лаборатория красоты",
        hero: {
          eyebrow: "Эстетическая косметология нового поколения",
          title: "Деликатные протоколы, заметный результат, честный сервис",
          text: "Клиника с врачами-косметологами, аппаратными методиками и продуманной записью. Без лишнего давления, с акцентом на комфорт, безопасность и прогнозируемый эффект.",
        },
        banner: {
          title: "Glow Reset: курс аппаратного ухода со скидкой 15%",
          text: "Комбинация RF-лифтинга и восстановительного ухода для тех, кто хочет быстро вернуть тонус и свежесть без резкой реабилитации.",
          linkLabel: "До конца месяца",
        },
        metrics: [
          { value: "11+", label: "лет опыта команды" },
          { value: "92%", label: "возвращаются на повторный визит" },
          { value: "5 шагов", label: "до подтверждённой записи" },
        ],
        advantages: [
          {
            title: "Врачи, а не продавцы",
            text: "Подбираем процедуры исходя из запроса, анамнеза и реальных ограничений.",
          },
          {
            title: "Понятная логика записи",
            text: "Календарь показывает только свободные слоты и конкретных специалистов.",
          },
          {
            title: "Эстетика без перегруза",
            text: "Совмещаем результат, комфорт и мягкий визуальный стиль бренда.",
          },
        ],
        contacts: {
          address: "Москва, ул. 1905 года, 7с1",
          phone: "+7 (495) 320-18-26",
          email: "hello@beautylab-clinic.ru",
          hours: "Ежедневно, 10:00-21:00",
        },
      },
      categories: [
        {
          id: "hardware",
          name: "Аппаратная косметология",
          description: "Технологии для лифтинга, качества кожи и восстановления тонуса.",
        },
        {
          id: "injection",
          name: "Инъекционная косметология",
          description: "Точечные протоколы для коррекции объёма, мимики и увлажнения.",
        },
        {
          id: "care",
          name: "Уходовые процедуры",
          description: "Бережные ритуалы для очищения, сияния и поддерживающего ухода.",
        },
        {
          id: "aesthetic",
          name: "Эстетическая косметология",
          description: "Процедуры для текстуры кожи, рельефа и визуального баланса.",
        },
      ],
      services: [
        {
          id: "rf-lifting",
          categoryId: "hardware",
          name: "RF-лифтинг лица",
          price: 6500,
          duration: "60 минут",
          teaser: "Мягкий лифтинг овала лица и плотности кожи без длительной реабилитации.",
          description: "Процедура стимулирует коллагеновый каркас, помогает вернуть чёткость контуру лица и улучшить качество кожи. Подходит как самостоятельный уход, так и как часть курсового протокола.",
          accent: "Лифтинг без резкой реабилитации",
          indications: ["снижение тонуса", "мелкая дряблость", "тусклый цвет лица"],
          contraindications: ["беременность", "острые воспаления", "кардиостимулятор"],
          specialistIds: ["spec-anna", "spec-olga"],
        },
        {
          id: "laser-peel",
          categoryId: "aesthetic",
          name: "Лазерный карбон-пилинг",
          price: 5200,
          duration: "45 минут",
          teaser: "Освежает тон, работает с порами и текстурой, даёт чистое сияние.",
          description: "Процедура мягко обновляет поверхностный слой кожи, уменьшает выраженность пор и улучшает общее ощущение гладкости. Особенно хорошо подходит для плотного городского ритма.",
          accent: "Сияние и ровный тон",
          indications: ["расширенные поры", "тусклость", "неравномерный рельеф"],
          contraindications: ["активный герпес", "свежий загар", "повреждения кожи"],
          specialistIds: ["spec-anna", "spec-maria"],
        },
        {
          id: "lip-balance",
          categoryId: "injection",
          name: "Контурная пластика губ",
          price: 14500,
          duration: "50 минут",
          teaser: "Естественный объём, увлажнение и выравнивание контура без перегруза.",
          description: "Работаем с деликатной формой и увлажнением, сохраняя естественную мимику и пропорции лица. Перед процедурой обсуждаем желаемый объём и ограничения.",
          accent: "Натуральный объём",
          indications: ["асимметрия", "сухость", "дефицит объёма"],
          contraindications: ["беременность", "аутоиммунные заболевания", "воспаления"],
          specialistIds: ["spec-olga"],
        },
        {
          id: "hydra-clean",
          categoryId: "care",
          name: "Hydra-очищение и сияние",
          price: 4300,
          duration: "70 минут",
          teaser: "Глубокое очищение, увлажнение и комфорт даже для чувствительной кожи.",
          description: "Комбинированный уход с очищением, мягким эксфолиирующим этапом, сыворотками и успокаивающей маской. Отличный старт для клиентов, которые знакомятся с клиникой.",
          accent: "Комфортная база ухода",
          indications: ["обезвоженность", "забитые поры", "чувствительность"],
          contraindications: ["активные дерматозы", "повреждения кожи", "аллергия на компоненты"],
          specialistIds: ["spec-maria", "spec-olga"],
        },
        {
          id: "bio-repair",
          categoryId: "injection",
          name: "Биоревитализация",
          price: 9800,
          duration: "55 минут",
          teaser: "Инъекционное увлажнение и восстановление кожи после стресса и сухости.",
          description: "Подходит для курса восстановления гидробаланса, улучшения эластичности и качества кожи. Часто назначается после смены сезона и плотных рабочих периодов.",
          accent: "Глубокое увлажнение",
          indications: ["обезвоженность", "мелкие морщины", "снижение эластичности"],
          contraindications: ["острые инфекции", "беременность", "воспаления в зоне введения"],
          specialistIds: ["spec-anna", "spec-olga"],
        },
      ],
      specialists: [
        {
          id: "spec-anna",
          name: "Анна Левина",
          role: "Врач-косметолог, дерматолог",
          experience: 11,
          tagline: "Работает с возрастными изменениями и качеством кожи.",
          about: "Любит собирать курсы так, чтобы они вписывались в реальную жизнь клиента. Ведёт аппаратные протоколы и инъекционные процедуры без агрессивной перегрузки ухода.",
          education: [
            "Первый МГМУ им. Сеченова, лечебное дело",
            "Ординатура по дерматовенерологии",
            "Сертификация по аппаратной косметологии и инъекционным методикам",
          ],
          focus: ["anti-age протоколы", "RF-лифтинг", "биоревитализация"],
          image: "./assets/media/portraits/anna.svg",
        },
        {
          id: "spec-maria",
          name: "Мария Белова",
          role: "Косметолог-эстетист",
          experience: 8,
          tagline: "Отвечает за текстуру, очищение и комфортную базу ухода.",
          about: "Сильна в процедурах для чувствительной и комбинированной кожи. Делает так, чтобы клиенту было понятно, зачем нужен каждый этап ухода и как поддерживать результат дома.",
          education: [
            "РУДН, эстетическая косметология",
            "Курсы по неинвазивным протоколам ухода",
            "Повышение квалификации по лазерным поверхностным методикам",
          ],
          focus: ["очищение", "лазерный пилинг", "поддерживающий уход"],
          image: "./assets/media/portraits/maria.svg",
        },
        {
          id: "spec-olga",
          name: "Ольга Нестерова",
          role: "Врач-косметолог",
          experience: 9,
          tagline: "Деликатно работает с объёмом, контуром и восстановлением кожи.",
          about: "Специализируется на контурной пластике и сочетанных курсах. Всегда предлагает несколько сценариев работы и объясняет разницу в результате и сроках.",
          education: [
            "РНИМУ им. Пирогова, лечебное дело",
            "Профессиональная переподготовка по косметологии",
            "Сертификация по контурной пластике и ботулинотерапии",
          ],
          focus: ["контурная пластика", "биоревитализация", "поддержка качества кожи"],
          image: "./assets/media/portraits/olga.svg",
        },
      ],
      portfolio: [
        {
          id: "port-rf",
          serviceId: "rf-lifting",
          specialistId: "spec-anna",
          title: "RF-лифтинг овала лица",
          summary: "Через 4 недели лицо выглядит плотнее, линия нижней челюсти стала спокойнее и чище.",
          image: "./assets/media/portfolio/rf-lifting.svg",
        },
        {
          id: "port-clean",
          serviceId: "hydra-clean",
          specialistId: "spec-maria",
          title: "Hydra-очищение",
          summary: "После курса поры выглядят аккуратнее, кожа отражает свет ровнее, без ощущения стянутости.",
          image: "./assets/media/portfolio/hydra-clean.svg",
        },
        {
          id: "port-laser",
          serviceId: "laser-peel",
          specialistId: "spec-maria",
          title: "Карбон-пилинг",
          summary: "Снижение тусклости и более ровная текстура уже после первой процедуры.",
          image: "./assets/media/portfolio/laser-peel.svg",
        },
        {
          id: "port-lips",
          serviceId: "lip-balance",
          specialistId: "spec-olga",
          title: "Контурная пластика губ",
          summary: "Сохранена натуральная форма, добавлено мягкое увлажнение и баланс контура.",
          image: "./assets/media/portfolio/lip-balance.svg",
        },
      ],
      reviews: [
        {
          id: "review-1",
          name: "Ирина",
          date: daysFromNow(-8),
          rating: 5,
          text: "Очень понравилось, что никто не навязывает лишние процедуры. На консультации всё объяснили человеческим языком, а результат после курса выглядит естественно.",
          photoHint: "RF-лифтинг",
          status: "approved",
        },
        {
          id: "review-2",
          name: "Кристина",
          date: daysFromNow(-15),
          rating: 5,
          text: "Сильная команда и очень спокойный сервис. Отдельно понравилось, что запись понятная и без звонков, а в кабинете нет ощущения спешки.",
          photoHint: "Hydra-уход",
          status: "approved",
        },
        {
          id: "review-3",
          name: "Елена",
          date: daysFromNow(-3),
          rating: 4,
          text: "Пришла на биоревитализацию, получила понятный план ухода на месяц и реально рабочие рекомендации, а не длинный список баночек.",
          photoHint: "",
          status: "approved",
        },
      ],
      promotions: [
        {
          id: "promo-1",
          title: "Glow Reset",
          badge: "-15%",
          description: "RF-лифтинг + восстанавливающая маска в одном посещении для тех, кто хочет быстро вернуть тонус и свежесть.",
          terms: "Действует при первом визите и записи через сайт.",
          validUntil: daysFromNow(16),
        },
        {
          id: "promo-2",
          title: "Skin Start",
          badge: "2+1",
          description: "При покупке курса из двух процедур Hydra-очищения диагностическая консультация включается без доплаты.",
          terms: "Подходит только новым клиентам клиники.",
          validUntil: daysFromNow(22),
        },
        {
          id: "promo-3",
          title: "Soft Volume",
          badge: "Пакет",
          description: "Консультация + контурная пластика губ + контрольный визит через 14 дней по фиксированной стоимости.",
          terms: "Количество мест в расписании ограничено.",
          validUntil: daysFromNow(28),
        },
      ],
      schedules: [
        {
          id: "schedule-anna",
          specialistId: "spec-anna",
          workingDays: [1, 2, 4, 5, 6],
          slots: ["10:00", "11:30", "13:00", "15:30", "17:00", "18:30"],
          blockedDates: [daysFromNow(6)],
        },
        {
          id: "schedule-maria",
          specialistId: "spec-maria",
          workingDays: [2, 3, 4, 6, 0],
          slots: ["10:30", "12:00", "14:00", "16:00", "18:00"],
          blockedDates: [],
        },
        {
          id: "schedule-olga",
          specialistId: "spec-olga",
          workingDays: [1, 3, 5, 6],
          slots: ["11:00", "12:30", "15:00", "17:30", "19:00"],
          blockedDates: [daysFromNow(3)],
        },
      ],
      appointments: [
        {
          id: "appointment-1",
          serviceId: "rf-lifting",
          specialistId: "spec-anna",
          date: daysFromNow(1),
          time: "11:30",
          fullName: "Алина Миронова",
          phone: "+7 (916) 555-12-34",
          email: "alina@example.com",
          comment: "Хочу понять, нужен ли курс или можно начать с одной процедуры.",
          status: "confirmed",
          createdAt: new Date().toISOString(),
        },
        {
          id: "appointment-2",
          serviceId: "hydra-clean",
          specialistId: "spec-maria",
          date: daysFromNow(2),
          time: "14:00",
          fullName: "Светлана К.",
          phone: "+7 (905) 777-01-44",
          email: "",
          comment: "",
          status: "new",
          createdAt: new Date().toISOString(),
        },
      ],
    };
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("ru-RU").format(Number(value || 0)) + " ₽";
  }

  function formatLongDate(value) {
    if (!value) {
      return "Не указано";
    }
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      weekday: "short",
    }).format(new Date(value));
  }

  window.BeautyLabSeed = {
    DAYS,
    createDefaultData,
    createId,
    daysFromNow,
    toIsoDate,
    formatMoney,
    formatLongDate,
  };
})();
