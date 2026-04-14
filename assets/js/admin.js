(function () {
  const Seed = window.BeautyLabSeed;
  const Store = window.BeautyLabStore;
  const page = document.getElementById("loginForm");

  if (!Seed || !Store || !page) {
    return;
  }

  const SESSION_KEY = "beauty-lab-admin-session";
  let state = Store.getState();
  let activePanel = "dashboard";

  const elements = {
    loginScreen: document.getElementById("loginScreen"),
    adminApp: document.getElementById("adminApp"),
    loginForm: document.getElementById("loginForm"),
    logoutButton: document.getElementById("logoutButton"),
    resetDemoData: document.getElementById("resetDemoData"),
    adminNav: document.getElementById("adminNav"),
    dashboardStats: document.getElementById("dashboardStats"),
    recentAppointments: document.getElementById("recentAppointments"),
    pendingReviews: document.getElementById("pendingReviews"),
    serviceForm: document.getElementById("serviceForm"),
    categoryForm: document.getElementById("categoryForm"),
    specialistForm: document.getElementById("specialistForm"),
    portfolioForm: document.getElementById("portfolioForm"),
    promotionForm: document.getElementById("promotionForm"),
    homepageForm: document.getElementById("homepageForm"),
    serviceCategorySelect: document.getElementById("serviceCategorySelect"),
    serviceSpecialistSelect: document.getElementById("serviceSpecialistSelect"),
    portfolioServiceSelect: document.getElementById("portfolioServiceSelect"),
    portfolioSpecialistSelect: document.getElementById("portfolioSpecialistSelect"),
    categoryList: document.getElementById("categoryList"),
    serviceList: document.getElementById("serviceList"),
    specialistList: document.getElementById("specialistList"),
    portfolioList: document.getElementById("portfolioList"),
    reviewModerationList: document.getElementById("reviewModerationList"),
    promotionList: document.getElementById("promotionList"),
    appointmentTable: document.getElementById("appointmentTable"),
    appointmentStatusFilter: document.getElementById("appointmentStatusFilter"),
    appointmentSpecialistFilter: document.getElementById("appointmentSpecialistFilter"),
    appointmentDateFilter: document.getElementById("appointmentDateFilter"),
    exportAppointments: document.getElementById("exportAppointments"),
    scheduleList: document.getElementById("scheduleList"),
    toastArea: document.getElementById("adminToastArea"),
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(value) {
    if (!value) {
      return "Не указано";
    }
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
    }).format(new Date(value + "T12:00:00"));
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    elements.toastArea.appendChild(toast);
    setTimeout(function () {
      toast.remove();
    }, 3400);
  }

  function getSession() {
    try {
      return window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  function setSession(value) {
    try {
      if (value) {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } else {
        window.sessionStorage.removeItem(SESSION_KEY);
      }
    } catch (error) {
      return;
    }
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

  function getStatusLabel(status) {
    if (status === "confirmed") {
      return "Подтверждена";
    }
    if (status === "cancelled") {
      return "Отменена";
    }
    return "Новая";
  }

  function getStatusClass(status) {
    return "status-pill status-" + (status || "new");
  }

  function linesToArray(value) {
    return String(value || "")
      .split(/\r?\n/)
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  function selectedValues(select) {
    return Array.from(select.selectedOptions).map(function (option) {
      return option.value;
    });
  }

  function parseAdvantages(value) {
    return linesToArray(value).map(function (line) {
      const parts = line.split("|");
      return {
        title: (parts[0] || "").trim(),
        text: (parts[1] || "Описание преимущества").trim(),
      };
    });
  }

  function activatePanel(panelName) {
    activePanel = panelName;
    document.querySelectorAll(".admin-nav-link").forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-panel-target") === panelName);
    });
    document.querySelectorAll(".admin-panel").forEach(function (panel) {
      panel.classList.toggle("is-active", panel.getAttribute("data-panel") === panelName);
    });
  }

  function updateAuthView() {
    const loggedIn = getSession();
    elements.loginScreen.hidden = loggedIn;
    elements.adminApp.hidden = !loggedIn;

    if (loggedIn) {
      renderAll();
      activatePanel(activePanel);
    }
  }

  function fillSelectOptions() {
    elements.serviceCategorySelect.innerHTML = state.categories
      .map(function (category) {
        return '<option value="' + escapeHtml(category.id) + '">' + escapeHtml(category.name) + "</option>";
      })
      .join("");

    const specialistOptions = state.specialists
      .map(function (specialist) {
        return '<option value="' + escapeHtml(specialist.id) + '">' + escapeHtml(specialist.name) + "</option>";
      })
      .join("");

    elements.serviceSpecialistSelect.innerHTML = specialistOptions;
    elements.portfolioSpecialistSelect.innerHTML = specialistOptions;
    elements.portfolioServiceSelect.innerHTML = state.services
      .map(function (service) {
        return '<option value="' + escapeHtml(service.id) + '">' + escapeHtml(service.name) + "</option>";
      })
      .join("");

    const currentSpecialistFilter = elements.appointmentSpecialistFilter.value || "all";
    elements.appointmentSpecialistFilter.innerHTML =
      '<option value="all">Все специалисты</option>' +
      specialistOptions;
    elements.appointmentSpecialistFilter.value = currentSpecialistFilter;
    if (!elements.appointmentSpecialistFilter.value) {
      elements.appointmentSpecialistFilter.value = "all";
    }
  }

  function resetServiceForm() {
    elements.serviceForm.reset();
    elements.serviceForm.querySelector('[name="id"]').value = "";
  }

  function resetCategoryForm() {
    elements.categoryForm.reset();
    elements.categoryForm.querySelector('[name="id"]').value = "";
  }

  function resetSpecialistForm() {
    elements.specialistForm.reset();
    elements.specialistForm.querySelector('[name="id"]').value = "";
  }

  function resetPortfolioForm() {
    elements.portfolioForm.reset();
    elements.portfolioForm.querySelector('[name="id"]').value = "";
  }

  function resetPromotionForm() {
    elements.promotionForm.reset();
    elements.promotionForm.querySelector('[name="id"]').value = "";
  }

  function renderDashboard() {
    const pendingReviews = state.reviews.filter(function (review) {
      return review.status === "pending";
    });
    const newAppointments = state.appointments.filter(function (appointment) {
      return appointment.status === "new";
    });

    elements.dashboardStats.innerHTML =
      '<article class="stat-card"><span>Услуги</span><strong>' +
      state.services.length +
      '</strong></article><article class="stat-card"><span>Специалисты</span><strong>' +
      state.specialists.length +
      '</strong></article><article class="stat-card"><span>Новые записи</span><strong>' +
      newAppointments.length +
      '</strong></article><article class="stat-card"><span>Отзывы на модерации</span><strong>' +
      pendingReviews.length +
      "</strong></article>";

    const recentAppointments = state.appointments
      .slice()
      .sort(function (left, right) {
        return (right.createdAt || "").localeCompare(left.createdAt || "");
      })
      .slice(0, 5);

    elements.recentAppointments.innerHTML = recentAppointments.length
      ? recentAppointments
          .map(function (appointment) {
            const service = getService(appointment.serviceId);
            const specialist = getSpecialist(appointment.specialistId);
            return (
              '<div class="list-row"><h4>' +
              escapeHtml(appointment.fullName) +
              "</h4><p>" +
              escapeHtml(service ? service.name : "Без услуги") +
              " • " +
              escapeHtml(specialist ? specialist.name : "Без специалиста") +
              '</p><div class="row-meta"><span class="' +
              getStatusClass(appointment.status) +
              '">' +
              escapeHtml(getStatusLabel(appointment.status)) +
              "</span><span>" +
              escapeHtml(formatDate(appointment.date)) +
              " " +
              escapeHtml(appointment.time || "") +
              "</span></div></div>"
            );
          })
          .join("")
      : '<div class="empty-state">Записей пока нет.</div>';

    elements.pendingReviews.innerHTML = pendingReviews.length
      ? pendingReviews
          .map(function (review) {
            return (
              '<div class="list-row"><h4>' +
              escapeHtml(review.name) +
              '</h4><p>' +
              escapeHtml(review.text) +
              '</p><div class="row-actions"><button class="row-action" type="button" data-action="approve-review" data-id="' +
              escapeHtml(review.id) +
              '">Опубликовать</button><button class="row-action" type="button" data-action="decline-review" data-id="' +
              escapeHtml(review.id) +
              '">Отклонить</button></div></div>'
            );
          })
          .join("")
      : '<div class="empty-state">На модерации сейчас ничего нет.</div>';
  }

  function renderServicesSection() {
    elements.categoryList.innerHTML = state.categories
      .map(function (category) {
        return (
          '<div class="list-row"><h4>' +
          escapeHtml(category.name) +
          '</h4><p>' +
          escapeHtml(category.description) +
          '</p><div class="row-actions"><button class="row-action" type="button" data-action="edit-category" data-id="' +
          escapeHtml(category.id) +
          '">Редактировать</button><button class="row-action" type="button" data-action="delete-category" data-id="' +
          escapeHtml(category.id) +
          '">Удалить</button></div></div>'
        );
      })
      .join("");

    elements.serviceList.innerHTML = state.services
      .map(function (service) {
        return (
          '<div class="list-row"><h4>' +
          escapeHtml(service.name) +
          '</h4><p>' +
          escapeHtml(service.teaser) +
          '</p><div class="row-meta"><span>' +
          escapeHtml(Seed.formatMoney(service.price)) +
          "</span><span>" +
          escapeHtml(service.duration) +
          '</span></div><div class="row-actions"><button class="row-action" type="button" data-action="edit-service" data-id="' +
          escapeHtml(service.id) +
          '">Редактировать</button><button class="row-action" type="button" data-action="delete-service" data-id="' +
          escapeHtml(service.id) +
          '">Удалить</button></div></div>'
        );
      })
      .join("");
  }

  function renderSpecialistsSection() {
    elements.specialistList.innerHTML = state.specialists
      .map(function (specialist) {
        return (
          '<div class="list-row"><h4>' +
          escapeHtml(specialist.name) +
          '</h4><p>' +
          escapeHtml(specialist.role) +
          '</p><div class="row-meta"><span>' +
          escapeHtml(String(specialist.experience) + " лет практики") +
          '</span></div><div class="row-actions"><button class="row-action" type="button" data-action="edit-specialist" data-id="' +
          escapeHtml(specialist.id) +
          '">Редактировать</button><button class="row-action" type="button" data-action="delete-specialist" data-id="' +
          escapeHtml(specialist.id) +
          '">Удалить</button></div></div>'
        );
      })
      .join("");
  }

  function renderPortfolioSection() {
    elements.portfolioList.innerHTML = state.portfolio
      .map(function (item) {
        const service = getService(item.serviceId);
        const specialist = getSpecialist(item.specialistId);
        return (
          '<div class="list-row"><h4>' +
          escapeHtml(item.title) +
          '</h4><p>' +
          escapeHtml(item.summary) +
          '</p><div class="row-meta"><span>' +
          escapeHtml(service ? service.name : "") +
          "</span><span>" +
          escapeHtml(specialist ? specialist.name : "") +
          '</span></div><div class="row-actions"><button class="row-action" type="button" data-action="edit-portfolio" data-id="' +
          escapeHtml(item.id) +
          '">Редактировать</button><button class="row-action" type="button" data-action="delete-portfolio" data-id="' +
          escapeHtml(item.id) +
          '">Удалить</button></div></div>'
        );
      })
      .join("");
  }

  function renderReviewsSection() {
    const items = state.reviews
      .slice()
      .sort(function (left, right) {
        return (right.date || "").localeCompare(left.date || "");
      });

    elements.reviewModerationList.innerHTML = items.length
      ? items
          .map(function (review) {
            return (
              '<div class="list-row"><h4>' +
              escapeHtml(review.name) +
              '</h4><p>' +
              escapeHtml(review.text) +
              '</p><div class="row-meta"><span class="' +
              getStatusClass(review.status === "approved" ? "confirmed" : review.status === "declined" ? "cancelled" : "new") +
              '">' +
              escapeHtml(review.status) +
              '</span><span>' +
              escapeHtml(formatDate(review.date)) +
              '</span></div><div class="row-actions"><button class="row-action" type="button" data-action="approve-review" data-id="' +
              escapeHtml(review.id) +
              '">Опубликовать</button><button class="row-action" type="button" data-action="decline-review" data-id="' +
              escapeHtml(review.id) +
              '">Отклонить</button><button class="row-action" type="button" data-action="delete-review" data-id="' +
              escapeHtml(review.id) +
              '">Удалить</button></div></div>'
            );
          })
          .join("")
      : '<div class="empty-state">Отзывов пока нет.</div>';
  }

  function renderPromotionsSection() {
    elements.promotionList.innerHTML = state.promotions
      .map(function (promotion) {
        return (
          '<div class="list-row"><h4>' +
          escapeHtml(promotion.title) +
          '</h4><p>' +
          escapeHtml(promotion.description) +
          '</p><div class="row-meta"><span>' +
          escapeHtml(promotion.badge) +
          "</span><span>До " +
          escapeHtml(formatDate(promotion.validUntil)) +
          '</span></div><div class="row-actions"><button class="row-action" type="button" data-action="edit-promotion" data-id="' +
          escapeHtml(promotion.id) +
          '">Редактировать</button><button class="row-action" type="button" data-action="delete-promotion" data-id="' +
          escapeHtml(promotion.id) +
          '">Удалить</button></div></div>'
        );
      })
      .join("");
  }

  function getFilteredAppointments() {
    const status = elements.appointmentStatusFilter.value;
    const specialistId = elements.appointmentSpecialistFilter.value;
    const date = elements.appointmentDateFilter.value;

    return state.appointments.filter(function (appointment) {
      const matchesStatus = status === "all" || appointment.status === status;
      const matchesSpecialist = specialistId === "all" || appointment.specialistId === specialistId;
      const matchesDate = !date || appointment.date === date;
      return matchesStatus && matchesSpecialist && matchesDate;
    });
  }

  function renderAppointmentsSection() {
    const items = getFilteredAppointments()
      .slice()
      .sort(function (left, right) {
        return (left.date || "").localeCompare(right.date || "");
      });

    elements.appointmentTable.innerHTML = items.length
      ? '<div class="appointment-table">' +
        items
          .map(function (appointment) {
            const service = getService(appointment.serviceId);
            const specialist = getSpecialist(appointment.specialistId);
            return (
              '<div class="appointment-row"><div class="appointment-header"><div><h4>' +
              escapeHtml(appointment.fullName) +
              '</h4><p>' +
              escapeHtml(service ? service.name : "Без услуги") +
              " • " +
              escapeHtml(specialist ? specialist.name : "Без специалиста") +
              '</p></div><span class="' +
              getStatusClass(appointment.status) +
              '">' +
              escapeHtml(getStatusLabel(appointment.status)) +
              '</span></div><div class="appointment-meta"><span>' +
              escapeHtml(formatDate(appointment.date)) +
              " " +
              escapeHtml(appointment.time || "") +
              "</span><span>" +
              escapeHtml(appointment.phone) +
              "</span><span>" +
              escapeHtml(appointment.email || "без e-mail") +
              '</span></div><label><span>Комментарий администратора</span><input type="text" value="' +
              escapeHtml(appointment.adminComment || "") +
              '" data-appointment-comment="' +
              escapeHtml(appointment.id) +
              '" /></label><div class="appointment-controls"><select data-appointment-status="' +
              escapeHtml(appointment.id) +
              '"><option value="new"' +
              (appointment.status === "new" ? " selected" : "") +
              '>Новая</option><option value="confirmed"' +
              (appointment.status === "confirmed" ? " selected" : "") +
              '>Подтверждена</option><option value="cancelled"' +
              (appointment.status === "cancelled" ? " selected" : "") +
              '">Отменена</option></select><button class="tiny-button" type="button" data-action="save-appointment" data-id="' +
              escapeHtml(appointment.id) +
              '">Сохранить</button></div></div>'
            );
          })
          .join("") +
        "</div>"
      : '<div class="empty-state">По текущим фильтрам записей нет.</div>';
  }

  function renderScheduleSection() {
    elements.scheduleList.innerHTML = state.specialists
      .map(function (specialist) {
        const schedule = state.schedules.find(function (item) {
          return item.specialistId === specialist.id;
        });
        const current = schedule || {
          id: Seed.createId("schedule"),
          specialistId: specialist.id,
          workingDays: [],
          slots: [],
          blockedDates: [],
        };

        return (
          '<form class="schedule-card schedule-form" data-schedule-id="' +
          escapeHtml(current.id) +
          '" data-specialist-id="' +
          escapeHtml(specialist.id) +
          '"><h4>' +
          escapeHtml(specialist.name) +
          '</h4><div class="checkbox-row">' +
          Seed.DAYS.map(function (day, index) {
            return (
              '<label class="checkbox-chip"><input type="checkbox" name="workingDays" value="' +
              index +
              '"' +
              (current.workingDays.includes(index) ? " checked" : "") +
              " />" +
              escapeHtml(day) +
              "</label>"
            );
          }).join("") +
          '</div><label><span>Слоты через запятую</span><input type="text" name="slots" value="' +
          escapeHtml(current.slots.join(", ")) +
          '" /></label><label><span>Заблокированные даты через запятую</span><input type="text" name="blockedDates" value="' +
          escapeHtml(current.blockedDates.join(", ")) +
          '" /></label><button class="button button-primary" type="submit">Сохранить график</button></form>'
        );
      })
      .join("");
  }

  function renderHomepageSection() {
    const advantages = state.site.advantages
      .map(function (item) {
        return item.title + " | " + item.text;
      })
      .join("\n");

    elements.homepageForm.elements.eyebrow.value = state.site.hero.eyebrow;
    elements.homepageForm.elements.title.value = state.site.hero.title;
    elements.homepageForm.elements.text.value = state.site.hero.text;
    elements.homepageForm.elements.bannerTitle.value = state.site.banner.title;
    elements.homepageForm.elements.bannerLinkLabel.value = state.site.banner.linkLabel;
    elements.homepageForm.elements.bannerText.value = state.site.banner.text;
    elements.homepageForm.elements.advantages.value = advantages;
  }

  function fillServiceForm(service) {
    elements.serviceForm.elements.id.value = service.id;
    elements.serviceForm.elements.name.value = service.name;
    elements.serviceForm.elements.categoryId.value = service.categoryId;
    elements.serviceForm.elements.price.value = service.price;
    elements.serviceForm.elements.duration.value = service.duration;
    elements.serviceForm.elements.teaser.value = service.teaser;
    elements.serviceForm.elements.description.value = service.description;
    elements.serviceForm.elements.indications.value = service.indications.join("\n");
    elements.serviceForm.elements.contraindications.value = service.contraindications.join("\n");
    elements.serviceForm.elements.accent.value = service.accent;
    Array.from(elements.serviceSpecialistSelect.options).forEach(function (option) {
      option.selected = service.specialistIds.includes(option.value);
    });
  }

  function fillCategoryForm(category) {
    elements.categoryForm.elements.id.value = category.id;
    elements.categoryForm.elements.name.value = category.name;
    elements.categoryForm.elements.description.value = category.description;
  }

  function fillSpecialistForm(specialist) {
    elements.specialistForm.elements.id.value = specialist.id;
    elements.specialistForm.elements.name.value = specialist.name;
    elements.specialistForm.elements.role.value = specialist.role;
    elements.specialistForm.elements.experience.value = specialist.experience;
    elements.specialistForm.elements.tagline.value = specialist.tagline;
    elements.specialistForm.elements.about.value = specialist.about;
    elements.specialistForm.elements.education.value = specialist.education.join("\n");
    elements.specialistForm.elements.focus.value = specialist.focus.join("\n");
    elements.specialistForm.elements.image.value = specialist.image;
  }

  function fillPortfolioForm(item) {
    elements.portfolioForm.elements.id.value = item.id;
    elements.portfolioForm.elements.title.value = item.title;
    elements.portfolioForm.elements.serviceId.value = item.serviceId;
    elements.portfolioForm.elements.specialistId.value = item.specialistId;
    elements.portfolioForm.elements.summary.value = item.summary;
    elements.portfolioForm.elements.image.value = item.image;
  }

  function fillPromotionForm(promotion) {
    elements.promotionForm.elements.id.value = promotion.id;
    elements.promotionForm.elements.title.value = promotion.title;
    elements.promotionForm.elements.badge.value = promotion.badge;
    elements.promotionForm.elements.description.value = promotion.description;
    elements.promotionForm.elements.terms.value = promotion.terms;
    elements.promotionForm.elements.validUntil.value = promotion.validUntil;
  }

  function renderAll() {
    state = Store.getState();
    fillSelectOptions();
    renderDashboard();
    renderServicesSection();
    renderSpecialistsSection();
    renderPortfolioSection();
    renderReviewsSection();
    renderPromotionsSection();
    renderAppointmentsSection();
    renderScheduleSection();
    renderHomepageSection();
  }

  function exportAppointmentsToCsv() {
    const rows = [
      ["Клиент", "Телефон", "Email", "Услуга", "Специалист", "Дата", "Время", "Статус", "Комментарий"].join(";"),
    ];

    state.appointments.forEach(function (appointment) {
      const service = getService(appointment.serviceId);
      const specialist = getSpecialist(appointment.specialistId);
      rows.push(
        [
          appointment.fullName,
          appointment.phone,
          appointment.email || "",
          service ? service.name : "",
          specialist ? specialist.name : "",
          appointment.date || "",
          appointment.time || "",
          getStatusLabel(appointment.status),
          appointment.adminComment || appointment.comment || "",
        ]
          .map(function (value) {
            return '"' + String(value || "").replace(/"/g, '""') + '"';
          })
          .join(";")
      );
    });

    const blob = new Blob(["\uFEFF" + rows.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "beauty-lab-appointments.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function bindEvents() {
    elements.loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      state = Store.getState();
      const form = new FormData(event.currentTarget);
      const username = String(form.get("username") || "").trim();
      const password = String(form.get("password") || "").trim();

      if (username === state.admin.username && password === state.admin.password) {
        setSession(true);
        updateAuthView();
        showToast("Вход выполнен.");
        event.currentTarget.reset();
        return;
      }

      showToast("Неверный логин или пароль.");
    });

    elements.logoutButton.addEventListener("click", function () {
      setSession(false);
      updateAuthView();
    });

    elements.resetDemoData.addEventListener("click", function () {
      Store.resetState();
      state = Store.getState();
      resetServiceForm();
      resetCategoryForm();
      resetSpecialistForm();
      resetPortfolioForm();
      resetPromotionForm();
      renderAll();
      showToast("Демо-данные сброшены.");
    });

    elements.adminNav.addEventListener("click", function (event) {
      const button = event.target.closest("[data-panel-target]");
      if (!button) {
        return;
      }
      activatePanel(button.getAttribute("data-panel-target"));
    });

    document.getElementById("serviceCancelEdit").addEventListener("click", resetServiceForm);
    document.getElementById("categoryCancelEdit").addEventListener("click", resetCategoryForm);
    document.getElementById("specialistCancelEdit").addEventListener("click", resetSpecialistForm);
    document.getElementById("portfolioCancelEdit").addEventListener("click", resetPortfolioForm);
    document.getElementById("promotionCancelEdit").addEventListener("click", resetPromotionForm);

    elements.appointmentStatusFilter.addEventListener("change", renderAppointmentsSection);
    elements.appointmentSpecialistFilter.addEventListener("change", renderAppointmentsSection);
    elements.appointmentDateFilter.addEventListener("change", renderAppointmentsSection);
    elements.exportAppointments.addEventListener("click", exportAppointmentsToCsv);

    elements.serviceForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const form = event.currentTarget.elements;
      Store.upsert("services", {
        id: form.id.value || Seed.createId("service"),
        name: form.name.value.trim(),
        categoryId: form.categoryId.value,
        price: Number(form.price.value || 0),
        duration: form.duration.value.trim(),
        teaser: form.teaser.value.trim(),
        description: form.description.value.trim(),
        indications: linesToArray(form.indications.value),
        contraindications: linesToArray(form.contraindications.value),
        accent: form.accent.value.trim(),
        specialistIds: selectedValues(elements.serviceSpecialistSelect),
      });
      state = Store.getState();
      renderAll();
      resetServiceForm();
      showToast("Услуга сохранена.");
    });

    elements.categoryForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const form = event.currentTarget.elements;
      Store.upsert("categories", {
        id: form.id.value || Seed.createId("category"),
        name: form.name.value.trim(),
        description: form.description.value.trim(),
      });
      state = Store.getState();
      renderAll();
      resetCategoryForm();
      showToast("Категория сохранена.");
    });

    elements.specialistForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const form = event.currentTarget.elements;
      Store.upsert("specialists", {
        id: form.id.value || Seed.createId("specialist"),
        name: form.name.value.trim(),
        role: form.role.value.trim(),
        experience: Number(form.experience.value || 0),
        tagline: form.tagline.value.trim(),
        about: form.about.value.trim(),
        education: linesToArray(form.education.value),
        focus: linesToArray(form.focus.value),
        image: form.image.value.trim(),
      });
      state = Store.getState();
      renderAll();
      resetSpecialistForm();
      showToast("Специалист сохранён.");
    });

    elements.portfolioForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const form = event.currentTarget.elements;
      Store.upsert("portfolio", {
        id: form.id.value || Seed.createId("portfolio"),
        title: form.title.value.trim(),
        serviceId: form.serviceId.value,
        specialistId: form.specialistId.value,
        summary: form.summary.value.trim(),
        image: form.image.value.trim(),
      });
      state = Store.getState();
      renderAll();
      resetPortfolioForm();
      showToast("Кейс портфолио сохранён.");
    });

    elements.promotionForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const form = event.currentTarget.elements;
      Store.upsert("promotions", {
        id: form.id.value || Seed.createId("promotion"),
        title: form.title.value.trim(),
        badge: form.badge.value.trim(),
        description: form.description.value.trim(),
        terms: form.terms.value.trim(),
        validUntil: form.validUntil.value,
      });
      state = Store.getState();
      renderAll();
      resetPromotionForm();
      showToast("Акция сохранена.");
    });

    elements.homepageForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const form = event.currentTarget.elements;
      Store.updateState(function (draft) {
        draft.site.hero.eyebrow = form.eyebrow.value.trim();
        draft.site.hero.title = form.title.value.trim();
        draft.site.hero.text = form.text.value.trim();
        draft.site.banner.title = form.bannerTitle.value.trim();
        draft.site.banner.linkLabel = form.bannerLinkLabel.value.trim();
        draft.site.banner.text = form.bannerText.value.trim();
        draft.site.advantages = parseAdvantages(form.advantages.value);
      });
      state = Store.getState();
      renderAll();
      showToast("Главная страница обновлена.");
    });

    elements.scheduleList.addEventListener("submit", function (event) {
      const form = event.target.closest(".schedule-form");
      if (!form) {
        return;
      }
      event.preventDefault();
      const data = new FormData(form);
      Store.upsert("schedules", {
        id: form.getAttribute("data-schedule-id"),
        specialistId: form.getAttribute("data-specialist-id"),
        workingDays: data.getAll("workingDays").map(function (value) {
          return Number(value);
        }),
        slots: String(data.get("slots") || "")
          .split(",")
          .map(function (item) {
            return item.trim();
          })
          .filter(Boolean),
        blockedDates: String(data.get("blockedDates") || "")
          .split(",")
          .map(function (item) {
            return item.trim();
          })
          .filter(Boolean),
      });
      state = Store.getState();
      renderAll();
      showToast("Расписание сохранено.");
    });

    document.addEventListener("click", function (event) {
      const button = event.target.closest("[data-action]");
      if (!button) {
        return;
      }

      const action = button.getAttribute("data-action");
      const id = button.getAttribute("data-id");

      if (action === "edit-service") {
        fillServiceForm(getService(id));
        activatePanel("services");
      }

      if (action === "delete-service") {
        if (!window.confirm("Удалить услугу? Связанные будущие записи будут отменены.")) {
          return;
        }
        Store.updateState(function (draft) {
          draft.services = draft.services.filter(function (service) {
            return service.id !== id;
          });
          draft.portfolio = draft.portfolio.filter(function (item) {
            return item.serviceId !== id;
          });
          draft.appointments.forEach(function (appointment) {
            if (appointment.serviceId === id && appointment.date >= Seed.toIsoDate(new Date())) {
              appointment.status = "cancelled";
            }
          });
        });
        state = Store.getState();
        renderAll();
        resetServiceForm();
        showToast("Услуга удалена.");
      }

      if (action === "edit-category") {
        const item = state.categories.find(function (category) {
          return category.id === id;
        });
        fillCategoryForm(item);
        activatePanel("services");
      }

      if (action === "delete-category") {
        const hasServices = state.services.some(function (service) {
          return service.categoryId === id;
        });
        if (hasServices) {
          showToast("Сначала перенеси или удали услуги этой категории.");
          return;
        }
        Store.remove("categories", id);
        state = Store.getState();
        renderAll();
        resetCategoryForm();
        showToast("Категория удалена.");
      }

      if (action === "edit-specialist") {
        fillSpecialistForm(getSpecialist(id));
        activatePanel("specialists");
      }

      if (action === "delete-specialist") {
        if (!window.confirm("Удалить специалиста? Будущие записи будут отменены.")) {
          return;
        }
        Store.updateState(function (draft) {
          draft.specialists = draft.specialists.filter(function (specialist) {
            return specialist.id !== id;
          });
          draft.schedules = draft.schedules.filter(function (schedule) {
            return schedule.specialistId !== id;
          });
          draft.portfolio = draft.portfolio.filter(function (item) {
            return item.specialistId !== id;
          });
          draft.services.forEach(function (service) {
            service.specialistIds = service.specialistIds.filter(function (specialistId) {
              return specialistId !== id;
            });
          });
          draft.appointments.forEach(function (appointment) {
            if (appointment.specialistId === id && appointment.date >= Seed.toIsoDate(new Date())) {
              appointment.status = "cancelled";
            }
          });
        });
        state = Store.getState();
        renderAll();
        resetSpecialistForm();
        showToast("Специалист удалён.");
      }

      if (action === "edit-portfolio") {
        const item = state.portfolio.find(function (entry) {
          return entry.id === id;
        });
        fillPortfolioForm(item);
        activatePanel("portfolio");
      }

      if (action === "delete-portfolio") {
        Store.remove("portfolio", id);
        state = Store.getState();
        renderAll();
        resetPortfolioForm();
        showToast("Кейс портфолио удалён.");
      }

      if (action === "approve-review" || action === "decline-review") {
        Store.updateState(function (draft) {
          draft.reviews.forEach(function (review) {
            if (review.id === id) {
              review.status = action === "approve-review" ? "approved" : "declined";
            }
          });
        });
        state = Store.getState();
        renderAll();
        showToast(action === "approve-review" ? "Отзыв опубликован." : "Отзыв отклонён.");
      }

      if (action === "delete-review") {
        Store.remove("reviews", id);
        state = Store.getState();
        renderAll();
        showToast("Отзыв удалён.");
      }

      if (action === "edit-promotion") {
        const item = state.promotions.find(function (promotion) {
          return promotion.id === id;
        });
        fillPromotionForm(item);
        activatePanel("promotions");
      }

      if (action === "delete-promotion") {
        Store.remove("promotions", id);
        state = Store.getState();
        renderAll();
        resetPromotionForm();
        showToast("Акция удалена.");
      }

      if (action === "save-appointment") {
        const statusControl = document.querySelector('[data-appointment-status="' + id + '"]');
        const commentControl = document.querySelector('[data-appointment-comment="' + id + '"]');
        Store.updateState(function (draft) {
          draft.appointments.forEach(function (appointment) {
            if (appointment.id === id) {
              appointment.status = statusControl.value;
              appointment.adminComment = commentControl.value.trim();
            }
          });
        });
        state = Store.getState();
        renderAll();
        showToast("Изменения по записи сохранены.");
      }
    });
  }

  updateAuthView();
  bindEvents();
})();
