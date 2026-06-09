import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  adminLoginApi,
  clearAdminSession,
  clearLeadsOnApi,
  deleteLeadOnApi,
  fetchAdminSiteDataFromApi,
  fetchLeadsFromApi,
  fetchSiteDataFromApi,
  fetchTelegramStatus,
  hasAdminSession,
  isApiAvailable,
  resetSiteDataOnApi,
  saveSiteDataToApi,
  setAdminSession,
  submitLeadToApi,
  testTelegramConnection,
} from "../api/client";
import {
  addSubmission,
  applyTheme,
  clearSubmissions,
  deleteSubmission,
  exportJson,
  getSubmissions,
  importJson,
  loadSiteData,
  resetAdminPassword,
  resetSiteData,
  saveSiteData,
  verifyPassword,
} from "../data/store";
import { DEFAULT_PASSWORD } from "../data/defaultData";

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [data, setData] = useState(() => loadSiteData());
  const [submissions, setSubmissions] = useState([]);
  const [isAdmin, setIsAdmin] = useState(hasAdminSession);
  const [useApi, setUseApi] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    applyTheme(data.theme);
  }, [data.theme]);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const apiOk = await isApiAvailable();
      if (!active) return;
      setUseApi(apiOk);

      if (apiOk) {
        try {
          if (hasAdminSession()) {
            const full = await fetchAdminSiteDataFromApi();
            if (active) setData(full);
          } else {
            const remote = await fetchSiteDataFromApi();
            if (active) setData({ ...loadSiteData(), ...remote, adminPassword: loadSiteData().adminPassword, telegram: loadSiteData().telegram });
          }
        } catch {
          if (active) setData(loadSiteData());
        }
      } else {
        setData(loadSiteData());
        setSubmissions(getSubmissions());
      }

      if (active) setReady(true);
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready || !useApi || !isAdmin) return;
    fetchLeadsFromApi()
      .then(setSubmissions)
      .catch(() => setSubmissions([]));
  }, [ready, useApi, isAdmin]);

  const value = useMemo(
    () => ({
      data,
      submissions,
      isAdmin,
      ready,
      useApi,
      login: async (password) => {
        const trimmed = String(password).trim();
        if (useApi) {
          try {
            const result = await adminLoginApi(trimmed);
            setAdminSession(trimmed);
            setIsAdmin(true);
            setData(result.data);
            setSubmissions(await fetchLeadsFromApi());
            return true;
          } catch {
            return false;
          }
        }
        if (!verifyPassword(trimmed)) return false;
        setAdminSession(trimmed);
        setIsAdmin(true);
        setSubmissions(getSubmissions());
        return true;
      },
      logout: () => {
        clearAdminSession();
        setIsAdmin(false);
        if (useApi) {
          fetchSiteDataFromApi().then((publicData) => setData((prev) => ({ ...publicData, adminPassword: prev.adminPassword, telegram: prev.telegram }))).catch(() => {});
        }
      },
      resetPassword: async () => {
        resetAdminPassword();
        const next = loadSiteData();
        if (useApi) {
          try {
            const saved = await saveSiteDataToApi(next);
            setData(saved);
            return;
          } catch (_) {}
        }
        setData(next);
      },
      updateData: async (next) => {
        if (useApi) {
          const saved = await saveSiteDataToApi(next);
          setData(saved);
          saveSiteData(saved);
          return saved;
        }
        const saved = saveSiteData(next);
        setData(saved);
        return saved;
      },
      resetData: async () => {
        if (useApi) {
          const fresh = await resetSiteDataOnApi();
          setData(fresh);
          resetSiteData();
          return fresh;
        }
        const fresh = resetSiteData();
        setData(fresh);
        return fresh;
      },
      exportData: () => exportJson(data),
      importData: async (json) => {
        const parsed = importJson(json);
        if (useApi) {
          const saved = await saveSiteDataToApi(parsed);
          setData(saved);
          return saved;
        }
        setData(parsed);
        return parsed;
      },
      submitLead: async (entry) => {
        if (useApi) {
          const lead = await submitLeadToApi(entry);
          if (isAdmin) setSubmissions((prev) => [lead, ...prev]);
          return;
        }
        setSubmissions(addSubmission(entry));
      },
      removeSubmission: async (id) => {
        if (useApi) {
          setSubmissions(await deleteLeadOnApi(id));
          return;
        }
        setSubmissions(deleteSubmission(id));
      },
      clearAllSubmissions: async () => {
        if (useApi) {
          setSubmissions(await clearLeadsOnApi());
          return;
        }
        clearSubmissions();
        setSubmissions([]);
      },
      testTelegram: async (telegram) => {
        if (!useApi) throw new Error("Telegram работает только на сервере (Railway)");
        const result = await testTelegramConnection(telegram);
        setData((prev) => ({ ...prev, telegram: result.telegram }));
        return result;
      },
      getTelegramStatus: async () => {
        if (!useApi) return { connected: false, enabled: false };
        return fetchTelegramStatus();
      },
      defaultPassword: DEFAULT_PASSWORD,
    }),
    [data, submissions, isAdmin, ready, useApi]
  );

  if (!ready) {
    return (
      <div className="lg-loader">
        <div className="lg-loader-mark">LG</div>
        <p>LifeGift</p>
      </div>
    );
  }

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}
