import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Key,
  Bell,
  Globe,
  Sliders,
  Check,
  Copy,
  Save,
  Lock,
  Building,
  Mail,
  Phone,
  Clock,
  RefreshCw,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

interface UserProfileSettingsProps {
  onBackToDashboard?: () => void;
}

export const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({
  onBackToDashboard,
}) => {
  const { user, updateUser, changePassword } = useAuth();

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<
    "general" | "security" | "preferences" | "notifications" | "system"
  >("general");

  // General Profile State
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [businessName, setBusinessName] = useState(user?.business_name || "");
  const [language, setLanguage] = useState(user?.language_preference || "en");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Password / Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Preferences State (Persisted locally)
  const [timezone, setTimezone] = useState(() => {
    return localStorage.getItem("setting_timezone") || "UTC";
  });
  const [refreshInterval, setRefreshInterval] = useState(() => {
    return localStorage.getItem("setting_refresh_interval") || "30";
  });
  const [mapStyle, setMapStyle] = useState(() => {
    return localStorage.getItem("setting_map_style") || "standard";
  });

  // Notifications State
  const [notifyDisputes, setNotifyDisputes] = useState(() => {
    return localStorage.getItem("setting_notify_disputes") !== "false";
  });
  const [notifyHighRisk, setNotifyHighRisk] = useState(() => {
    return localStorage.getItem("setting_notify_high_risk") !== "false";
  });
  const [notifyDriverShift, setNotifyDriverShift] = useState(() => {
    return localStorage.getItem("setting_notify_driver_shift") !== "false";
  });
  const [soundAlerts, setSoundAlerts] = useState(() => {
    return localStorage.getItem("setting_sound_alerts") !== "false";
  });
  const [emailDigest, setEmailDigest] = useState(() => {
    return localStorage.getItem("setting_email_digest") === "true";
  });

  // System & Dispatch Defaults State
  const [defaultPriority, setDefaultPriority] = useState(() => {
    return localStorage.getItem("setting_default_priority") || "normal";
  });
  const [deviationTolerance, setDeviationTolerance] = useState(() => {
    return localStorage.getItem("setting_deviation_tolerance") || "100";
  });
  const [proofThreshold, setProofThreshold] = useState(() => {
    return localStorage.getItem("setting_proof_threshold") || "80";
  });
  const [autoAssignDrivers, setAutoAssignDrivers] = useState(() => {
    return localStorage.getItem("setting_auto_assign") === "true";
  });

  // Load fresh profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        if (res.data) {
          const p = res.data;
          setFirstName(p.first_name || "");
          setLastName(p.last_name || "");
          setPhone(p.phone || "");
          if (p.business_name) setBusinessName(p.business_name);
          if (p.language_preference) setLanguage(p.language_preference);
          updateUser(p);
        }
      } catch {
        // Fallback to AuthContext values
      }
    };
    fetchProfile();
  }, []);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      if (!firstName && user.first_name) setFirstName(user.first_name);
      if (!lastName && user.last_name) setLastName(user.last_name);
      if (!phone && user.phone) setPhone(user.phone);
      if (!businessName && user.business_name) setBusinessName(user.business_name);
    }
  }, [user]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await api.put("/auth/profile", {
        first_name: firstName,
        last_name: lastName,
        phone,
        business_name: businessName,
        language_preference: language,
      });

      if (res.data?.user) {
        updateUser(res.data.user);
      } else {
        updateUser({
          first_name: firstName,
          last_name: lastName,
          phone,
          business_name: businessName,
          language_preference: language,
        });
      }
      toast.success("User profile settings updated successfully!");
    } catch (err: any) {
      console.error("Failed to update profile", err);
      toast.error(
        err.response?.data?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation password do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(newPassword, confirmPassword);
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Change password error", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to change password. Verify your credentials."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSavePreferences = () => {
    localStorage.setItem("setting_timezone", timezone);
    localStorage.setItem("setting_refresh_interval", refreshInterval);
    localStorage.setItem("setting_map_style", mapStyle);
    toast.success("Display & localization preferences saved!");
  };

  const handleSaveNotifications = () => {
    localStorage.setItem("setting_notify_disputes", String(notifyDisputes));
    localStorage.setItem("setting_notify_high_risk", String(notifyHighRisk));
    localStorage.setItem("setting_notify_driver_shift", String(notifyDriverShift));
    localStorage.setItem("setting_sound_alerts", String(soundAlerts));
    localStorage.setItem("setting_email_digest", String(emailDigest));
    toast.success("Notification preferences saved!");
  };

  const handleSaveSystemDefaults = () => {
    localStorage.setItem("setting_default_priority", defaultPriority);
    localStorage.setItem("setting_deviation_tolerance", deviationTolerance);
    localStorage.setItem("setting_proof_threshold", proofThreshold);
    localStorage.setItem("setting_auto_assign", String(autoAssignDrivers));
    toast.success("Delivery & dispatch defaults saved!");
  };

  const displayName =
    `${firstName} ${lastName}`.trim() ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "Enterprise Administrator";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabel =
    user?.user_type === "admin"
      ? "Enterprise Administrator"
      : user?.user_type === "manager"
      ? "Fleet Manager"
      : user?.user_type === "driver"
      ? "Fleet Driver"
      : user?.user_type === "customer"
      ? "Verified Customer"
      : "Operations Lead";

  return (
    <div className="max-w-[1400px] w-full mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-lg shadow-indigo-600/20 ring-4 ring-white">
                {initials || "DP"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center" title="Account Active">
                <Check size={12} className="text-white" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {displayName}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60 inline-flex items-center gap-1.5">
                  <Shield size={13} className="text-blue-600" />
                  {roleLabel}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Verified
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="inline-flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" />
                  {user?.email}
                </span>
                {user?.business_name && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building size={14} className="text-slate-400" />
                    {user.business_name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-slate-400">
                  <Clock size={14} />
                  Session Active
                </span>
              </p>
            </div>
          </div>

          {onBackToDashboard && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-100 overflow-x-auto scrollbar-none">
          {[
            { id: "general", label: "Profile Information", icon: User },
            { id: "security", label: "Security & Credentials", icon: Lock },
            { id: "preferences", label: "Display & Language", icon: Globe },
            { id: "notifications", label: "Notification Triggers", icon: Bell },
            { id: "system", label: "Delivery Defaults", icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Content Panels */}
      {/* ============================================================== */}
      {/* TAB 1: GENERAL PROFILE INFORMATION */}
      {/* ============================================================== */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">
                Personal & Enterprise Credentials
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your administrative identity, contact details, and organization name.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-500 cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      Primary
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Primary login identity cannot be modified directly.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <Phone
                      size={15}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Business / Organization Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Delivery Enterprise LLC"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <Building
                    size={15}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Security & Identifiers Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                System Identifiers
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      User UUID
                    </span>
                    <span className="font-mono text-slate-800 text-[11px] truncate max-w-[160px] inline-block">
                      {user?.uuid || "N/A"}
                    </span>
                  </div>
                  {user?.uuid && (
                    <button
                      type="button"
                      onClick={() => handleCopy(user.uuid, "User UUID")}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                      title="Copy User UUID"
                    >
                      {copiedId === "User UUID" ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  )}
                </div>

                {user?.business_uuid && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">
                        Enterprise UUID
                      </span>
                      <span className="font-mono text-slate-800 text-[11px] truncate max-w-[160px] inline-block">
                        {user.business_uuid}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(user.business_uuid!, "Enterprise UUID")}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                      title="Copy Enterprise UUID"
                    >
                      {copiedId === "Enterprise UUID" ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                )}

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">
                    Security Level
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-800">
                      Role-Based Access Control (RBAC)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Sparkles size={18} />
                <h4 className="font-bold text-xs uppercase tracking-wider">
                  Tamper-Proof Guarantee
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                All profile updates, driver dispatches, and proof verifications are signed with enterprise JWT credentials and verified on the dispatch audit trail.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SECURITY & PASSWORD CREDENTIALS */}
      {/* ============================================================== */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">
                Change Account Password
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Protect your administration access with a robust password of at least 8 characters.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Current Password (Optional if newly registered)
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-2 space-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          newPassword.length >= 8 ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      />
                      <span>At least 8 characters</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isChangingPassword ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Key size={14} />
                  )}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Session Health & Cipher
              </h3>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                  <span>Cryptographic Token</span>
                  <span className="font-bold text-emerald-600">Active (HS256)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                  <span>SSL / TLS Encryption</span>
                  <span className="font-bold text-emerald-600">Enforced</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                  <span>Password Reset Status</span>
                  <span className="font-bold text-slate-800">
                    {user?.must_change_password ? "Required" : "Normal"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: DISPLAY & LANGUAGE PREFERENCES */}
      {/* ============================================================== */}
      {activeTab === "preferences" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 max-w-3xl">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              Display, Localization & Network Intervals
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalize interface localization and real-time fleet synchronization cadence.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                System Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="en">English (Default - US / UK)</option>
                <option value="es">Español (Spanish)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="fr">Français (French)</option>
                <option value="de">Deutsch (German)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Fleet Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Asia/Kolkata">India Standard Time (IST - UTC+5:30)</option>
                <option value="Europe/London">London / Greenwich (GMT)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Dashboard Auto-Refresh Frequency
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "15", label: "15 Seconds", sub: "Ultra live" },
                  { id: "30", label: "30 Seconds", sub: "Standard" },
                  { id: "60", label: "60 Seconds", sub: "Low bandwidth" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRefreshInterval(opt.id)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      refreshInterval === opt.id
                        ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-xs block">{opt.label}</span>
                    <span className="text-[10px] opacity-70 block">{opt.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Map Radar Visual Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "standard", label: "Street Map (Standard)" },
                  { id: "satellite", label: "Satellite Hybrid (High Contrast)" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMapStyle(opt.id)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      mapStyle === opt.id
                        ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-xs block">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Save size={14} />
                <span>Save Localization Preferences</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: NOTIFICATIONS & DISPATCH TRIGGERS */}
      {/* ============================================================== */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 max-w-3xl">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              Operational Notification Preferences
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure real-time audio and banner prompts for mission-critical fleet events.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                id: "disputes",
                title: "Customer Dispute & Claim Alerts",
                description:
                  "Instant alert when a client files a missing item or delivery dispute.",
                checked: notifyDisputes,
                onChange: () => setNotifyDisputes(!notifyDisputes),
              },
              {
                id: "high_risk",
                title: "AI Anomaly & High Risk Route Flags",
                description:
                  "Immediate warning when AI anomaly score exceeds risk thresholds.",
                checked: notifyHighRisk,
                onChange: () => setNotifyHighRisk(!notifyHighRisk),
              },
              {
                id: "driver_shift",
                title: "Driver Shift Status Changes",
                description:
                  "Notifications when drivers clock in, start deliveries, or pause on break.",
                checked: notifyDriverShift,
                onChange: () => setNotifyDriverShift(!notifyDriverShift),
              },
              {
                id: "sound",
                title: "Audible Chimes for Critical Events",
                description:
                  "Play high-priority sound tone when attention-required events occur.",
                checked: soundAlerts,
                onChange: () => setSoundAlerts(!soundAlerts),
              },
              {
                id: "digest",
                title: "Daily Operations Email Digest",
                description:
                  "Receive an automated morning breakdown of delivery success rate & proof scores.",
                checked: emailDigest,
                onChange: () => setEmailDigest(!emailDigest),
              },
            ].map((item) => (
              <div
                key={item.id}
                onClick={item.onChange}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/70 hover:bg-slate-100/70 transition-all cursor-pointer"
              >
                <div className="pr-4">
                  <h4 className="text-xs font-bold text-slate-900">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {item.description}
                  </p>
                </div>
                <div
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                    item.checked ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      item.checked ? "left-6" : "left-1"
                    }`}
                  />
                </div>
              </div>
            ))}

            <div className="pt-3">
              <button
                type="button"
                onClick={handleSaveNotifications}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Save size={14} />
                <span>Save Notification Preferences</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: SYSTEM & DELIVERY DEFAULTS */}
      {/* ============================================================== */}
      {activeTab === "system" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 max-w-3xl">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              Enterprise Delivery & Dispatch Parameters
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Set standard rules and tolerances for automated proof verification and dispatching.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Default Order Priority Level
              </label>
              <select
                value={defaultPriority}
                onChange={(e) => setDefaultPriority(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="normal">Normal (Standard SLA)</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent (Express Drop-off)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                GPS Geofence Tolerance Threshold (Meters)
              </label>
              <select
                value={deviationTolerance}
                onChange={(e) => setDeviationTolerance(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="50">50 meters (Strict High-Density Urban)</option>
                <option value="100">100 meters (Standard Commercial Default)</option>
                <option value="250">250 meters (Suburban / Rural)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Minimum Proof Verification Score
              </label>
              <select
                value={proofThreshold}
                onChange={(e) => setProofThreshold(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="70">70% Minimum Acceptable Score</option>
                <option value="80">80% Recommended High Assurance</option>
                <option value="90">90% Strict Enterprise Assurance</option>
              </select>
            </div>

            <div
              onClick={() => setAutoAssignDrivers(!autoAssignDrivers)}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/70 hover:bg-slate-100/70 transition-all cursor-pointer"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Automated Smart Driver Routing
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Automatically suggest the best proximate available driver when scheduling new orders.
                </p>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                  autoAssignDrivers ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    autoAssignDrivers ? "left-6" : "left-1"
                  }`}
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleSaveSystemDefaults}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Save size={14} />
                <span>Save Dispatch Defaults</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileSettings;
