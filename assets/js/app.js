(function () {
  const Seed = window.BeautyLabSeed;
  const Store = window.BeautyLabStore;
  const Shell = window.BeautyLabHomeShell;
  const Helpers = window.BeautyLabHomeHelpers;

  if (Shell) {
    Shell.mountHomePage(document.getElementById("siteShell"));
  }

  const page = document.getElementById("serviceGrid");

  if (!Seed || !Store || !page || !Helpers) {
    return;
  }

  const createBookingState = Helpers.createBookingState;
  const escapeHtml = Helpers.escapeHtml;
  const formatDate = Helpers.formatDate;
  const formatShortDate = Helpers.formatShortDate;
  const createEmptyState = Helpers.createEmptyState;
  const stars = Helpers.stars;

  let state = Store.getState();
  let serviceFilter = "all";
  let portfolioFilter = "all";
  let booking = createBookingState();

  const elements = {
    heroEyebrow: document.getElementById("heroEyebrow"),
    heroTitle: document.getElementById("heroTitle"),
    heroText: document.getElementById("heroText"),
    heroMetrics: document.getElementById("heroMetrics"),
    bannerTitle: document.getElementById("bannerTitle"),
    bannerText: document.getElementById("bannerText"),
    bannerLinkLabel: document.getElementById("bannerLinkLabel"),
    advantageGrid: document.getElementById("advantageGrid"),
    quickServiceSelect: document.getElementById("quickServiceSelect"),
    serviceFilters: document.getElementById("serviceFilters"),
    serviceGrid: document.getElementById("serviceGrid"),
    specialistGrid: document.getElementById("specialistGrid"),
    portfolioFilters: document.getElementById("portfolioFilters"),
    portfolioGrid: document.getElementById("portfolioGrid"),
    reviewGrid: document.getElementById("reviewGrid"),
    promotionGrid: document.getElementById("promotionGrid"),
    contactAddress: document.getElementById("contactAddress"),
    contactPhone: document.getElementById("contactPhone"),
    contactEmail: document.getElementById("contactEmail"),
    contactHours: document.getElementById("contactHours"),
    detailModal: document.getElementById("detailModal"),
    detailContent: document.getElementById("detailContent"),
    bookingModal: document.getElementById("bookingModal"),
    bookingProgress: document.getElementById("bookingProgress"),
    bookingStage: document.getElementById("bookingStage"),
    bookingBack: document.getElementById("bookingBack"),
    bookingNext: document.getElementById("bookingNext"),
    toastArea: document.getElementById("toastArea"),
    quickBookingForm: document.getElementById("quickBookingForm"),
    reviewForm: document.getElementById("reviewForm"),
    navToggle: document.querySelector(".nav-toggle"),
    siteNav: document.getElementById("siteNav"),
  };

  const bookingLabels = [
    "Услуга",
    "Специалист",
    "Дата и время",
    "Контакты",
    "Подтверждение",
  ];

  function getCategory(id) {
    return state.categories.find(function (item) {
      return item.id === id;
    });
  }

  function getService(id) {
    return state.services.find(function (item) {
      return item.id === id;
    });
  }

  function getSpecialist(id) {
    return state.specialists.find(function (item) {
      return item.id === id;
    });
  }

  function getSchedule(specialistId) {
    return state.schedules.find(function (item) {
      return item.specialistId === specialistId;
    });
  }

  function getServiceSpecialists(serviceId) {
    const service = getService(serviceId);
    if (!service) {
      return [];
    }

    return state.specialists.filter(function (specialist) {
      return service.specialistIds.includes(specialist.id);
    });
  }

  function getApprovedReviews() {
    return state.reviews.filter(function (review) {
      return review.status === "approved";
    });
  }

  function getAvailableSlots(specialistId, isoDate) {
    const schedule = getSchedule(specialistId);
    if (!schedule || !isoDate) {
      return [];
    }

    const date = new Date(isoDate + "T12:00:00");
    const weekDay = date.getDay();
    if (!schedule.workingDays.includes(weekDay) || schedule.blockedDates.includes(isoDate)) {
      return [];
    }

    const busySlots = state.appointments
      .filter(function (appointment) {
        return (
          appointment.specialistId === specialistId &&
          appointment.date === isoDate &&
          appointment.status !== "cancelled"
        );
      })
      .map(function (appointment) {
        return appointment.time;
      });

    return schedule.slots.filter(function (slot) {
      return !busySlots.includes(slot);
    });
  }

  function getUpcomingDates(specialistId) {
    const dates = [];
    for (let index = 0; index < 12; index += 1) {
      const iso = Seed.daysFromNow(index);
      dates.push({
        iso: iso,
        enabled: getAvailableSlots(specialistId, iso).length > 0,
      });
    }
    return dates;
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    elements.toastArea.appendChild(toast);

    window.setTimeout(function () {
      toast.remove();
    }, 3400);
  }

  function openModal(modal) {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal) {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".modal.is-open")) {
      document.body.style.overflow = "";
    }
  }

  function renderHero() {
    const hero = state.site.hero;
    const banner = state.site.banner;
    elements.heroEyebrow.textContent = hero.eyebrow;
    elements.heroTitle.textContent = hero.title;
    elements.heroText.textContent = hero.text;
    elements.bannerTitle.textContent = banner.title;
    elements.bannerText.textContent = banner.text;
    elements.bannerLinkLabel.textContent = banner.linkLabel;
    elements.heroMetrics.innerHTML = state.site.metrics
      .map(function (item) {
        return (
          '<article class="metric-card"><strong>' +
          escapeHtml(item.value) +
          "</strong><span>" +
          escapeHtml(item.label) +
          "</span></article>"
        );
      })
      .join("");

    elements.quickServiceSelect.innerHTML = state.services
      .map(function (service) {
        return '<option value="' + escapeHtml(service.id) + '">' + escapeHtml(service.name) + "</option>";
      })
      .join("");
  }

  function renderAdvantages() {
    elements.advantageGrid.innerHTML = state.site.advantages
      .map(function (advantage, index) {
        return (
          '<article class="advantage-card glass-card"><strong>0' +
          (index + 1) +
          "</strong><h3>" +
          escapeHtml(advantage.title) +
          "</h3><p>" +
          escapeHtml(advantage.text) +
          "</p></article>"
        );
      })
      .join("");
  }

  function renderServiceFilters() {
    const buttons = ['<button class="chip-button' + (serviceFilter === "all" ? " is-active" : "") + '" type="button" data-service-filter="all">Все услуги</button>'];
    state.categories.forEach(function (category) {
      buttons.push(
        '<button class="chip-button' +
          (serviceFilter === category.id ? " is-active" : "") +
          '" type="button" data-service-filter="' +
          escapeHtml(category.id) +
          '">' +
          escapeHtml(category.name) +
          "</button>"
      );
    });
    elements.serviceFilters.innerHTML = buttons.join("");
  }

  function renderServices() {
    renderServiceFilters();

    const collection = state.services.filter(function (service) {
      return serviceFilter === "all" || service.categoryId === serviceFilter;
    });

    if (!collection.length) {
      elements.serviceGrid.innerHTML = createEmptyState("В этой категории пока нет услуг.");
      return;
    }

    elements.serviceGrid.innerHTML = collection
      .map(function (service) {
        const category = getCategory(service.categoryId);
        return (
          '<article class="service-card"><div class="card-topline"><span class="pill">' +
          escapeHtml(category ? category.name : "Категория") +
          '</span><span class="tagline-pill">' +
          escapeHtml(service.accent) +
          "</span></div><h3>" +
          escapeHtml(service.name) +
          "</h3><p>" +
          escapeHtml(service.teaser) +
          '</p><div class="service-meta"><span>' +
          escapeHtml(Seed.formatMoney(service.price)) +
          "</span><span>" +
          escapeHtml(service.duration) +
          '</span></div><div class="card-actions"><button class="action-link" type="button" data-service-detail="' +
          escapeHtml(service.id) +
          '">Подробнее</button><button class="button button-secondary" type="button" data-book-service="' +
          escapeHtml(service.id) +
          '">Записаться</button></div></article>'
        );
      })
      .join("");
  }

  function renderSpecialists() {
    elements.specialistGrid.innerHTML = state.specialists
      .map(function (specialist) {
        return (
          '<article class="specialist-card"><div class="specialist-portrait"><img src="' +
          escapeHtml(specialist.image) +
          '" alt="' +
          escapeHtml(specialist.name) +
          '" /></div><h3>' +
          escapeHtml(specialist.name) +
          "</h3><p>" +
          escapeHtml(specialist.role) +
          '</p><div class="specialist-meta"><span>' +
          escapeHtml(String(specialist.experience) + " лет практики") +
          "</span><span>" +
          escapeHtml(specialist.tagline) +
          '</span></div><div class="card-actions"><button class="action-link" type="button" data-specialist-detail="' +
          escapeHtml(specialist.id) +
          '">Карточка специалиста</button><button class="button button-secondary" type="button" data-book-specialist="' +
          escapeHtml(specialist.id) +
          '">Выбрать специалиста</button></div></article>'
        );
      })
      .join("");
  }

  function renderPortfolioFilters() {
    const buttons = ['<button class="chip-button' + (portfolioFilter === "all" ? " is-active" : "") + '" type="button" data-portfolio-filter="all">Все направления</button>'];
    state.categories.forEach(function (category) {
      buttons.push(
        '<button class="chip-button' +
          (portfolioFilter === category.id ? " is-active" : "") +
          '" type="button" data-portfolio-filter="' +
          escapeHtml(category.id) +
          '">' +
          escapeHtml(category.name) +
          "</button>"
      );
    });
    elements.portfolioFilters.innerHTML = buttons.join("");
  }

  function renderPortfolio() {
    renderPortfolioFilters();

    const collection = state.portfolio.filter(function (item) {
      const service = getService(item.serviceId);
      return portfolioFilter === "all" || (service && service.categoryId === portfolioFilter);
    });

    if (!collection.length) {
      elements.portfolioGrid.innerHTML = createEmptyState("Нет работ для выбранного фильтра.");
      return;
    }

    elements.portfolioGrid.innerHTML = collection
      .map(function (item) {
        const service = getService(item.serviceId);
        const specialist = getSpecialist(item.specialistId);
        return (
          '<article class="portfolio-card"><div class="portfolio-visual"><img src="' +
          escapeHtml(item.image) +
          '" alt="' +
          escapeHtml(item.title) +
          '" /><div class="before-after-labels"><span>До</span><span>После</span></div></div><div><span class="pill">' +
          escapeHtml(service ? service.name : "Процедура") +
          "</span><h3>" +
          escapeHtml(item.title) +
          "</h3><p>" +
          escapeHtml(item.summary) +
          '</p><div class="specialist-meta"><span>' +
          escapeHtml(specialist ? specialist.name : "") +
          "</span></div></div></article>"
        );
      })
      .join("");
  }

  function renderReviews() {
    const reviews = getApprovedReviews()
      .slice()
      .sort(function (left, right) {
        return right.date.localeCompare(left.date);
      });

    if (!reviews.length) {
      elements.reviewGrid.innerHTML = createEmptyState("Пока нет опубликованных отзывов.");
      return;
    }

    elements.reviewGrid.innerHTML = reviews
      .map(function (review) {
        return (
          '<article class="review-card"><div class="review-meta"><strong>' +
          escapeHtml(review.name) +
          "</strong><span>" +
          escapeHtml(formatShortDate(review.date)) +
          '</span><span class="stars">' +
          escapeHtml(stars(review.rating)) +
          "</span></div><p>" +
          escapeHtml(review.text) +
          "</p>" +
          (review.photoHint ? '<span class="pill">' + escapeHtml(review.photoHint) + "</span>" : "") +
          "</article>"
        );
      })
      .join("");
  }

  function renderPromotions() {
    elements.promotionGrid.innerHTML = state.promotions
      .map(function (promotion) {
        return (
          '<article class="promotion-card"><span class="tagline-pill">' +
          escapeHtml(promotion.badge) +
          "</span><h3>" +
          escapeHtml(promotion.title) +
          "</h3><p>" +
          escapeHtml(promotion.description) +
          '</p><div class="service-meta"><span>До ' +
          escapeHtml(formatShortDate(promotion.validUntil)) +
          '</span></div><div class="card-actions"><button class="button button-secondary" type="button" data-open-booking>Использовать акцию</button></div></article>'
        );
      })
      .join("");
  }

  function renderContacts() {
    const contacts = state.site.contacts;
    elements.contactAddress.textContent = contacts.address;
    elements.contactPhone.textContent = contacts.phone;
    elements.contactPhone.href = "tel:" + contacts.phone.replace(/[^\d+]/g, "");
    elements.contactEmail.textContent = contacts.email;
    elements.contactEmail.href = "mailto:" + contacts.email;
    elements.contactHours.textContent = contacts.hours;
  }

  function renderServiceDetail(service) {
    const category = getCategory(service.categoryId);
    const specialists = getServiceSpecialists(service.id);
    return (
      '<div class="detail-layout"><div class="detail-copy"><span class="pill">' +
      escapeHtml(category ? category.name : "Услуга") +
      "</span><h2>" +
      escapeHtml(service.name) +
      "</h2><p>" +
      escapeHtml(service.description) +
      '</p><div class="service-meta"><span>' +
      escapeHtml(Seed.formatMoney(service.price)) +
      "</span><span>" +
      escapeHtml(service.duration) +
      '</span></div></div><div class="detail-grid"><div class="detail-box"><h3>Показания</h3><ul class="plain-list">' +
      service.indications
        .map(function (item) {
          return "<li>" + escapeHtml(item) + "</li>";
        })
        .join("") +
      '</ul></div><div class="detail-box"><h3>Противопоказания</h3><ul class="plain-list">' +
      service.contraindications
        .map(function (item) {
          return "<li>" + escapeHtml(item) + "</li>";
        })
        .join("") +
      '</ul></div></div><div class="detail-box"><h3>Специалисты</h3><div class="card-actions">' +
      specialists
        .map(function (specialist) {
          return '<span class="pill">' + escapeHtml(specialist.name) + "</span>";
        })
        .join("") +
      '</div></div><div class="card-actions"><button class="button button-primary" type="button" data-book-service="' +
      escapeHtml(service.id) +
      '">Перейти к записи</button></div></div>'
    );
  }

  function renderSpecialistDetail(specialist) {
    const services = state.services.filter(function (service) {
      return service.specialistIds.includes(specialist.id);
    });

    return (
      '<div class="detail-layout"><div class="detail-hero"><div class="detail-visual"><img src="' +
      escapeHtml(specialist.image) +
      '" alt="' +
      escapeHtml(specialist.name) +
      '" /></div><div class="detail-copy"><span class="pill">' +
      escapeHtml(specialist.role) +
      "</span><h2>" +
      escapeHtml(specialist.name) +
      "</h2><p>" +
      escapeHtml(specialist.about) +
      '</p><div class="service-meta"><span>' +
      escapeHtml(String(specialist.experience) + " лет практики") +
      "</span></div></div></div><div class=\"detail-grid\"><div class=\"detail-box\"><h3>Образование и сертификаты</h3><ul class=\"plain-list\">" +
      specialist.education
        .map(function (item) {
          return "<li>" + escapeHtml(item) + "</li>";
        })
        .join("") +
      '</ul></div><div class="detail-box"><h3>Направления работы</h3><ul class="plain-list">' +
      specialist.focus
        .map(function (item) {
          return "<li>" + escapeHtml(item) + "</li>";
        })
        .join("") +
      '</ul></div></div><div class="detail-box"><h3>Услуги специалиста</h3><div class="card-actions">' +
      services
        .map(function (service) {
          return '<button class="chip-button" type="button" data-book-service="' + escapeHtml(service.id) + '">' + escapeHtml(service.name) + "</button>";
        })
        .join("") +
      '</div></div><div class="card-actions"><button class="button button-primary" type="button" data-book-specialist="' +
      escapeHtml(specialist.id) +
      '">Выбрать специалиста</button></div></div>'
    );
  }

  function openDetail(type, id) {
    const item = type === "service" ? getService(id) : getSpecialist(id);
    if (!item) {
      return;
    }

    elements.detailContent.innerHTML =
      type === "service" ? renderServiceDetail(item) : renderSpecialistDetail(item);
    openModal(elements.detailModal);
  }

  function renderBookingProgress() {
    elements.bookingProgress.innerHTML = bookingLabels
      .map(function (label, index) {
        const step = index + 1;
        const className =
          step === booking.step ? "progress-step is-active" : step < booking.step ? "progress-step is-complete" : "progress-step";
        return '<div class="' + className + '"><strong>0' + step + "</strong><div>" + escapeHtml(label) + "</div></div>";
      })
      .join("");
  }

  function renderBookingStage() {
    renderBookingProgress();
    elements.bookingBack.style.visibility = booking.step === 1 ? "hidden" : "visible";
    elements.bookingNext.textContent = booking.step === 5 ? "Подтвердить запись" : "Далее";

    if (booking.step === 1) {
      elements.bookingStage.innerHTML =
        '<div class="booking-stage"><h2>Выберите услугу</h2><div class="booking-select-grid">' +
        state.services
          .map(function (service) {
            return (
              '<button class="select-card' +
              (booking.serviceId === service.id ? " is-selected" : "") +
              '" type="button" data-select-service="' +
              escapeHtml(service.id) +
              '"><span class="pill">' +
              escapeHtml(Seed.formatMoney(service.price)) +
              "</span><h3>" +
              escapeHtml(service.name) +
              "</h3><p>" +
              escapeHtml(service.teaser) +
              "</p></button>"
            );
          })
          .join("") +
        "</div></div>";
      return;
    }

    if (booking.step === 2) {
      const specialists = getServiceSpecialists(booking.serviceId);
      elements.bookingStage.innerHTML =
        '<div class="booking-stage"><h2>Выберите специалиста</h2>' +
        (specialists.length
          ? '<div class="booking-select-grid">' +
            specialists
              .map(function (specialist) {
                return (
                  '<button class="select-card' +
                  (booking.specialistId === specialist.id ? " is-selected" : "") +
                  '" type="button" data-select-specialist="' +
                  escapeHtml(specialist.id) +
                  '"><span class="pill">' +
                  escapeHtml(String(specialist.experience) + " лет") +
                  "</span><h3>" +
                  escapeHtml(specialist.name) +
                  "</h3><p>" +
                  escapeHtml(specialist.tagline) +
                  "</p></button>"
                );
              })
              .join("") +
            "</div>"
          : createEmptyState("Для этой услуги пока нет доступного специалиста.")) +
        "</div>";
      return;
    }

    if (booking.step === 3) {
      const dates = booking.specialistId ? getUpcomingDates(booking.specialistId) : [];
      const slots = booking.specialistId && booking.date ? getAvailableSlots(booking.specialistId, booking.date) : [];

      elements.bookingStage.innerHTML =
        '<div class="booking-stage"><h2>Выберите дату и время</h2><div class="booking-box"><strong>Даты</strong><div class="date-grid">' +
        dates
          .map(function (entry) {
            return (
              '<button class="date-chip' +
              (booking.date === entry.iso ? " is-selected" : "") +
              '" type="button" data-select-date="' +
              escapeHtml(entry.iso) +
              '"' +
              (entry.enabled ? "" : " disabled") +
              ">" +
              escapeHtml(formatDate(entry.iso)) +
              "</button>"
            );
          })
          .join("") +
        '</div></div><div class="booking-box"><strong>Свободные слоты</strong><div class="slot-grid">' +
        (slots.length
          ? slots
              .map(function (slot) {
                return (
                  '<button class="slot-chip' +
                  (booking.time === slot ? " is-selected" : "") +
                  '" type="button" data-select-time="' +
                  escapeHtml(slot) +
                  '">' +
                  escapeHtml(slot) +
                  "</button>"
                );
              })
              .join("")
          : createEmptyState("Сначала выберите доступную дату.")) +
        "</div></div></div>";
      return;
    }

    if (booking.step === 4) {
      elements.bookingStage.innerHTML =
        '<div class="booking-stage"><h2>Контактные данные</h2><label><span>ФИО</span><input type="text" name="fullName" value="' +
        escapeHtml(booking.client.fullName) +
        '" /></label><label><span>Телефон</span><input type="tel" name="phone" value="' +
        escapeHtml(booking.client.phone) +
        '" /></label><label><span>E-mail</span><input type="email" name="email" value="' +
        escapeHtml(booking.client.email) +
        '" /></label><label><span>Комментарий</span><textarea name="comment" rows="4">' +
        escapeHtml(booking.client.comment) +
        '</textarea></label><label class="checkbox"><input type="checkbox" name="consent" ' +
        (booking.client.consent ? "checked" : "") +
        ' /><span>Согласен на обработку персональных данных</span></label></div>';
      return;
    }

    const service = getService(booking.serviceId);
    const specialist = getSpecialist(booking.specialistId);
    elements.bookingStage.innerHTML =
      '<div class="booking-stage"><h2>Проверьте данные</h2><div class="summary-grid"><div class="booking-box"><strong>Услуга</strong><p>' +
      escapeHtml(service ? service.name : "") +
      '</p></div><div class="booking-box"><strong>Специалист</strong><p>' +
      escapeHtml(specialist ? specialist.name : "") +
      '</p></div><div class="booking-box"><strong>Дата</strong><p>' +
      escapeHtml(formatDate(booking.date)) +
      '</p></div><div class="booking-box"><strong>Время</strong><p>' +
      escapeHtml(booking.time) +
      '</p></div><div class="booking-box"><strong>Контакты</strong><p>' +
      escapeHtml(booking.client.fullName) +
      "<br />" +
      escapeHtml(booking.client.phone) +
      '</p></div><div class="booking-box"><strong>Комментарий</strong><p>' +
      escapeHtml(booking.client.comment || "Без комментария") +
      "</p></div></div></div>";
  }

  function openBooking(prefill) {
    closeModal(elements.detailModal);
    booking = createBookingState();
    if (prefill) {
      booking.serviceId = prefill.serviceId || "";
      booking.specialistId = prefill.specialistId || "";
      booking.client.fullName = prefill.fullName || "";
      booking.client.phone = prefill.phone || "";
      booking.client.email = prefill.email || "";
      booking.client.comment = prefill.comment || "";
      booking.client.consent = !!prefill.consent;

      if (booking.serviceId && booking.specialistId) {
        booking.step = 3;
      } else if (booking.serviceId) {
        booking.step = 2;
      }
    }

    renderBookingStage();
    openModal(elements.bookingModal);
  }

  function closeBooking() {
    closeModal(elements.bookingModal);
    booking = createBookingState();
  }

  function validateBookingStep() {
    if (booking.step === 1 && !booking.serviceId) {
      showToast("Сначала выбери услугу.");
      return false;
    }

    if (booking.step === 2 && !booking.specialistId) {
      showToast("Выбери специалиста.");
      return false;
    }

    if (booking.step === 3 && (!booking.date || !booking.time)) {
      showToast("Нужно выбрать дату и время.");
      return false;
    }

    if (booking.step === 4) {
      if (!booking.client.fullName.trim() || !booking.client.phone.trim()) {
        showToast("Заполни ФИО и телефон.");
        return false;
      }

      if (!booking.client.consent) {
        showToast("Подтверди согласие на обработку данных.");
        return false;
      }
    }

    return true;
  }

  function submitBooking() {
    Store.upsert("appointments", {
      id: Seed.createId("appointment"),
      serviceId: booking.serviceId,
      specialistId: booking.specialistId,
      date: booking.date,
      time: booking.time,
      fullName: booking.client.fullName.trim(),
      phone: booking.client.phone.trim(),
      email: booking.client.email.trim(),
      comment: booking.client.comment.trim(),
      status: "new",
      createdAt: new Date().toISOString(),
    });

    state = Store.getState();
    showToast("Запись сохранена. Администратор увидит её в панели управления.");
    closeBooking();
  }

  function handleBookingNext() {
    if (booking.step === 5) {
      submitBooking();
      return;
    }

    if (!validateBookingStep()) {
      return;
    }

    booking.step += 1;
    renderBookingStage();
  }

  function handleBookingBack() {
    if (booking.step > 1) {
      booking.step -= 1;
      renderBookingStage();
    }
  }

  function renderAll() {
    state = Store.getState();
    renderHero();
    renderAdvantages();
    renderServices();
    renderSpecialists();
    renderPortfolio();
    renderReviews();
    renderPromotions();
    renderContacts();
    renderBookingStage();
  }

  function bindGlobalEvents() {
    document.addEventListener("click", function (event) {
      const target = event.target;
      const serviceDetailButton = target.closest("[data-service-detail]");
      const specialistDetailButton = target.closest("[data-specialist-detail]");
      const bookServiceButton = target.closest("[data-book-service]");
      const bookSpecialistButton = target.closest("[data-book-specialist]");
      const openBookingButton = target.closest("[data-open-booking]");
      const closeDetailButton = target.closest("[data-close-modal]");
      const closeBookingButton = target.closest("[data-close-booking]");
      const serviceFilterButton = target.closest("[data-service-filter]");
      const portfolioFilterButton = target.closest("[data-portfolio-filter]");
      const selectServiceButton = target.closest("[data-select-service]");
      const selectSpecialistButton = target.closest("[data-select-specialist]");
      const selectDateButton = target.closest("[data-select-date]");
      const selectTimeButton = target.closest("[data-select-time]");

      if (serviceDetailButton) {
        openDetail("service", serviceDetailButton.getAttribute("data-service-detail"));
      }

      if (specialistDetailButton) {
        openDetail("specialist", specialistDetailButton.getAttribute("data-specialist-detail"));
      }

      if (bookServiceButton) {
        openBooking({
          serviceId: bookServiceButton.getAttribute("data-book-service"),
        });
      }

      if (bookSpecialistButton) {
        openBooking({
          specialistId: bookSpecialistButton.getAttribute("data-book-specialist"),
        });
      }

      if (openBookingButton) {
        openBooking();
      }

      if (closeDetailButton) {
        closeModal(elements.detailModal);
      }

      if (closeBookingButton) {
        closeBooking();
      }

      if (serviceFilterButton) {
        serviceFilter = serviceFilterButton.getAttribute("data-service-filter");
        renderServices();
      }

      if (portfolioFilterButton) {
        portfolioFilter = portfolioFilterButton.getAttribute("data-portfolio-filter");
        renderPortfolio();
      }

      if (selectServiceButton) {
        booking.serviceId = selectServiceButton.getAttribute("data-select-service");
        if (!getServiceSpecialists(booking.serviceId).some(function (item) { return item.id === booking.specialistId; })) {
          booking.specialistId = "";
        }
        booking.date = "";
        booking.time = "";
        renderBookingStage();
      }

      if (selectSpecialistButton) {
        booking.specialistId = selectSpecialistButton.getAttribute("data-select-specialist");
        booking.date = "";
        booking.time = "";
        renderBookingStage();
      }

      if (selectDateButton && !selectDateButton.disabled) {
        booking.date = selectDateButton.getAttribute("data-select-date");
        booking.time = "";
        renderBookingStage();
      }

      if (selectTimeButton) {
        booking.time = selectTimeButton.getAttribute("data-select-time");
        renderBookingStage();
      }
    });

    elements.bookingBack.addEventListener("click", handleBookingBack);
    elements.bookingNext.addEventListener("click", handleBookingNext);

    elements.quickBookingForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      openBooking({
        serviceId: String(form.get("serviceId") || ""),
        fullName: String(form.get("name") || ""),
        phone: String(form.get("phone") || ""),
        consent: form.get("consent") === "on",
      });
    });

    elements.reviewForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const form = new FormData(event.currentTarget);

      Store.upsert("reviews", {
        id: Seed.createId("review"),
        name: String(form.get("name") || "").trim(),
        rating: Number(form.get("rating") || 5),
        text: String(form.get("text") || "").trim(),
        photoHint: String(form.get("photoHint") || "").trim(),
        date: Seed.toIsoDate(new Date()),
        status: "pending",
      });

      event.currentTarget.reset();
      state = Store.getState();
      renderReviews();
      showToast("Спасибо. Отзыв отправлен на модерацию.");
    });

    elements.bookingStage.addEventListener("input", function (event) {
      const target = event.target;
      if (!target.name) {
        return;
      }

      if (target.name === "consent") {
        booking.client.consent = target.checked;
        return;
      }

      booking.client[target.name] = target.value;
    });

    elements.navToggle.addEventListener("click", function () {
      const expanded = elements.navToggle.getAttribute("aria-expanded") === "true";
      elements.navToggle.setAttribute("aria-expanded", String(!expanded));
      elements.siteNav.classList.toggle("is-open");
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeModal(elements.detailModal);
        closeBooking();
      }
    });
  }

  renderAll();
  bindGlobalEvents();
})();
