import React, { useState, useEffect } from "react";
import { imgCacheAPI } from "../api";

interface CacheStatsProps {
  className?: string;
  showDetails?: boolean;
  refreshInterval?: number;
}

// مكون عرض إحصائيات الكاش (للتطوير والتشخيص)
export const CacheStats: React.FC<CacheStatsProps> = ({
  className,
  showDetails = false,
  refreshInterval = 2000,
}) => {
  const [stats, setStats] = useState({
    cache: { itemCount: 0, totalSize: "0 KB", memoryItems: 0 },
    preload: { queued: 0, active: 0, completed: 0 },
    retry: { activePolicies: 0, totalRetries: 0 },
  });

  useEffect(() => {
    const updateStats = () => {
      setStats(imgCacheAPI.getSystemStats());
    };

    updateStats();
    const interval = setInterval(updateStats, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleClearCache = async () => {
    await imgCacheAPI.cleanup();
    setStats(imgCacheAPI.getSystemStats());
  };

  const containerStyle: React.CSSProperties = {
    padding: "1rem",
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    fontFamily: "monospace",
    fontSize: "0.875rem",
  };

  const statRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.25rem",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "0.25rem",
    cursor: "pointer",
    fontSize: "0.875rem",
    marginTop: "0.5rem",
  };

  return (
    <div className={className} style={containerStyle}>
      <h3
        style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: "bold" }}
      >
        إحصائيات imgCachePro
      </h3>

      <div>
        <strong>الكاش:</strong>
        <div style={statRowStyle}>
          <span>العناصر:</span>
          <span>{stats.cache.itemCount}</span>
        </div>
        <div style={statRowStyle}>
          <span>الحجم الإجمالي:</span>
          <span>{stats.cache.totalSize}</span>
        </div>
        <div style={statRowStyle}>
          <span>في الذاكرة:</span>
          <span>{stats.cache.memoryItems}</span>
        </div>
      </div>

      {showDetails && (
        <>
          <div style={{ marginTop: "1rem" }}>
            <strong>التحميل المسبق:</strong>
            <div style={statRowStyle}>
              <span>في الانتظار:</span>
              <span>{stats.preload.queued}</span>
            </div>
            <div style={statRowStyle}>
              <span>نشط:</span>
              <span>{stats.preload.active}</span>
            </div>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <strong>إعادة المحاولة:</strong>
            <div style={statRowStyle}>
              <span>السياسات النشطة:</span>
              <span>{stats.retry.activePolicies}</span>
            </div>
            <div style={statRowStyle}>
              <span>إجمالي المحاولات:</span>
              <span>{stats.retry.totalRetries}</span>
            </div>
          </div>
        </>
      )}

      <button style={buttonStyle} onClick={handleClearCache}>
        تنظيف الكاش
      </button>
    </div>
  );
};
