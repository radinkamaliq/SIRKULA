/* SIRKULA — Shared formatting helpers. Business data stays in browser localStorage. */
(function () {
  'use strict';

  function currentLang() {
    try {
      const value = localStorage.getItem('sirkula_lang');
      return value === 'en' ? 'en' : 'id';
    } catch (e) {
      return 'id';
    }
  }

  function formatCurrency(value) {
    if (value == null || value === '') return 'Free';
    const amount = Number(value);
    if (!Number.isFinite(amount)) return '—';
    const locale = currentLang() === 'en' ? 'en-US' : 'id-ID';
    return new Intl.NumberFormat(locale, {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
  }

  function parseDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatDate(value) {
    const date = parseDate(value);
    if (!date) return '—';
    const locale = currentLang() === 'en' ? 'en-US' : 'id-ID';
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  }

  function formatDateTime(value) {
    const date = parseDate(value);
    if (!date) return '—';
    const locale = currentLang() === 'en' ? 'en-US' : 'id-ID';
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(date);
  }

  window.SIRKULA = window.SIRKULA || {};
  window.SIRKULA.formatCurrency = formatCurrency;
  window.SIRKULA.formatDate = formatDate;
  window.SIRKULA.formatDateTime = formatDateTime;
})();
