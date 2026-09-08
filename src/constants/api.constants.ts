// src/constants/api.constants.ts
//
// Central map of every backend endpoint this admin panel calls.
// The backend (test_rent) exposes each module twice — once under "/web"
// (Super Admin / Manager panel) and once under "/app" (Customer / Driver
// apps). This is the admin panel, so everything here uses the "/web" prefix.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const auth = (path = "") => `/auth/web${path}`;
const vehicle = (path = "") => `/vehicle/web${path}`;
const vehicleCategory = (path = "") => `/vehicle-category/web${path}`;
const rentalRequest = (path = "") => `/rental-request/web${path}`;
const trip = (path = "") => `/trip/web${path}`;
const dashboard = (path = "") => `/dashboard/web${path}`;
const report = (path = "") => `/report/web${path}`;
const payment = (path = "") => `/payment/web${path}`;
const invoice = (path = "") => `/invoice/web${path}`;
const notification = (path = "") => `/notification/web${path}`;
const review = (path = "") => `/review/web${path}`;
const location = (path = "") => `/location/web${path}`;
const maintenance = (path = "") => `/maintenance/web${path}`;
const pricing = (path = "") => `/pricing/web${path}`;
const setting = (path = "") => `/setting/web${path}`;
const ticket = (path = "") => `/ticket/web${path}`;
const auditLog = (path = "") => `/audit-log/web${path}`;
const document = (path = "") => `/document/web${path}`;

export const ENDPOINTS = {
  auth: {
    login: auth("/login"),
    logout: auth("/logout"),
    createStaff: auth("/staff"),
    profile: auth("/profile"),
    updateProfile: auth("/profile"),
    changePassword: auth("/change-password"),
    users: auth("/users"),
    userById: (id: string) => auth(`/users/${id}`),
    accountControl: (id: string) => auth(`/account/${id}`),
  },

  vehicleCategory: {
    list: vehicleCategory("/"),
    all: vehicleCategory("/all"),
    byId: (id: string) => vehicleCategory(`/${id}`),
  },

  vehicle: {
    search: vehicle("/"),
    all: vehicle("/all"),
    byId: (id: string) => vehicle(`/${id}`),
  },

  rentalRequest: {
    list: rentalRequest("/"),
    all: rentalRequest("/all"),
    byId: (id: string) => rentalRequest(`/${id}`),
    review: (id: string) => rentalRequest(`/${id}/review`),
    confirm: (id: string) => rentalRequest(`/${id}/confirm`),
    reject: (id: string) => rentalRequest(`/${id}/reject`),
    assignVehicle: (id: string) => rentalRequest(`/${id}/assign-vehicle`),
    assignDriver: (id: string) => rentalRequest(`/${id}/assign-driver`),
  },

  trip: {
    list: trip("/"),
    all: trip("/all"),
    byId: (id: string) => trip(`/${id}`),
    cancel: (id: string) => trip(`/${id}/cancel`),
  },

  dashboard: {
    stats: dashboard("/stats"),
  },

  report: {
    users: report("/users"),
    vehicles: report("/vehicles"),
    drivers: report("/drivers"),
    trips: report("/trips"),
    financial: report("/financial"),
  },

  payment: {
    all: payment("/all"),
    list: payment("/"),
    updateStatus: (id: string) => payment(`/${id}/status`),
    refund: (id: string) => payment(`/${id}/refund`),
    byTrip: (tripId: string) => payment(`/trip/${tripId}`),
  },

  invoice: {
    all: invoice("/all"),
    byTrip: (tripId: string) => invoice(`/trip/${tripId}`),
  },

  notification: {
    all: notification("/all"),
    send: notification("/"),
  },

  review: {
    all: review("/all"),
    byId: (id: string) => review(`/${id}`),
  },

  location: {
    all: location("/all"),
    byId: (id: string) => location(`/${id}`),
  },

  maintenance: {
    all: maintenance("/all"),
    search: maintenance("/"),
    create: maintenance("/"),
    byId: (id: string) => maintenance(`/${id}`),
  },

  pricing: {
    all: pricing("/all"),
    search: pricing("/"),
    create: pricing("/"),
    byId: (id: string) => pricing(`/${id}`),
  },

  setting: {
    all: setting("/all"),
    byKey: (key: string) => setting(`/${key}`),
  },

  ticket: {
    all: ticket("/all"),
    byId: (id: string) => ticket(`/${id}`),
  },

  auditLog: {
    all: auditLog("/all"),
    search: auditLog("/"),
  },

  document: {
    all: document("/all"),
    byId: (id: string) => document(`/${id}`),
    upload: document("/upload"),
  },
};
