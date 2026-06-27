import React, { useState } from "react";
import { LogOut, Sun, Moon, Menu, X, Landmark, Shield, User, Database, Building, Bell } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Notification } from "../types";

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  currentUser: any;
  currentRole: "tenant" | "admin" | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openLoginModal: () => void;
  notifications?: Notification[];
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onViewAllNotifications?: () => void;
}

export default function Navbar({
  darkMode,
  setDarkMode,
  currentUser,
  currentRole,
  onLogout,
  activeTab,
  setActiveTab,
  openLoginModal,
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onViewAllNotifications
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const tenantNotifs = (notifications || []).filter(n => n.user_id === currentUser?.id);
  const unreadCount = tenantNotifs.filter(n => !n.is_read).length;
  const sortedNotifs = [...tenantNotifs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "?";
  };

  const navItems = [
    { id: "daftar-kamar", label: "Cari Kamar" },
    { id: "fasilitas", label: "Fasilitas" },
    { id: "testimoni", label: "Testimoni" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300 border-b bg-white/80 backdrop-blur-md border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab("landing"); setMobileMenuOpen(false); }}>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30"
            >
              <Landmark className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-display font-black text-2xl tracking-tight bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-sky-400 dark:via-blue-400 dark:to-indigo-350 bg-clip-text text-transparent">
              RAIKOS
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab("landing");
                  setTimeout(() => {
                    const el = document.getElementById(item.id);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 100);
                }}
                className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer ${
                  activeTab === "landing" ? "text-slate-600 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* If Logged In as tenant, show Tenant Dashboard link */}
            {currentRole === "tenant" && (
              <button
                onClick={() => setActiveTab("tenant-dashboard")}
                className={`text-sm font-semibold flex items-center gap-1.5 transition-all px-3 py-1.5 rounded-lg ${
                  activeTab === "tenant-dashboard"
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <User className="w-4 h-4" />
                Dashboard Saya
              </button>
            )}

            {/* If Logged In as admin, show Admin Dashboard link */}
            {currentRole === "admin" && (
              <button
                onClick={() => setActiveTab("admin-dashboard")}
                className={`text-sm font-semibold flex items-center gap-1.5 transition-all px-3 py-1.5 rounded-lg ${
                  activeTab === "admin-dashboard"
                    ? "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-violet-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Shield className="w-4 h-4" />
                Sistem ERP Admin
              </button>
            )}
          </nav>

          {/* Action Buttons & Settings */}
          <div className="hidden md:flex items-center gap-4">
            {/* Auth Buttons */}
            {currentUser ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                {currentRole === "tenant" && (
                  <div className="relative">
                    <button
                      onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                      className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                      title="Notifikasi"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Dropdown Container */}
                    <AnimatePresence>
                      {notifDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
                          
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
                          >
                            {/* Header */}
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                              <h3 className="font-display font-semibold text-sm text-slate-800 dark:text-slate-200">
                                Kotak Masuk Notifikasi
                              </h3>
                              {unreadCount > 0 && (
                                <span className="text-[10px] leading-none bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-2 py-1 rounded-full">
                                  {unreadCount} Baru
                                </span>
                              )}
                            </div>

                            {/* List */}
                            <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-850">
                              {sortedNotifs.length === 0 ? (
                                <div className="p-6 text-center text-slate-400">
                                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                                  <p className="text-xs font-medium">Kotak masuk bersih!</p>
                                </div>
                              ) : (
                                sortedNotifs.map((n) => (
                                  <div
                                    key={n.id}
                                    onClick={() => {
                                      if (!n.is_read && onMarkNotificationRead) {
                                        onMarkNotificationRead(n.id);
                                      }
                                    }}
                                    className={`p-4 text-left cursor-pointer transition-colors ${
                                      !n.is_read
                                        ? "bg-slate-50/70 dark:bg-slate-850/50 hover:bg-slate-100/70 border-l-4 border-blue-500"
                                        : "hover:bg-slate-50/40"
                                    }`}
                                  >
                                    <div className="flex justify-between items-start gap-1">
                                      <h4 className={`text-xs ${!n.is_read ? "font-bold text-slate-900 dark:text-slate-100" : "font-medium text-slate-600 dark:text-slate-400"}`}>
                                        {n.title}
                                      </h4>
                                      {!n.is_read && (
                                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0 mt-1" />
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                      {n.message}
                                    </p>
                                    <span className="text-[9px] text-slate-400 font-mono mt-1.5 block">
                                      {new Date(n.created_at).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Actions footer */}
                            <div className="p-3 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onMarkAllNotificationsRead) {
                                    onMarkAllNotificationsRead();
                                  }
                                }}
                                disabled={unreadCount === 0}
                                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 disabled:pointer-events-none"
                              >
                                Tandai semua dibaca
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setNotifDropdownOpen(false);
                                  if (onViewAllNotifications) {
                                    onViewAllNotifications();
                                  }
                                }}
                                className="text-[11px] font-bold text-slate-600 hover:text-slate-700 hover:underline"
                              >
                                Lihat semua
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                <div 
                  onClick={() => setActiveTab(currentRole === "admin" ? "admin-dashboard" : "tenant-dashboard")}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500 group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-300">
                      {getInitials(currentUser.name)}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {currentUser.name.split(" ")[0]}
                    </p>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                      {currentRole === "tenant" ? "penyewa" : currentRole}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLogout}
                  className="p-2 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openLoginModal}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Masuk / Daftar
              </motion.button>
            )}
          </div>

          {/* Mobile Right Bar controls */}
          <div className="flex items-center gap-2 md:hidden">
            {currentRole === "tenant" && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  title="Notifikasi"
                >
                  <Bell className="w-5.5 h-5.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Mobile Dropdown Container */}
                <AnimatePresence>
                  {notifDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40 bg-black/10" onClick={() => setNotifDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-[280px] sm:w-[320px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
                      >
                        {/* Header */}
                        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                          <h3 className="font-display font-semibold text-xs text-slate-800 dark:text-slate-200">
                            Kotak Masuk Notifikasi
                          </h3>
                          {unreadCount > 0 && (
                            <span className="text-[9px] leading-none bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full">
                              {unreadCount} Baru
                            </span>
                          )}
                        </div>

                        {/* List */}
                        <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-850">
                          {sortedNotifs.length === 0 ? (
                            <div className="p-5 text-center text-slate-400">
                              <Bell className="w-7 h-7 mx-auto mb-1 opacity-30 text-slate-400" />
                              <p className="text-xs">Kotak masuk bersih!</p>
                            </div>
                          ) : (
                            sortedNotifs.map((n) => (
                              <div
                                key={n.id}
                                onClick={() => {
                                  if (!n.is_read && onMarkNotificationRead) {
                                    onMarkNotificationRead(n.id);
                                  }
                                }}
                                className={`p-3 text-left cursor-pointer transition-colors ${
                                  !n.is_read
                                    ? "bg-slate-50/70 dark:bg-slate-850/50 hover:bg-slate-100/70 border-l-4 border-blue-500"
                                    : "hover:bg-slate-50/40"
                                }`}
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <h4 className={`text-[11px] ${!n.is_read ? "font-bold text-slate-900 dark:text-slate-100" : "font-medium text-slate-600 dark:text-slate-400"}`}>
                                    {n.title}
                                  </h4>
                                  {!n.is_read && (
                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0 mt-1" />
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                  {n.message}
                                </p>
                                <span className="text-[8px] text-slate-400 font-mono mt-1 block">
                                  {new Date(n.created_at).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Actions footer */}
                        <div className="p-2.5 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/10 flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (onMarkAllNotificationsRead) onMarkAllNotificationsRead();
                            }}
                            disabled={unreadCount === 0}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                          >
                            Tandai semua dibaca
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNotifDropdownOpen(false);
                              if (onViewAllNotifications) onViewAllNotifications();
                            }}
                            className="text-[10px] font-bold text-slate-600 hover:text-slate-700"
                          >
                            Lihat semua
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab("landing");
                    setMobileMenuOpen(false);
                    setTimeout(() => {
                      const el = document.getElementById(item.id);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 200);
                  }}
                  className="block w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}

              {currentRole === "tenant" && (
                <button
                  onClick={() => { setActiveTab("tenant-dashboard"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20"
                >
                  <User className="w-4 h-4" />
                  Dashboard Saya
                </button>
              )}

              {currentRole === "admin" && (
                <button
                  onClick={() => { setActiveTab("admin-dashboard"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20"
                >
                  <Shield className="w-4 h-4" />
                  Sistem ERP Admin
                </button>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                {currentUser ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-3">
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt="User"
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm">
                          {getInitials(currentUser.name)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{currentUser.name}</p>
                        <p className="text-xs text-slate-400">{currentUser.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/10 hover:bg-rose-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar Akun
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { openLoginModal(); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 px-4 text-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-md"
                  >
                    Masuk atau Daftar
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
