import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().slice(0, 10);
  const toStr = new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/appointments/summary', {
          params: { from: todayStr, to: toStr }
        });
        setRows(data);
      } catch (err) {
        console.error('Error fetching summary:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // run once

  const todayCount = useMemo(
    () => rows.find(r => r.date === todayStr)?.total || 0,
    [rows, todayStr]
  );
  const weekTotal = useMemo(
    () => rows.reduce((s, r) => s + (r.total || 0), 0),
    [rows]
  );

  const hour = new Date().getHours();
  const hello =
    hour < 12 ? 'Good morning' :
      hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="container-page">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          {hello} {user?.name || ''} 👋
        </h1>
        <p className="text-slate-600 mt-1">
          Summary on next 7 days
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        <div className="bg-white rounded-xl shadow p-5 border border-slate-200">
          <h2 className="text-sm font-medium text-slate-500">Today queue</h2>
          <p className="mt-2 text-4xl font-bold text-indigo-600">{todayCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border border-slate-200">
          <h2 className="text-sm font-medium text-slate-500">Summary 7 days</h2>
          <p className="mt-2 text-4xl font-bold text-emerald-600">{weekTotal}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border border-slate-200">
          <h2 className="text-sm font-medium text-slate-500">Period</h2>
          <p className="mt-2 text-lg font-semibold">{todayStr} → {toStr}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border border-slate-200">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Daily details</h2>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="text-center text-slate-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[700px] w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-left text-slate-700 text-sm">
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Total</th>
                    <th className="px-4 py-2">Waiting for confirmation</th>
                    <th className="px-4 py-2">Success</th>
                    <th className="px-4 py-2">Cancel</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.date} className="border-t border-slate-200">
                      <td className="px-4 py-2">{r.date}</td>
                      <td className="px-4 py-2">{r.total}</td>
                      <td className="px-4 py-2">{r.scheduled || 0}</td>
                      <td className="px-4 py-2">{r.completed || 0}</td>
                      <td className="px-4 py-2">{r.cancelled || 0}</td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 text-center text-slate-500">
                        No data today
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
