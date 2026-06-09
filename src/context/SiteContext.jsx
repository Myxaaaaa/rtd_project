import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearAdminSession,
  clearLeadsOnApi,
  deleteLeadOnApi,
  fetchLeadsFromApi,
  fetchSiteDataFromApi,
  hasAdminSession,
  isApiAvailable,
  resetSiteDataOnApi,
  saveSiteDataToApi,
  setAdminSession,
  submitLeadToApi,
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
import { DEFAULT_DATA, DEFAULT_PASSWORD } from "../data/defaultData";

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
          const remote = await fetchSiteDataFromApi();
          if (active) setData(remote);
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
        let valid = verifyPassword(trimmed);
        if (useApi) {
          try {
            const remote = await fetchSiteDataFromApi();
            setData(remote);
            valid = trimmed === (remote.adminPassword || DEFAULT_PASSWORD);
          } catch {
            valid = verifyPassword(trimmed);
          }
        }
        if (!valid) return false;
        setAdminSession(trimmed);
        setIsAdmin(true);
        if (useApi) {
          try {
            setSubmissions(await fetchLeadsFromApi());
          } catch {
            setSubmissions([]);
          }
        }
        return true;
      },
      logout: () => {
        clearAdminSession();
        setIsAdmin(false);
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
          setSubmissions((prev) => [lead, ...prev]);
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
      defaultPassword: DEFAULT_PASSWORD,
    }),
    [data, submissions, isAdmin, ready, useApi]
  );

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0f172a", color: "#fff" }}>
        LifeGift…
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
