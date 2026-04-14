(function () {
  function createBookingState() {
    return {
      step: 1,
      serviceId: "",
      specialistId: "",
      date: "",
      time: "",
      client: {
        fullName: "",
        phone: "",
        email: "",
        comment: "",
        consent: false,
      },
    };
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      weekday: "short",
    }).format(new Date(value + "T12:00:00"));
  }

  function formatShortDate(value) {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
    }).format(new Date(value + "T12:00:00"));
  }

  function createEmptyState(message) {
    return '<div class="empty-state">' + escapeHtml(message) + "</div>";
  }

  function stars(rating) {
    return "★".repeat(Number(rating || 0)) + "☆".repeat(Math.max(0, 5 - Number(rating || 0)));
  }

  window.BeautyLabHomeHelpers = {
    createBookingState,
    escapeHtml,
    formatDate,
    formatShortDate,
    createEmptyState,
    stars,
  };
})();
