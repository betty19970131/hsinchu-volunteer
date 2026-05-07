import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  User,
  Shield,
  MapPin,
  Clock,
  Plus,
  X,
  Check,
  Trash2,
  Settings,
  AlertCircle,
  Users,
  Key,
  Edit,
  Info,
  LogOut,
  RefreshCcw,
  Menu,
} from "lucide-react";

// 您的專屬 API 網址
const GAS_API_URL =
  "https://script.google.com/macros/s/AKfycbyvHaRrnhr9hQmVCPcjwS2PON0-EBw4DaN5bW76jlODq0JNPk8WcPR7gEqcTOtDIeE7eQ/exec";

const isSameStr = (a, b) =>
  a != null &&
  b != null &&
  String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
const MOCK_HOLIDAYS = [
  "2026-04-03",
  "2026-04-04",
  "2026-04-05",
  "2026-04-06",
  "2026-05-01",
];
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
const formatDate = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
const isWeekend = (year, month, day) =>
  [0, 6].includes(new Date(year, month, day).getDay());
const isHoliday = (dateString) => MOCK_HOLIDAYS.includes(dateString);
const getDayName = (dayIndex) =>
  ["日", "一", "二", "三", "四", "五", "六"][dayIndex];
const parseTime = (t) => {
  if (!t) return 0;
  const parts = String(t).split(":");
  return (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
};

export default function VolunteerApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState("volunteer");
  const [currentDate, setCurrentDate] = useState(new Date(new Date());
  const [currentUser, setCurrentUser] = useState("");
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const todayStr = formatDate(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [admins, setAdmins] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [fixedShifts, setFixedShifts] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);
  const [customEvents, setCustomEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });
  const showConfirm = (msg, onConfirmCallback) =>
    setConfirmDialog({
      isOpen: true,
      message: msg,
      onConfirm: onConfirmCallback,
    });

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isVolLoginOpen, setIsVolLoginOpen] = useState(false);
  const [isVolPwdModalOpen, setIsVolPwdModalOpen] = useState(false);
  const [isAdminPwdModalOpen, setIsAdminPwdModalOpen] = useState(false);
  const [isAdminManageOpen, setIsAdminManageOpen] = useState(false);
  const [isVolManageOpen, setIsVolManageOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isAdminViewModalOpen, setIsAdminViewModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isActLeaveModalOpen, setIsActLeaveModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isCancelLeaveModalOpen, setIsCancelLeaveModalOpen] = useState(false);
  const [isCancelSubModalOpen, setIsCancelSubModalOpen] = useState(false);
  const [isAdminSupportViewOpen, setIsAdminSupportViewOpen] = useState(false);

  const [adminLoginForm, setAdminLoginForm] = useState({
    username: "",
    password: "",
  });
  const [volLoginForm, setVolLoginForm] = useState({ name: "", password: "" });
  const [volPwdForm, setVolPwdForm] = useState({ oldPwd: "", newPwd: "" });
  const [adminPwdForm, setAdminPwdForm] = useState({ oldPwd: "", newPwd: "" });
  const [newAdminForm, setNewAdminForm] = useState({
    username: "",
    password: "",
    name: "",
    isSuper: false,
  });
  const [newVolName, setNewVolName] = useState("");
  const [regForm, setRegForm] = useState({ diet: "葷", needsParking: false });
  const [eventForm, setEventForm] = useState({
    id: "",
    date: "",
    name: "",
    location: "",
    startTime: "09:00",
    endTime: "12:00",
    hasMeal: false,
    hasParking: false,
    quota: 5,
    description: "",
  });
  const [leaveForm, setLeaveForm] = useState({ reason: "" });
  const [tempShifts, setTempShifts] = useState([]);
  const [adminAssignVol, setAdminAssignVol] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const noCacheUrl = `${GAS_API_URL}?t=${new Date().getTime()}`;
      const res = await fetch(noCacheUrl);
      const textResponse = await res.text();

      if (
        textResponse.includes("<!DOCTYPE") ||
        textResponse.includes("<html")
      ) {
        console.error("【系統警告】Google 回傳了錯誤畫面：", textResponse);
        alert(
          "⚠️ 連線被 Google 阻擋了！\n\n這通常是因為：\n1. Google Apps Script 的「執行身分」不是設定為「我」。\n2. 您的 API 網址已經失效（變成了空號）。\n\n請檢查 Google 後台的部署設定，確認網址與權限！"
        );
        setIsLoading(false);
        return;
      }

      const data = JSON.parse(textResponse);
      const masterAdmin = {
        username: "yun",
        password: "860422",
        name: "筱芸",
        isSuper: true,
      };
      const parsedAdmins = (data.admins || []).map((a) => ({
        ...a,
        isSuper: String(a.isSuper).toUpperCase() === "TRUE",
      }));
      setAdmins([
        masterAdmin,
        ...parsedAdmins.filter((a) => !isSameStr(a.username, "yun")),
      ]);

      const parsedVols = (data.volunteers || []).map((v) => ({
        ...v,
        isArchived: String(v.isArchived).toUpperCase() === "TRUE",
      }));
      const masterVol = { name: "筱芸", password: "123", isArchived: false };
      setVolunteers(
        parsedVols.some((v) => isSameStr(v.name, "筱芸"))
          ? parsedVols
          : [masterVol, ...parsedVols]
      );

      setFixedShifts(data.fixedShifts || []);
      setCustomEvents(
        (data.events || []).map((e) => ({
          ...e,
          type: "activity",
          hasMeal: String(e.hasMeal).toUpperCase() === "TRUE",
          hasParking: String(e.hasParking).toUpperCase() === "TRUE",
        }))
      );
      setRegistrations(data.registrations || []);
      setLeaves(data.leaves || []);
      setSubstitutes(data.substitutes || []);
      setIsLoading(false);
    } catch (error) {
      console.error("載入失敗:", error);
      alert("連線資料庫時發生異常：" + error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const apiCall = async (payload) => {
    try {
      const res = await fetch(GAS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const textResponse = await res.text();
      if (textResponse.includes("<!DOCTYPE") || textResponse.includes("<html"))
        throw new Error("Google 拒絕了寫入請求，請檢查網址與權限是否正確。");
      const result = JSON.parse(textResponse);
      if (result.status !== "success") throw new Error(result.message);
      await fetchData();
      return true;
    } catch (error) {
      alert("操作失敗：" + error.message);
      return false;
    }
  };

  const checkConflict = (volName, dateStr, actStart, actEnd) => {
    if (!actStart || !actEnd || !volName || !dateStr) return false;
    const dateOnly = String(dateStr).substring(0, 10);
    const [y, m, d] = dateOnly.split("-").map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay();
    const startMin = parseTime(actStart);
    const endMin = parseTime(actEnd);
    const isMorningOverlap = startMin < 720 && endMin > 540;
    const isAfternoonOverlap = startMin < 990 && endMin > 810;
    const getFixedVol = (p) => {
      const validRules = fixedShifts
        .filter(
          (s) =>
            Number(s.dayOfWeek) === dayOfWeek && String(s.period).trim() === p
        )
        .filter(
          (s) =>
            (s.startDate
              ? String(s.startDate).substring(0, 10)
              : "2000-01-01") <= dateOnly
        )
        .sort((a, b) =>
          (a.startDate || "2000-01-01") < (b.startDate || "2000-01-01") ? 1 : -1
        );
      return validRules.length > 0 ? validRules[0].volunteer : null;
    };
    const mFixed = getFixedVol("上午");
    const aFixed = getFixedVol("下午");
    const mLeave = leaves.some(
      (l) =>
        String(l.date).substring(0, 10) === dateOnly &&
        String(l.period).trim() === "上午" &&
        isSameStr(l.volunteer, volName)
    );
    const mSub = substitutes.some(
      (s) =>
        String(s.date).substring(0, 10) === dateOnly &&
        String(s.period).trim() === "上午" &&
        isSameStr(s.volunteer, volName)
    );
    const aLeave = leaves.some(
      (l) =>
        String(l.date).substring(0, 10) === dateOnly &&
        String(l.period).trim() === "下午" &&
        isSameStr(l.volunteer, volName)
    );
    const aSub = substitutes.some(
      (s) =>
        String(s.date).substring(0, 10) === dateOnly &&
        String(s.period).trim() === "下午" &&
        isSameStr(s.volunteer, volName)
    );
    return (
      (isMorningOverlap && ((isSameStr(mFixed, volName) && !mLeave) || mSub)) ||
      (isAfternoonOverlap && ((isSameStr(aFixed, volName) && !aLeave) || aSub))
    );
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const admin = admins.find(
      (a) =>
        isSameStr(a.username, adminLoginForm.username) &&
        String(a.password).trim() === String(adminLoginForm.password).trim()
    );
    if (admin) {
      setCurrentAdmin(admin);
      setRole("admin");
      setIsAdminLoginOpen(false);
      setAdminLoginForm({ username: "", password: "" });
    } else alert("管理員密碼錯誤！");
  };

  const handleVolLogin = (e) => {
    e.preventDefault();
    const vol = volunteers.find(
      (v) =>
        isSameStr(v.name, volLoginForm.name) &&
        String(v.password).trim() === String(volLoginForm.password).trim() &&
        !v.isArchived
    );
    if (vol) {
      setCurrentUser(vol.name);
      setRole("volunteer");
      setIsVolLoginOpen(false);
      setVolLoginForm({ name: "", password: "" });
    } else alert("密碼錯誤或帳號已停用！");
  };

  const handleRoleSwitch = (r) => {
    setIsMobileMenuOpen(false);
    if (r === "admin") {
      if (!currentAdmin) setIsAdminLoginOpen(true);
      else setRole("admin");
    } else {
      if (!currentUser) setIsVolLoginOpen(true);
      else setRole("volunteer");
    }
  };
  const handleAdminLogout = () =>
    showConfirm("確定登出管理後台？", () => {
      setCurrentAdmin(null);
      setRole("volunteer");
      setIsMobileMenuOpen(false);
    });
  const handleVolLogout = () => {
    setCurrentUser("");
    setRole("volunteer");
    setIsMobileMenuOpen(false);
  };

  // 🌟 強化版：志工修改密碼後強制更新記憶與重登
  const handleVolPwdChange = async (e) => {
    e.preventDefault();
    const vol = volunteers.find((v) => isSameStr(v.name, currentUser));
    if (String(vol.password) !== String(volPwdForm.oldPwd).trim())
      return alert("原密碼錯誤！");
    if (
      await apiCall({
        action: "update",
        sheetName: "Volunteers",
        keyField: "name",
        keyValue: currentUser,
        updateData: { password: volPwdForm.newPwd.trim() },
      })
    ) {
      // 手動覆寫網頁大腦記憶
      setVolunteers(
        volunteers.map((v) =>
          isSameStr(v.name, currentUser)
            ? { ...v, password: volPwdForm.newPwd.trim() }
            : v
        )
      );
      alert("✅ 密碼修改成功！請使用新密碼重新登入。");
      setIsVolPwdModalOpen(false);
      setVolPwdForm({ oldPwd: "", newPwd: "" });
      // 強制登出
      setCurrentUser("");
      setIsVolLoginOpen(true);
    }
  };

  // 🌟 強化版：管理員修改密碼後強制更新記憶
  const handleAdminPwdChange = async (e) => {
    e.preventDefault();
    if (currentAdmin.username === "yun")
      return alert("⚠️ 系統預設帳號不可修改密碼！");
    if (String(currentAdmin.password) !== String(adminPwdForm.oldPwd).trim())
      return alert("原密碼錯誤！");
    if (
      await apiCall({
        action: "update",
        sheetName: "Admins",
        keyField: "username",
        keyValue: currentAdmin.username,
        updateData: { password: adminPwdForm.newPwd.trim() },
      })
    ) {
      // 手動覆寫網頁大腦記憶
      setAdmins(
        admins.map((a) =>
          isSameStr(a.username, currentAdmin.username)
            ? { ...a, password: adminPwdForm.newPwd.trim() }
            : a
        )
      );
      setCurrentAdmin({
        ...currentAdmin,
        password: adminPwdForm.newPwd.trim(),
      });
      alert("✅ 密碼修改成功！");
      setIsAdminPwdModalOpen(false);
      setAdminPwdForm({ oldPwd: "", newPwd: "" });
    }
  };

  const resetVolPassword = (name) => {
    showConfirm(`確定重設志工「${name}」密碼為 123 嗎？`, async () => {
      if (
        await apiCall({
          action: "update",
          sheetName: "Volunteers",
          keyField: "name",
          keyValue: name,
          updateData: { password: "123" },
        })
      )
        alert("✅ 成功");
    });
  };
  const handleAddAdmin = async () => {
    const { username, password, name, isSuper } = newAdminForm;
    if (!username.trim() || !password.trim() || !name.trim())
      return alert("請填寫完整");
    if (admins.some((a) => isSameStr(a.username, username)))
      return alert("帳號已存在");
    const newAd = {
      username: username.trim(),
      password: password.trim(),
      name: name.trim(),
      isSuper,
    };
    if (await apiCall({ action: "append", sheetName: "Admins", data: newAd })) {
      setNewAdminForm({ username: "", password: "", name: "", isSuper: false });
      alert("✅ 新增成功！");
    }
  };
  const handleRemoveAdmin = (username) => {
    if (username === currentAdmin.username || username === "yun")
      return alert("無法刪除此帳號");
    showConfirm("確定刪除此管理員？", async () => {
      await apiCall({
        action: "delete",
        sheetName: "Admins",
        keyField: "username",
        keyValue: username,
      });
    });
  };
  const resetAdminPassword = (username) => {
    if (username === "yun") return alert("系統帳號無需重設");
    showConfirm(`確定重設「${username}」密碼為 123 嗎？`, async () => {
      if (
        await apiCall({
          action: "update",
          sheetName: "Admins",
          keyField: "username",
          keyValue: username,
          updateData: { password: "123" },
        })
      )
        alert("✅ 成功");
    });
  };
  const handleAddVolunteer = async () => {
    if (newVolName.trim()) {
      if (volunteers.some((v) => isSameStr(v.name, newVolName)))
        return alert("已存在");
      if (
        await apiCall({
          action: "append",
          sheetName: "Volunteers",
          data: { name: newVolName.trim(), password: "123", isArchived: false },
        })
      )
        setNewVolName("");
    }
  };
  const handleRemoveVolunteer = (name) => {
    if (name === "筱芸") return alert("無法停用系統預設");
    showConfirm(`確定停用志工「${name}」嗎？`, async () => {
      if (
        await apiCall({
          action: "update",
          sheetName: "Volunteers",
          keyField: "name",
          keyValue: name,
          updateData: { isArchived: true },
        })
      ) {
        if (isSameStr(currentUser, name)) setCurrentUser("");
        alert("✅ 已停用");
      }
    });
  };
  const handleRestoreVolunteer = (name) => {
    showConfirm(`確定恢復志工「${name}」嗎？`, async () => {
      if (
        await apiCall({
          action: "update",
          sheetName: "Volunteers",
          keyField: "name",
          keyValue: name,
          updateData: { isArchived: false },
        })
      )
        alert("✅ 已恢復");
    });
  };

  const handleSaveSettings = async () => {
    let newHistory = [...fixedShifts];
    let hasChanges = false;
    [1, 2, 3, 4, 5].forEach((d) => {
      ["上午", "下午"].forEach((p) => {
        const formShift = tempShifts.find(
          (s) => Number(s.dayOfWeek) === d && s.period === p
        );
        const newVal = formShift ? formShift.volunteer : "";
        const validRules = fixedShifts
          .filter(
            (s) =>
              Number(s.dayOfWeek) === d &&
              s.period === p &&
              (s.startDate || "2000-01-01") <= todayStr
          )
          .sort((a, b) => ((a.startDate || "") < (b.startDate || "") ? 1 : -1));
        const currentVal = validRules.length > 0 ? validRules[0].volunteer : "";
        if (!isSameStr(newVal, currentVal)) {
          hasChanges = true;
          newHistory = newHistory.filter(
            (s) =>
              !(
                Number(s.dayOfWeek) === d &&
                s.period === p &&
                String(s.startDate).substring(0, 10) === todayStr
              )
          );
          newHistory.push({
            dayOfWeek: d,
            period: p,
            volunteer: newVal,
            startDate: todayStr,
          });
        }
      });
    });
    if (!hasChanges) {
      setIsSettingsModalOpen(false);
      return alert("班表沒有更動。");
    }
    if (
      await apiCall({
        action: "replaceFullSheet",
        sheetName: "FixedShifts",
        dataArray: newHistory,
      })
    ) {
      setIsSettingsModalOpen(false);
      alert("✅ 排班已儲存！");
    }
  };

  const openSettingsModal = () => {
    const currentArr = [];
    [1, 2, 3, 4, 5].forEach((d) => {
      ["上午", "下午"].forEach((p) => {
        const validRules = fixedShifts
          .filter(
            (s) =>
              Number(s.dayOfWeek) === d &&
              s.period === p &&
              (s.startDate || "2000-01-01") <= todayStr
          )
          .sort((a, b) => ((a.startDate || "") < (b.startDate || "") ? 1 : -1));
        if (validRules.length > 0 && validRules[0].volunteer)
          currentArr.push({
            dayOfWeek: d,
            period: p,
            volunteer: validRules[0].volunteer,
          });
      });
    });
    setTempShifts(currentArr);
    setIsSettingsModalOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.name.trim() || !eventForm.date)
      return alert("請填寫完整日期與名稱");
    const eventToSave = eventForm.id
      ? { ...eventForm }
      : {
          ...eventForm,
          id: `evt_${Date.now()}`,
          type: "activity",
          creator: currentAdmin.name,
        };
    if (
      await apiCall(
        eventForm.id
          ? {
              action: "update",
              sheetName: "Events",
              keyField: "id",
              keyValue: eventToSave.id,
              updateData: eventToSave,
            }
          : { action: "append", sheetName: "Events", data: eventToSave }
      )
    ) {
      setIsEventModalOpen(false);
      alert("✅ 活動已儲存");
    }
  };

  const handleDeleteEventClick = () => {
    showConfirm("確定刪除活動？", async () => {
      if (
        await apiCall({
          action: "delete",
          sheetName: "Events",
          keyField: "id",
          keyValue: selectedEvent.id,
        })
      )
        setIsAdminViewModalOpen(false);
    });
  };

  const toggleApproval = async (regId, currentStatus) => {
    const newStatus = currentStatus === "pending" ? "approved" : "pending";
    if (currentStatus === "pending") {
      const reg = registrations.find((r) => r.id === regId);
      const evt = customEvents.find(
        (e) => String(e.id) === String(reg.eventId)
      );
      const appCount = registrations.filter(
        (r) =>
          String(r.eventId) === String(reg.eventId) && r.status === "approved"
      ).length;
      if (appCount >= evt.quota) return alert("無法核准！正取名額已滿。");
      if (
        checkConflict(reg.volunteerName, evt.date, evt.startTime, evt.endTime)
      ) {
        showConfirm(
          `⚠️ 衝堂警告！\n志工在此時段已經有排定行政班。\n確定要強制核准嗎？`,
          async () => {
            await apiCall({
              action: "update",
              sheetName: "Registrations",
              keyField: "id",
              keyValue: regId,
              updateData: { status: newStatus },
            });
          }
        );
        return;
      }
    }
    await apiCall({
      action: "update",
      sheetName: "Registrations",
      keyField: "id",
      keyValue: regId,
      updateData: { status: newStatus },
    });
  };

  const handleAdminAssignShift = async () => {
    if (!adminAssignVol) return alert("請先選擇一位志工");
    const executeAssign = async () => {
      const newList = substitutes.filter(
        (s) =>
          !(
            String(s.date).substring(0, 10) ===
              String(selectedEvent.date).substring(0, 10) &&
            s.period === selectedEvent.period
          )
      );
      newList.push({
        date: selectedEvent.date,
        period: selectedEvent.period,
        volunteer: adminAssignVol,
      });
      if (
        await apiCall({
          action: "replaceFullSheet",
          sheetName: "Substitutes",
          dataArray: newList,
        })
      ) {
        setAdminAssignVol("");
        alert(`✅ 已指派`);
        setIsAdminSupportViewOpen(false);
      }
    };
    const shiftStart = selectedEvent.period === "上午" ? 540 : 810;
    const shiftEnd = selectedEvent.period === "上午" ? 720 : 990;
    const conflict = registrations.find(
      (r) =>
        isSameStr(r.volunteerName, adminAssignVol) &&
        String(r.date).substring(0, 10) ===
          String(selectedEvent.date).substring(0, 10) &&
        r.status !== "leave" &&
        customEvents.some(
          (e) =>
            String(e.id) === String(r.eventId) &&
            parseTime(e.startTime) < shiftEnd &&
            parseTime(e.endTime) > shiftStart
        )
    );
    if (conflict) {
      showConfirm(
        `⚠️ 衝堂警告！\n志工在此時段已報名活動。\n確定強制指派嗎？`,
        executeAssign
      );
      return;
    }
    executeAssign();
  };

  const adminRemoveLeave = () => {
    showConfirm(`確定撤銷此請假？`, async () => {
      const newList = leaves.filter(
        (l) =>
          !(
            String(l.date).substring(0, 10) ===
              String(selectedEvent.date).substring(0, 10) &&
            l.period === selectedEvent.period &&
            isSameStr(l.volunteer, selectedEvent.statusInfo.assignedTo)
          )
      );
      if (
        await apiCall({
          action: "replaceFullSheet",
          sheetName: "Leaves",
          dataArray: newList,
        })
      )
        setIsAdminSupportViewOpen(false);
    });
  };
  const adminRemoveSub = () => {
    showConfirm(`確定移除此代班？`, async () => {
      const newList = substitutes.filter(
        (s) =>
          !(
            String(s.date).substring(0, 10) ===
              String(selectedEvent.date).substring(0, 10) &&
            s.period === selectedEvent.period
          )
      );
      if (
        await apiCall({
          action: "replaceFullSheet",
          sheetName: "Substitutes",
          dataArray: newList,
        })
      )
        setIsAdminSupportViewOpen(false);
    });
  };

  const handleRegisterSubmit = async () => {
    const mine = registrations.find(
      (r) =>
        String(r.eventId) === String(selectedEvent.id) &&
        isSameStr(r.volunteerName, currentUser)
    );
    if (mine && mine.status === "pending") {
      const newList = registrations.filter((r) => r.id !== mine.id);
      if (
        await apiCall({
          action: "replaceFullSheet",
          sheetName: "Registrations",
          dataArray: newList,
        })
      ) {
        setIsRegModalOpen(false);
        alert("✅ 已取消報名");
      }
      return;
    }
    const newReg = {
      id: `reg_${Date.now()}`,
      eventId: selectedEvent.id,
      volunteerName: currentUser,
      date: selectedEvent.date,
      status: "pending",
      diet: selectedEvent.hasMeal ? regForm.diet : null,
      needsParking: selectedEvent.hasParking ? regForm.needsParking : null,
    };
    if (
      await apiCall({
        action: "append",
        sheetName: "Registrations",
        data: newReg,
      })
    ) {
      setIsRegModalOpen(false);
      alert("✅ 已送出報名");
    }
  };

  const handleTakeSub = async () => {
    const shiftStart = selectedEvent.period === "上午" ? 540 : 810;
    const shiftEnd = selectedEvent.period === "上午" ? 720 : 990;
    const conflict = registrations.find(
      (r) =>
        isSameStr(r.volunteerName, currentUser) &&
        String(r.date).substring(0, 10) ===
          String(selectedEvent.date).substring(0, 10) &&
        r.status !== "leave" &&
        customEvents.some(
          (e) =>
            String(e.id) === String(r.eventId) &&
            parseTime(e.startTime) < shiftEnd &&
            parseTime(e.endTime) > shiftStart
        )
    );
    if (conflict)
      return alert("⚠️ 衝堂警告！您在此時段已經有報名活動，無法再登記代班喔！");
    const newList = substitutes.filter(
      (s) =>
        !(
          String(s.date).substring(0, 10) ===
            String(selectedEvent.date).substring(0, 10) &&
          s.period === selectedEvent.period
        )
    );
    newList.push({
      date: selectedEvent.date,
      period: selectedEvent.period,
      volunteer: currentUser,
    });
    if (
      await apiCall({
        action: "replaceFullSheet",
        sheetName: "Substitutes",
        dataArray: newList,
      })
    ) {
      setIsSubModalOpen(false);
      alert("✅ 登記成功");
    }
  };

  const handleSubmitLeave = async () => {
    if (!leaveForm.reason.trim()) return alert("請填寫事由");
    if (
      await apiCall({
        action: "append",
        sheetName: "Leaves",
        data: {
          date: selectedEvent.date,
          period: selectedEvent.period,
          volunteer: currentUser,
          reason: leaveForm.reason.trim(),
        },
      })
    ) {
      setIsLeaveModalOpen(false);
      alert("✅ 請假成功");
    }
  };

  const handleCancelLeave = () => {
    showConfirm("確定撤銷請假？", async () => {
      const newList = leaves.filter(
        (l) =>
          !(
            String(l.date).substring(0, 10) ===
              String(selectedEvent.date).substring(0, 10) &&
            l.period === selectedEvent.period &&
            isSameStr(l.volunteer, currentUser)
          )
      );
      if (
        await apiCall({
          action: "replaceFullSheet",
          sheetName: "Leaves",
          dataArray: newList,
        })
      ) {
        setIsCancelLeaveModalOpen(false);
        alert("✅ 銷假成功");
      }
    });
  };
  const handleCancelSub = () => {
    showConfirm("確定取消代班？", async () => {
      const newList = substitutes.filter(
        (s) =>
          !(
            String(s.date).substring(0, 10) ===
              String(selectedEvent.date).substring(0, 10) &&
            s.period === selectedEvent.period &&
            isSameStr(s.volunteer, currentUser)
          )
      );
      if (
        await apiCall({
          action: "replaceFullSheet",
          sheetName: "Substitutes",
          dataArray: newList,
        })
      ) {
        setIsCancelSubModalOpen(false);
        alert("✅ 已取消");
      }
    });
  };
  const handleSubmitActLeave = async () => {
    if (!leaveForm.reason.trim()) return alert("請填寫事由");
    const myReg = registrations.find(
      (r) =>
        String(r.eventId) === String(selectedEvent.id) &&
        isSameStr(r.volunteerName, currentUser)
    );
    if (
      await apiCall({
        action: "update",
        sheetName: "Registrations",
        keyField: "id",
        keyValue: myReg.id,
        updateData: { status: "leave", leaveReason: leaveForm.reason.trim() },
      })
    ) {
      setIsActLeaveModalOpen(false);
      alert("✅ 已請假");
    }
  };

  const allEvents = useMemo(() => {
    const year = currentDate.getFullYear(),
      month = currentDate.getMonth(),
      days = getDaysInMonth(year, month);
    let evts = [...customEvents];
    for (let d = 1; d <= days; d++) {
      const dStr = formatDate(year, month, d);
      if (!isWeekend(year, month, d) && !isHoliday(dStr)) {
        const dow = new Date(year, month, d).getDay();
        ["上午", "下午"].forEach((p) => {
          const valid = fixedShifts
            .filter(
              (s) =>
                Number(s.dayOfWeek) === dow &&
                String(s.period).trim() === p &&
                (s.startDate || "2000-01-01") <= dStr
            )
            .sort((a, b) =>
              (a.startDate || "") < (b.startDate || "") ? 1 : -1
            );
          let who = valid.length > 0 ? valid[0].volunteer : null;
          evts.push({
            id: `admin_${p}_${dStr}`,
            date: dStr,
            name: "行政支援",
            type: "admin_support",
            period: p,
            statusInfo: {
              assignedTo: who,
              leave:
                leaves.find(
                  (l) =>
                    String(l.date).substring(0, 10) === dStr &&
                    String(l.period).trim() === p
                ) || null,
              sub:
                substitutes.find(
                  (s) =>
                    String(s.date).substring(0, 10) === dStr &&
                    String(s.period).trim() === p
                ) || null,
              isMyFixed: isSameStr(who, currentUser),
              isMySub: substitutes.some(
                (s) =>
                  String(s.date).substring(0, 10) === dStr &&
                  String(s.period).trim() === p &&
                  isSameStr(s.volunteer, currentUser)
              ),
            },
          });
        });
      }
    }
    return evts;
  }, [
    currentDate,
    customEvents,
    fixedShifts,
    leaves,
    substitutes,
    currentUser,
  ]);

  const renderCalendar = () => {
    const year = currentDate.getFullYear(),
      month = currentDate.getMonth(),
      first = getFirstDayOfMonth(year, month),
      days = [];
    ["日", "一", "二", "三", "四", "五", "六"].forEach((d) =>
      days.push(
        <div
          key={`h-${d}`}
          className="text-center font-bold py-1 bg-gray-100 text-gray-600 text-[10px] md:text-xs border-b"
        >
          {d}
        </div>
      )
    );
    for (let i = 0; i < first; i++)
      days.push(
        <div
          key={`e-${i}`}
          className="bg-gray-50/50 border-r border-b min-h-[80px] md:min-h-[120px]"
        ></div>
      );
    for (let d = 1; d <= getDaysInMonth(year, month); d++) {
      const dStr = formatDate(year, month, d),
        isOff = isWeekend(year, month, d) || isHoliday(dStr),
        isT = dStr === todayStr,
        dayEvts = allEvents.filter((e) => e.date === dStr);
      days.push(
        <div
          key={dStr}
          className={`min-h-[85px] md:min-h-[130px] border-r border-b p-0.5 flex flex-col relative z-0 ${
            isT ? "bg-indigo-50/50" : isOff ? "bg-red-50/20" : "bg-white"
          }`}
          onClick={() => {
            if (role === "admin" && dStr >= todayStr && !isOff) {
              setEventForm({
                id: "",
                date: dStr,
                name: "",
                location: "",
                startTime: "09:00",
                endTime: "12:00",
                hasMeal: false,
                hasParking: false,
                quota: 5,
                description: "",
              });
              setIsEventModalOpen(true);
            }
          }}
        >
          <span
            className={`text-[10px] md:text-sm font-bold w-5 h-5 flex items-center justify-center rounded-full mb-0.5 ${
              isT
                ? "bg-indigo-600 text-white"
                : isOff
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {d}
          </span>
          <div className="flex-1 space-y-0.5 overflow-hidden">
            {dayEvts.map((e) => {
              const { assignedTo, leave, sub, isMyFixed, isMySub } =
                e.statusInfo || {};
              if (e.type === "admin_support") {
                let txt = `[${e.period === "上午" ? "早" : "午"}] `,
                  cls =
                    "text-[9px] md:text-[11px] p-0.5 rounded border truncate cursor-pointer relative z-10 ";
                if (isMySub) {
                  txt += "我代";
                  cls += "bg-indigo-600 text-white border-indigo-700";
                } else if (isMyFixed) {
                  if (sub) {
                    txt += `${sub.volunteer}(代)`;
                    cls += "bg-gray-100 text-gray-400 border-gray-200";
                  } else if (leave) {
                    txt += "請假";
                    cls += "bg-yellow-100 text-yellow-700 border-yellow-300";
                  } else {
                    txt += "我的班";
                    cls += "bg-blue-600 text-white border-blue-700";
                  }
                } else {
                  if (sub) {
                    txt += `${sub.volunteer}(代)`;
                    cls += "bg-gray-50 text-gray-400 border-gray-200";
                  } else if (!assignedTo || leave) {
                    txt += "缺";
                    cls +=
                      "bg-white text-emerald-600 border-dashed border-emerald-300 hover:bg-emerald-50";
                  } else {
                    txt += assignedTo;
                    cls += "bg-blue-50 text-blue-700 border-blue-100";
                  }
                }
                return (
                  <div
                    key={e.id}
                    onClick={(x) => {
                      x.stopPropagation();
                      setSelectedEvent(e);
                      if (role === "admin") {
                        setAdminAssignVol("");
                        setIsAdminSupportViewOpen(true);
                      } else {
                        if (!currentUser) return alert("請先登入志工");
                        if (isMyFixed && !leave) setIsLeaveModalOpen(true);
                        else if (isMyFixed && leave)
                          setIsCancelLeaveModalOpen(true);
                        else if (isMySub) setIsCancelSubModalOpen(true);
                        else if (!sub && (!assignedTo || leave))
                          setIsSubModalOpen(true);
                      }
                    }}
                    className={cls}
                  >
                    {txt}
                  </div>
                );
              }
              const mine = registrations.find(
                (r) =>
                  String(r.eventId) === String(e.id) &&
                  isSameStr(r.volunteerName, currentUser)
              );
              let aCls =
                "text-[9px] md:text-[11px] p-0.5 rounded border truncate font-bold cursor-pointer relative z-10 " +
                (mine?.status === "approved"
                  ? "bg-purple-600 text-white border-purple-700"
                  : mine?.status === "pending"
                  ? "bg-orange-400 text-white border-orange-500"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200");
              return (
                <div
                  key={e.id}
                  onClick={(x) => {
                    x.stopPropagation();
                    setSelectedEvent(e);
                    if (role === "admin") setIsAdminViewModalOpen(true);
                    else {
                      if (!currentUser) return alert("請先登入");
                      if (mine?.status === "approved")
                        setIsActLeaveModalOpen(true);
                      else setIsRegModalOpen(true);
                    }
                  }}
                  className={aCls}
                >
                  {e.name}
                </div>
              );
            })}
          </div>
          {role === "admin" && !isOff && dStr >= todayStr && (
            <div className="absolute top-1 right-1 opacity-50">
              <Plus size={12} className="text-gray-400" />
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans pb-10">
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
        <div className="max-w-6xl mx-auto px-3 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-600">
            <CalendarIcon size={20} />
            <h1 className="font-bold text-base md:text-lg">志工排班系統</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2 py-1 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
              {role === "admin"
                ? `管理員: ${currentAdmin?.name || "yun"}`
                : currentUser
                ? `志工: ${currentUser}`
                : "訪客模式"}
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-gray-50 rounded border hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="bg-white border-b p-4 space-y-3 shadow-2xl absolute w-full top-14 left-0 z-[60]">
            <div className="flex p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => {
                  setRole("volunteer");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex-1 py-2 text-sm font-bold rounded ${
                  role === "volunteer"
                    ? "bg-white shadow text-indigo-600"
                    : "text-gray-500"
                }`}
              >
                志工視角
              </button>
              <button
                onClick={() => {
                  if (!currentAdmin) setIsAdminLoginOpen(true);
                  else setRole("admin");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex-1 py-2 text-sm font-bold rounded ${
                  role === "admin"
                    ? "bg-white shadow text-indigo-600"
                    : "text-gray-500"
                }`}
              >
                管理後台
              </button>
            </div>
            {role === "admin" && currentAdmin && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setEventForm({
                      id: "",
                      date: todayStr,
                      name: "",
                      location: "",
                      startTime: "09:00",
                      endTime: "12:00",
                      hasMeal: false,
                      hasParking: false,
                      quota: 5,
                      description: "",
                    });
                    setIsEventModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-bold text-indigo-700 col-span-2"
                >
                  <CalendarIcon size={16} className="inline mr-1" />
                  發布新活動
                </button>
                {currentAdmin.isSuper && (
                  <button
                    onClick={() => {
                      setIsAdminManageOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-3 border rounded-lg text-sm font-bold bg-gray-50"
                  >
                    <Key size={16} className="inline mr-1" />
                    權限管理
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsAdminPwdModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-3 border rounded-lg text-sm font-bold bg-gray-50"
                >
                  <Edit size={16} className="inline mr-1" />
                  更改密碼
                </button>
                <button
                  onClick={() => {
                    setIsVolManageOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-3 border rounded-lg text-sm font-bold bg-gray-50"
                >
                  <Users size={16} className="inline mr-1" />
                  志工名單
                </button>
                <button
                  onClick={() => {
                    openSettingsModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-3 border rounded-lg text-sm font-bold bg-gray-50"
                >
                  <Settings size={16} className="inline mr-1" />
                  固定排班
                </button>
                <button
                  onClick={handleAdminLogout}
                  className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold col-span-2"
                >
                  <LogOut size={16} className="inline mr-1" />
                  登出管理員
                </button>
              </div>
            )}
            {role === "volunteer" &&
              (currentUser ? (
                <div className="space-y-2">
                  <div className="text-center font-bold text-gray-700 pb-2 border-b">
                    您好，{currentUser}
                  </div>
                  <button
                    onClick={() => {
                      setIsVolPwdModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg font-bold"
                  >
                    <Key size={18} className="inline mr-2" />
                    更改密碼
                  </button>
                  <button
                    onClick={handleVolLogout}
                    className="w-full py-3 bg-gray-100 text-gray-600 rounded-lg font-bold"
                  >
                    登出志工
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsVolLoginOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold"
                >
                  登入志工帳號
                </button>
              ))}
          </div>
        )}
      </header>

      <main className="p-2 max-w-6xl mx-auto">
        <div className="flex justify-between items-center my-3 px-1">
          <h2 className="text-lg font-bold text-gray-800">
            {currentDate.getFullYear()} 年 {currentDate.getMonth() + 1} 月
          </h2>
          <div className="flex space-x-1">
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    1
                  )
                )
              }
              className="p-2 bg-white border rounded shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => fetchData()}
              className="p-2 bg-white border rounded shadow-sm text-indigo-600"
            >
              <RefreshCcw
                size={16}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    1
                  )
                )
              }
              className="p-2 bg-white border rounded shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border overflow-hidden relative z-0">
          <div className="grid grid-cols-7 bg-gray-200 gap-px">
            {renderCalendar()}
          </div>
        </div>
      </main>

      {/* ======================= 所有彈出視窗 ======================= */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-indigo-50">
              <h3 className="text-lg font-bold text-indigo-800 flex items-center">
                <AlertCircle size={20} className="mr-2" />
                系統確認
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 font-medium whitespace-pre-wrap">
                {confirmDialog.message}
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() =>
                  setConfirmDialog({
                    isOpen: false,
                    message: "",
                    onConfirm: null,
                  })
                }
                className="px-4 py-2 text-gray-600 bg-white border rounded-lg"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                  setConfirmDialog({
                    isOpen: false,
                    message: "",
                    onConfirm: null,
                  });
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                確定
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdminLoginOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold mb-4 flex items-center text-lg">
              <Shield size={20} className="mr-2 text-indigo-600" />
              後台登入
            </h3>
            <input
              type="text"
              value={adminLoginForm.username}
              placeholder="帳號 (yun)"
              onChange={(e) =>
                setAdminLoginForm({
                  ...adminLoginForm,
                  username: e.target.value,
                })
              }
              className="w-full border p-3 mb-3 rounded-lg outline-none"
            />
            <input
              type="password"
              value={adminLoginForm.password}
              placeholder="密碼"
              onChange={(e) =>
                setAdminLoginForm({
                  ...adminLoginForm,
                  password: e.target.value,
                })
              }
              className="w-full border p-3 mb-4 rounded-lg outline-none"
            />
            <button
              onClick={handleAdminLogin}
              className="w-full py-3 bg-indigo-800 text-white rounded-lg font-bold"
            >
              登入系統
            </button>
            <button
              onClick={() => setIsAdminLoginOpen(false)}
              className="w-full mt-3 py-2 text-gray-500"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {isVolLoginOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold mb-4 flex items-center text-lg">
              <User size={20} className="mr-2 text-indigo-600" />
              志工登入
            </h3>
            <select
              value={volLoginForm.name}
              onChange={(e) =>
                setVolLoginForm({ ...volLoginForm, name: e.target.value })
              }
              className="w-full border p-3 mb-3 rounded-lg bg-white"
            >
              <option value="">-- 選擇姓名 --</option>
              {volunteers
                .filter((v) => !v.isArchived)
                .map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name}
                  </option>
                ))}
            </select>
            <input
              type="password"
              value={volLoginForm.password}
              placeholder="請輸入密碼"
              onChange={(e) =>
                setVolLoginForm({ ...volLoginForm, password: e.target.value })
              }
              className="w-full border p-3 mb-4 rounded-lg outline-none"
            />
            <button
              onClick={handleVolLogin}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold"
            >
              登入
            </button>
            <button
              onClick={() => setIsVolLoginOpen(false)}
              className="w-full mt-3 py-2 text-gray-500"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {isVolPwdModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center">
                <Key size={20} className="mr-2 text-indigo-600" />
                志工密碼更改
              </h3>
              <button onClick={() => setIsVolPwdModalOpen(false)}>
                <X className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleVolPwdChange} className="space-y-4">
              <input
                type="password"
                required
                placeholder="原密碼"
                value={volPwdForm.oldPwd}
                onChange={(e) =>
                  setVolPwdForm({ ...volPwdForm, oldPwd: e.target.value })
                }
                className="w-full border p-3 rounded-lg bg-gray-50 outline-none"
              />
              <input
                type="password"
                required
                placeholder="新密碼"
                value={volPwdForm.newPwd}
                onChange={(e) =>
                  setVolPwdForm({ ...volPwdForm, newPwd: e.target.value })
                }
                className="w-full border p-3 rounded-lg bg-gray-50 outline-none"
              />
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold"
              >
                確認修改
              </button>
            </form>
          </div>
        </div>
      )}

      {isAdminPwdModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center">
                <Edit size={20} className="mr-2 text-indigo-600" />
                管理員密碼更改
              </h3>
              <button onClick={() => setIsAdminPwdModalOpen(false)}>
                <X className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAdminPwdChange} className="space-y-4">
              <input
                type="password"
                required
                placeholder="原密碼"
                value={adminPwdForm.oldPwd}
                onChange={(e) =>
                  setAdminPwdForm({ ...adminPwdForm, oldPwd: e.target.value })
                }
                className="w-full border p-3 rounded-lg bg-gray-50 outline-none"
              />
              <input
                type="password"
                required
                placeholder="新密碼"
                value={adminPwdForm.newPwd}
                onChange={(e) =>
                  setAdminPwdForm({ ...adminPwdForm, newPwd: e.target.value })
                }
                className="w-full border p-3 rounded-lg bg-gray-50 outline-none"
              />
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold"
              >
                確認修改
              </button>
            </form>
          </div>
        </div>
      )}

      {isAdminManageOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between bg-gray-50">
              <h3 className="font-bold flex items-center">
                <Key className="mr-2 text-indigo-600" />
                管理員權限設定
              </h3>
              <button onClick={() => setIsAdminManageOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-bold mb-3 border-b pb-2">新增管理員</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="登入帳號"
                    value={newAdminForm.username}
                    onChange={(e) =>
                      setNewAdminForm({
                        ...newAdminForm,
                        username: e.target.value,
                      })
                    }
                    className="border p-2 rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    placeholder="顯示名稱"
                    value={newAdminForm.name}
                    onChange={(e) =>
                      setNewAdminForm({ ...newAdminForm, name: e.target.value })
                    }
                    className="border p-2 rounded-lg outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="密碼"
                    value={newAdminForm.password}
                    onChange={(e) =>
                      setNewAdminForm({
                        ...newAdminForm,
                        password: e.target.value,
                      })
                    }
                    className="border p-2 rounded-lg outline-none flex-1"
                  />
                  <label className="flex items-center text-sm font-bold bg-gray-50 px-3 py-2 rounded-lg border">
                    <input
                      type="checkbox"
                      checked={newAdminForm.isSuper}
                      onChange={(e) =>
                        setNewAdminForm({
                          ...newAdminForm,
                          isSuper: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    最高權限
                  </label>
                </div>
                <button
                  onClick={handleAddAdmin}
                  className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-lg font-bold"
                >
                  新增帳號
                </button>
              </div>
              <div>
                <h4 className="font-bold mb-2">現有名單</h4>
                <div className="space-y-2">
                  {admins.map((a) => (
                    <div
                      key={a.username}
                      className="flex justify-between items-center bg-white border p-3 rounded-lg"
                    >
                      <div>
                        <p className="font-bold">
                          {a.name}{" "}
                          <span className="text-xs text-gray-500 font-normal ml-2">
                            帳號: {a.username}
                          </span>
                        </p>
                        {a.isSuper && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 rounded-full inline-block">
                            最高權限
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => resetAdminPassword(a.username)}
                          className="p-2 rounded bg-gray-50 text-blue-600 border"
                        >
                          <RefreshCcw size={16} />
                        </button>
                        <button
                          onClick={() => handleRemoveAdmin(a.username)}
                          disabled={
                            isSameStr(a.username, currentAdmin.username) ||
                            isSameStr(a.username, "yun")
                          }
                          className={`p-2 rounded border ${
                            isSameStr(a.username, currentAdmin.username) ||
                            isSameStr(a.username, "yun")
                              ? "text-gray-300 bg-gray-50"
                              : "text-red-500 bg-red-50 hover:bg-red-100"
                          }`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isVolManageOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between bg-gray-50">
              <h3 className="font-bold flex items-center">
                <Users className="mr-2 text-indigo-600" /> 志工名單管理
              </h3>
              <button onClick={() => setIsVolManageOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex space-x-2 mb-6">
                <input
                  type="text"
                  value={newVolName}
                  onChange={(e) => setNewVolName(e.target.value)}
                  placeholder="輸入新志工姓名"
                  className="flex-1 border p-3 rounded-lg outline-none"
                />
                <button
                  onClick={handleAddVolunteer}
                  className="px-5 bg-indigo-600 text-white rounded-lg font-bold"
                >
                  新增
                </button>
              </div>
              <div className="space-y-2">
                {volunteers.map((v) => (
                  <div
                    key={v.name}
                    className={`flex justify-between items-center border p-3 rounded-lg ${
                      v.isArchived ? "bg-gray-100" : "bg-white"
                    }`}
                  >
                    <span
                      className={`font-bold ${
                        v.isArchived ? "text-gray-400" : "text-gray-800"
                      }`}
                    >
                      {v.name}{" "}
                      {v.isArchived && (
                        <span className="text-xs text-red-500 ml-1 font-normal">
                          (停用)
                        </span>
                      )}
                    </span>
                    <div className="flex space-x-2">
                      {!v.isArchived ? (
                        <>
                          <button
                            onClick={() => resetVolPassword(v.name)}
                            className="text-xs bg-white border px-3 py-1.5 rounded-lg"
                          >
                            密碼歸零
                          </button>
                          <button
                            onClick={() => handleRemoveVolunteer(v.name)}
                            className="text-red-500 bg-red-50 p-2 rounded-lg border border-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestoreVolunteer(v.name)}
                          className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-bold"
                        >
                          恢復權限
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center">
                <Settings className="mr-2 text-indigo-600" />
                固定排班設定
              </h3>
              <button onClick={() => setIsSettingsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto space-y-3 bg-gray-50/50">
              {[1, 2, 3, 4, 5].map((day) => (
                <div
                  key={day}
                  className="flex flex-col sm:flex-row sm:items-center bg-white p-4 rounded-xl border shadow-sm gap-3"
                >
                  <div className="w-full sm:w-16 font-bold text-indigo-700 text-lg">
                    週{getDayName(day)}
                  </div>
                  {["上午", "下午"].map((p) => {
                    const shift = tempShifts.find(
                      (s) => Number(s.dayOfWeek) === day && s.period === p
                    );
                    return (
                      <div
                        key={p}
                        className="flex-1 flex items-center bg-gray-50 p-2 rounded-lg border"
                      >
                        <span className="text-sm font-bold text-gray-600 w-10">
                          {p}
                        </span>
                        <select
                          value={shift ? shift.volunteer : ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            let news = [...tempShifts].filter(
                              (s) =>
                                !(Number(s.dayOfWeek) === day && s.period === p)
                            );
                            if (val)
                              news.push({
                                dayOfWeek: day,
                                period: p,
                                volunteer: val,
                              });
                            setTempShifts(news);
                          }}
                          className="flex-1 border-0 bg-transparent font-bold outline-none"
                        >
                          <option value="">-- 缺額 --</option>
                          {volunteers.map((v) => (
                            <option key={v.name} value={v.name}>
                              {v.name}
                              {v.isArchived ? " (停)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t bg-white flex justify-end space-x-3">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold shadow-md"
              >
                儲存設定
              </button>
            </div>
          </div>
        </div>
      )}

      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between">
              <h3 className="font-bold flex items-center">
                <CalendarIcon className="mr-2 text-indigo-600" />
                {eventForm.id ? "編輯活動" : "發布新活動"}
              </h3>
              <button onClick={() => setIsEventModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">
                  活動日期 *
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={eventForm.date}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, date: e.target.value })
                  }
                  className="w-full border p-3 rounded-lg bg-gray-50 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  活動名稱 *
                </label>
                <input
                  type="text"
                  value={eventForm.name}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, name: e.target.value })
                  }
                  className="w-full border p-3 rounded-lg bg-gray-50 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">
                    需求人數
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={eventForm.quota}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        quota: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full border p-3 rounded-lg bg-gray-50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">地點</label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, location: e.target.value })
                    }
                    className="w-full border p-3 rounded-lg bg-gray-50 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">
                    開始時間
                  </label>
                  <input
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, startTime: e.target.value })
                    }
                    className="w-full border p-3 rounded-lg bg-gray-50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">
                    結束時間
                  </label>
                  <input
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, endTime: e.target.value })
                    }
                    className="w-full border p-3 rounded-lg bg-gray-50 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  說明 (選填)
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, description: e.target.value })
                  }
                  className="w-full border p-3 rounded-lg h-24 bg-gray-50 outline-none"
                ></textarea>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-3">
                <label className="flex items-center font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={eventForm.hasMeal}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, hasMeal: e.target.checked })
                    }
                    className="mr-3 w-5 h-5 rounded text-indigo-600"
                  />
                  需要調查飲食 (葷/素)
                </label>
                <label className="flex items-center font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={eventForm.hasParking}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        hasParking: e.target.checked,
                      })
                    }
                    className="mr-3 w-5 h-5 rounded text-indigo-600"
                  />
                  提供汽車停車證申請
                </label>
              </div>
            </div>
            <div className="px-6 py-4 bg-white border-t flex justify-end space-x-3">
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleSaveEvent}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold"
              >
                {eventForm.id ? "儲存更新" : "發布活動"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdminViewModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold flex items-center">
                <Check className="mr-2 text-indigo-600" />
                報名審核管理
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEventForm(selectedEvent);
                    setIsEventModalOpen(true);
                    setIsAdminViewModalOpen(false);
                  }}
                  className="p-2 text-blue-600 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={handleDeleteEventClick}
                  className="p-2 text-red-600 bg-red-50 rounded-lg border border-red-100"
                >
                  <Trash2 size={18} />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button
                  onClick={() => setIsAdminViewModalOpen(false)}
                  className="p-2 text-gray-400 bg-white border rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <h4 className="font-bold text-xl text-indigo-800">
                  {selectedEvent.name}
                </h4>
                <p className="text-sm font-medium text-gray-600 mt-2 flex items-center">
                  <Clock size={16} className="mr-1" />
                  {selectedEvent.date} {selectedEvent.startTime}-
                  {selectedEvent.endTime}
                </p>
                <p className="text-sm font-bold text-emerald-600 mt-2 bg-emerald-50 inline-block px-2 py-1 rounded">
                  名額: {selectedEvent.quota} 人
                </p>
                {selectedEvent.description && (
                  <p className="text-sm text-gray-600 mt-3 border-t pt-3">
                    {selectedEvent.description}
                  </p>
                )}
              </div>
              {["pending", "approved", "leave"].map((status) => {
                const list = registrations.filter(
                  (r) =>
                    String(r.eventId) === String(selectedEvent.id) &&
                    r.status === status
                );
                if (status === "leave" && list.length === 0) return null;
                const titles = {
                  pending: "⏳ 待審核/備取",
                  approved: "✅ 已核准",
                  leave: "❌ 已請假",
                };
                const colors = {
                  pending: "text-orange-600",
                  approved: "text-emerald-700",
                  leave: "text-red-600",
                };
                return (
                  <div
                    key={status}
                    className="bg-white rounded-xl border p-4 shadow-sm"
                  >
                    <h5
                      className={`font-bold mb-3 flex justify-between border-b pb-2 ${colors[status]}`}
                    >
                      <span>{titles[status]}</span>
                      <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                        {list.length} 人
                      </span>
                    </h5>
                    <div className="space-y-3">
                      {list.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-2">
                          目前無資料
                        </p>
                      ) : (
                        list.map((reg) => (
                          <div
                            key={reg.id}
                            className="bg-gray-50 border p-3 rounded-lg flex justify-between items-center"
                          >
                            <div>
                              <span className="font-bold block">
                                {reg.volunteerName}
                              </span>
                              {status !== "leave" && (
                                <div className="flex text-xs font-bold text-gray-500 mt-1">
                                  {reg.diet && (
                                    <span className="bg-white border px-1.5 py-0.5 rounded mr-2">
                                      {reg.diet}
                                    </span>
                                  )}
                                  {reg.needsParking && (
                                    <span className="bg-white border px-1.5 py-0.5 rounded">
                                      需車位
                                    </span>
                                  )}
                                </div>
                              )}
                              {status === "leave" && (
                                <p className="text-sm text-red-600 font-medium mt-1">
                                  事由: {reg.leaveReason}
                                </p>
                              )}
                            </div>
                            {status !== "leave" && (
                              <button
                                onClick={() => toggleApproval(reg.id, status)}
                                className={`px-4 py-2 text-sm font-bold rounded-lg shadow-sm ${
                                  status === "pending"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white border text-red-500"
                                }`}
                              >
                                {status === "pending" ? "核准" : "取消核准"}
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isAdminSupportViewOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between bg-gray-50">
              <h3 className="font-bold">行政班表指派</h3>
              <button onClick={() => setIsAdminSupportViewOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center pb-4 border-b">
                <p className="text-sm text-gray-500 mb-1 font-bold">
                  {selectedEvent.date} [{selectedEvent.period}]
                </p>
                <p className="text-2xl font-bold text-indigo-800">
                  {selectedEvent.statusInfo.assignedTo || "尚缺固定志工"}
                </p>
              </div>
              {selectedEvent.statusInfo.leave && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex flex-col gap-3">
                  <div>
                    <p className="font-bold text-yellow-800 mb-1">已請假</p>
                    <p className="text-sm text-yellow-900">
                      事由：{selectedEvent.statusInfo.leave.reason}
                    </p>
                  </div>
                  <button
                    onClick={adminRemoveLeave}
                    className="text-sm bg-white text-red-500 border border-red-200 py-2 rounded-lg font-bold"
                  >
                    撤銷此假單
                  </button>
                </div>
              )}
              {selectedEvent.statusInfo.sub && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col gap-3">
                  <p className="font-bold text-emerald-800">
                    目前代班：{selectedEvent.statusInfo.sub.volunteer}
                  </p>
                  <button
                    onClick={adminRemoveSub}
                    className="text-sm bg-white text-red-500 border border-red-200 py-2 rounded-lg font-bold"
                  >
                    強制移除代班
                  </button>
                </div>
              )}
              <div className="pt-2 border-t mt-4">
                <p className="text-sm font-bold text-gray-700 mb-2">
                  單日特別指派 / 變更代班
                </p>
                <div className="flex gap-2">
                  <select
                    value={adminAssignVol}
                    onChange={(e) => setAdminAssignVol(e.target.value)}
                    className="flex-1 border p-2 rounded-lg text-sm bg-gray-50 outline-none"
                  >
                    <option value="">-- 選擇志工 --</option>
                    {volunteers
                      .filter((v) => !v.isArchived)
                      .map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleAdminAssignShift}
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm"
                  >
                    指派
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRegModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between bg-indigo-50">
              <h3 className="font-bold text-indigo-800">活動報名</h3>
              <button onClick={() => setIsRegModalOpen(false)}>
                <X className="text-indigo-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100">
                <p className="font-bold text-xl text-indigo-900 mb-3">
                  {selectedEvent.name}
                </p>
                <div className="flex items-center text-sm font-bold text-gray-700">
                  <Clock size={16} className="mr-2 text-indigo-500" />
                  {selectedEvent.date} {selectedEvent.startTime}-
                  {selectedEvent.endTime}
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center text-sm font-bold text-gray-700 mt-2">
                    <MapPin size={16} className="mr-2 text-indigo-500" />
                    地點：{selectedEvent.location}
                  </div>
                )}
              </div>
              {selectedEvent.description && (
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 font-medium border">
                  {selectedEvent.description}
                </div>
              )}
              {(() => {
                const myReg = registrations.find(
                  (r) =>
                    String(r.eventId) === String(selectedEvent.id) &&
                    isSameStr(r.volunteerName, currentUser)
                );
                const appCount = registrations.filter(
                  (r) =>
                    String(r.eventId) === String(selectedEvent.id) &&
                    r.status === "approved"
                ).length;
                const isFull = appCount >= selectedEvent.quota;
                let hasConflict = false;
                if (!myReg || myReg.status === "leave")
                  hasConflict = checkConflict(
                    currentUser,
                    selectedEvent.date,
                    selectedEvent.startTime,
                    selectedEvent.endTime
                  );
                if (myReg?.status === "pending")
                  return (
                    <div className="text-center py-4 border-t">
                      {isFull ? (
                        <p className="text-yellow-600 font-bold mb-6">
                          您目前為【備取】狀態
                        </p>
                      ) : (
                        <p className="text-orange-600 font-bold mb-6">
                          報名審核中，請等候通知
                        </p>
                      )}
                      <button
                        onClick={handleRegisterSubmit}
                        className="w-full py-3 border-2 border-red-500 text-red-500 rounded-lg font-bold"
                      >
                        取消報名
                      </button>
                    </div>
                  );
                if (hasConflict)
                  return (
                    <div className="border-t pt-4">
                      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start text-sm">
                        <AlertCircle size={20} className="mr-2" />
                        <div>
                          <p className="font-bold mb-1">時段衝堂提醒</p>
                          <p>
                            您已經有排定行政班表或代班，請先請假方可報名喔！
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                return (
                  <div className="pt-2 border-t">
                    {isFull && (
                      <p className="text-yellow-600 font-bold bg-yellow-50 p-3 rounded-lg text-center mb-4 border">
                        額滿！目前將列為備取
                      </p>
                    )}
                    <div className="space-y-4 mb-6">
                      {selectedEvent.hasMeal && (
                        <div>
                          <label className="block font-bold mb-2">
                            飲食習慣
                          </label>
                          <div className="flex space-x-4 bg-gray-50 p-2 rounded-lg border">
                            <label className="flex-1 flex justify-center py-2 bg-white rounded shadow-sm font-bold">
                              <input
                                type="radio"
                                value="葷"
                                checked={regForm.diet === "葷"}
                                onChange={(e) =>
                                  setRegForm({
                                    ...regForm,
                                    diet: e.target.value,
                                  })
                                }
                                className="mr-2"
                              />
                              葷食
                            </label>
                            <label className="flex-1 flex justify-center py-2 bg-white rounded shadow-sm font-bold">
                              <input
                                type="radio"
                                value="素"
                                checked={regForm.diet === "素"}
                                onChange={(e) =>
                                  setRegForm({
                                    ...regForm,
                                    diet: e.target.value,
                                  })
                                }
                                className="mr-2"
                              />
                              素食
                            </label>
                          </div>
                        </div>
                      )}
                      {selectedEvent.hasParking && (
                        <label className="flex items-center justify-center font-bold bg-gray-50 p-4 rounded-lg border cursor-pointer">
                          <input
                            type="checkbox"
                            checked={regForm.needsParking}
                            onChange={(e) =>
                              setRegForm({
                                ...regForm,
                                needsParking: e.target.checked,
                              })
                            }
                            className="mr-3 w-5 h-5 rounded"
                          />
                          我需要停車證
                        </label>
                      )}
                    </div>
                    <button
                      onClick={handleRegisterSubmit}
                      className={`w-full py-4 text-white rounded-xl font-bold shadow-lg ${
                        isFull ? "bg-yellow-500" : "bg-indigo-600"
                      }`}
                    >
                      {isFull ? "登記備取" : "送出報名"}
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {isActLeaveModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-orange-50">
              <h3 className="font-bold text-orange-800">活動請假 (取消出席)</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center pb-3">
                <p className="font-bold text-xl mb-1">{selectedEvent.name}</p>
                <p className="text-sm font-bold text-gray-500">
                  {selectedEvent.date}
                </p>
              </div>
              <p className="text-sm font-bold text-red-500 bg-red-50 p-3 rounded-lg text-center">
                此活動已核准，取消請務必填寫假單。
              </p>
              <textarea
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ reason: e.target.value })}
                className="w-full border-2 rounded-xl p-4 h-32 focus:border-orange-400 outline-none"
                placeholder="請輸入請假原因..."
              ></textarea>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setIsActLeaveModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 rounded-lg font-bold"
                >
                  返回
                </button>
                <button
                  onClick={handleSubmitActLeave}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-bold shadow-md"
                >
                  送出假單
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLeaveModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-yellow-50">
              <h3 className="font-bold text-yellow-800">行政班表請假</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center pb-2">
                <p className="text-lg font-bold text-gray-800">
                  {selectedEvent.date} [{selectedEvent.period}]
                </p>
              </div>
              <textarea
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ reason: e.target.value })}
                className="w-full border-2 rounded-xl p-4 h-32 focus:border-yellow-400 outline-none"
                placeholder="請輸入請假事由..."
              ></textarea>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 rounded-lg font-bold text-gray-600"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmitLeave}
                  className="flex-1 py-3 bg-yellow-500 text-white rounded-lg font-bold shadow-md"
                >
                  確認送出
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSubModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-emerald-50">
              <h3 className="font-bold text-emerald-800">登記代班</h3>
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <p className="text-xl font-bold text-emerald-700 mb-1">
                  {selectedEvent.date}
                </p>
                <p className="text-lg font-bold text-gray-700">
                  [{selectedEvent.period}]
                </p>
              </div>
              <p className="font-bold text-gray-600 text-base">
                此時段有缺額，確定要代班嗎？
              </p>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsSubModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 rounded-lg font-bold text-gray-600"
                >
                  取消
                </button>
                <button
                  onClick={handleTakeSub}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-bold shadow-md"
                >
                  我要代班
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCancelLeaveModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-blue-50">
              <h3 className="font-bold text-blue-800">請假狀態</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center font-bold text-lg border-b pb-4">
                {selectedEvent.date} [{selectedEvent.period}]
              </div>
              {selectedEvent.statusInfo.sub ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-xl text-blue-800 font-bold flex flex-col items-center">
                    <Check size={32} className="mb-2" />
                    <p>已由 {selectedEvent.statusInfo.sub.volunteer} 代班</p>
                  </div>
                  <p className="text-sm text-gray-500 text-center font-bold">
                    已有代班人，無法自行撤銷假單
                  </p>
                  <button
                    onClick={() => setIsCancelLeaveModalOpen(false)}
                    className="w-full py-3 bg-gray-100 rounded-lg font-bold"
                  >
                    關閉
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-center font-bold text-gray-700 text-lg">
                    目前無人代班，確定撤銷請假？
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsCancelLeaveModalOpen(false)}
                      className="flex-1 py-3 bg-gray-100 rounded-lg font-bold text-gray-600"
                    >
                      關閉
                    </button>
                    <button
                      onClick={handleCancelLeave}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-md"
                    >
                      確定銷假
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isCancelSubModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-red-50">
              <h3 className="font-bold text-red-800">取消代班</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center font-bold text-xl border-b pb-4">
                {selectedEvent.date} [{selectedEvent.period}]
              </div>
              <p className="text-center font-bold text-gray-700 text-lg">
                確定要取消您的代班嗎？
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsCancelSubModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 rounded-lg font-bold text-gray-600"
                >
                  返回
                </button>
                <button
                  onClick={handleCancelSub}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold shadow-md"
                >
                  確定取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-[300] font-bold text-indigo-600">
          處理中...
        </div>
      )}
    </div>
  );
}
