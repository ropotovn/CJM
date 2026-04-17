import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertOctagon,
  Radio,
  UserCog,
  Siren,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldAlert,
  Wrench,
  ChevronDown
} from 'lucide-react';
import { getStageOps, teams, TeamRole, RiskItem, IncidentScenario } from '../data/operationsData';
import { segments, Segment } from '../data/cjmData';

const severityStyle = (s: 'low' | 'medium' | 'high') => {
  switch (s) {
    case 'high':   return { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    chip: 'bg-red-100',    label: 'Высокая' };
    case 'medium': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', chip: 'bg-orange-100', label: 'Средняя' };
    case 'low':    return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', chip: 'bg-yellow-100', label: 'Низкая'  };
  }
};

const priorityStyle = (p: 'основной' | 'поддерживающий' | 'дополнительный') => {
  switch (p) {
    case 'основной':         return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'поддерживающий':   return 'bg-sky-100 text-sky-700 border-sky-200';
    case 'дополнительный':   return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

/* ─── Tab Header ─── */
type TabKey = 'risks' | 'channels' | 'segments' | 'incidents';

const tabs: { key: TabKey; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'risks',     label: 'Риски и улучшения',      icon: <AlertOctagon size={16} />, color: 'text-rose-600' },
  { key: 'channels',  label: 'Каналы коммуникации',    icon: <Radio size={16} />,        color: 'text-indigo-600' },
  { key: 'segments',  label: 'Тактика по сегментам',   icon: <UserCog size={16} />,      color: 'text-emerald-600' },
  { key: 'incidents', label: 'Реагирование на инциденты', icon: <Siren size={16} />,    color: 'text-orange-600' }
];

/* ─── Risks tab ─── */
const RisksTab: React.FC<{ risks: RiskItem[]; improvements: string[] }> = ({ risks, improvements }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {/* Risks */}
    <div>
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert size={16} className="text-rose-600" />
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Сложности и опасности</h4>
      </div>
      <div className="space-y-3">
        {risks.map((r, i) => {
          const s = severityStyle(r.severity);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`p-4 rounded-xl border ${s.border} ${s.bg}`}
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <h5 className={`font-bold text-sm ${s.text}`}>{r.title}</h5>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.chip} ${s.text} flex-shrink-0`}>
                  {s.label}
                </span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{r.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>

    {/* Improvements */}
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Wrench size={16} className="text-emerald-600" />
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Что улучшить</h4>
      </div>
      <div className="space-y-2">
        {improvements.map((imp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100"
          >
            <Sparkles size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-emerald-900 leading-snug">{imp}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Channels tab ─── */
const ChannelsTab: React.FC<{ channels: ReturnType<typeof getStageOps> extends infer R ? R extends { channels: infer C } ? C : never : never }> = ({ channels }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {channels.map((c, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.04 }}
        className="p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all"
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-indigo-500" />
            <h5 className="font-bold text-sm text-gray-900">{c.name}</h5>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityStyle(c.priority)} flex-shrink-0`}>
            {c.priority}
          </span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">{c.purpose}</p>
      </motion.div>
    ))}
  </div>
);

/* ─── Segment tactics tab ─── */
const SegmentsTab: React.FC<{ tactics: NonNullable<ReturnType<typeof getStageOps>>['segmentTactics']; activeSegment: string | null }> = ({ tactics, activeSegment }) => {
  const filtered = activeSegment ? tactics.filter(t => t.segmentId === activeSegment) : tactics;

  return (
    <div className={`grid grid-cols-1 ${filtered.length > 1 ? 'lg:grid-cols-3' : ''} gap-4`}>
      {filtered.map((t, i) => {
        const seg = segments.find((s: Segment) => s.id === t.segmentId)!;
        return (
          <motion.div
            key={t.segmentId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border-2 overflow-hidden"
            style={{ borderColor: seg.colorLight, background: `linear-gradient(180deg, ${seg.colorLight}55, white)` }}
          >
            {/* Header */}
            <div className="p-4 border-b" style={{ borderColor: seg.colorLight, background: `${seg.colorLight}66` }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{seg.icon}</span>
                <div>
                  <h5 className="font-bold text-sm" style={{ color: seg.colorDark }}>{seg.name}</h5>
                  <p className="text-[11px] text-gray-500">{seg.age}</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Focus */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Фокус коммуникации</span>
                <p className="text-sm text-gray-800 mt-0.5 font-medium">{t.focus}</p>
              </div>

              {/* Tone */}
              <div className="p-2.5 rounded-lg bg-white/70 border" style={{ borderColor: seg.colorLight }}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: seg.colorDark }}>Тон</span>
                <p className="text-xs text-gray-700 mt-0.5">{t.tone}</p>
              </div>

              {/* Do / Dont */}
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Делать
                  </span>
                  <ul className="mt-1 space-y-1">
                    {t.doList.map((d, j) => (
                      <li key={j} className="flex items-start gap-1.5 text-xs text-gray-700">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0"></span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1">
                    <XCircle size={11} /> НЕ делать
                  </span>
                  <ul className="mt-1 space-y-1">
                    {t.dontList.map((d, j) => (
                      <li key={j} className="flex items-start gap-1.5 text-xs text-gray-700">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-rose-500 flex-shrink-0"></span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

/* ─── Incidents tab ─── */
const IncidentCard: React.FC<{ incident: IncidentScenario; index: number }> = ({ incident, index }) => {
  const [open, setOpen] = useState(index === 0);
  const respTeam = teams[incident.responsible];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl border-2 border-orange-100 bg-gradient-to-br from-orange-50/40 to-white overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-orange-50/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
          <Siren size={18} className="text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 px-2 py-0.5 rounded-full bg-orange-100">
              Инцидент
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white flex items-center gap-1"
              style={{ backgroundColor: respTeam.color }}
            >
              {respTeam.icon} {respTeam.name}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900 leading-snug">{incident.trigger}</p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronDown size={18} className="text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-orange-100 pt-4">
              {/* Immediate action */}
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <div className="flex items-center gap-1.5 mb-1">
                  <Siren size={12} className="text-rose-700" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Срочные действия</span>
                </div>
                <p className="text-sm text-rose-900 leading-snug">{incident.immediateAction}</p>
              </div>

              {/* Responsible & Supporting */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 block">Кто отвечает и кто помогает</span>
                <div className="flex flex-wrap gap-2">
                  <span
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
                    style={{ backgroundColor: respTeam.color }}
                  >
                    {respTeam.icon} {respTeam.name}
                    <span className="ml-1 text-[9px] uppercase opacity-90">Ответственный</span>
                  </span>
                  {incident.supporting.map(role => {
                    const t = teams[role];
                    return (
                      <span
                        key={role}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium border-2"
                        style={{ borderColor: t.color, color: t.color }}
                      >
                        {t.icon} {t.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* How to detect */}
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                <div className="flex items-center gap-1.5 mb-1">
                  <Eye size={12} className="text-sky-700" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">Как отследить</span>
                </div>
                <p className="text-sm text-sky-900 leading-snug">{incident.howToDetect}</p>
              </div>

              {/* Prevention */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={12} className="text-emerald-700" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Как не допустить впредь</span>
                </div>
                <p className="text-sm text-emerald-900 leading-snug">{incident.preventionTip}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const IncidentsTab: React.FC<{ incidents: IncidentScenario[] }> = ({ incidents }) => (
  <div className="space-y-3">
    {/* Legend */}
    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
      <p className="text-xs text-slate-600 leading-relaxed">
        <strong className="text-slate-800">Сценарий реагирования:</strong> что делать, если опасность реализовалась.
        Указан ответственный отдел, поддерживающие команды, способ отслеживания и предотвращения.
      </p>
    </div>

    {/* Teams legend */}
    <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-white border border-gray-100">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1 self-center">Команды:</span>
      {(Object.values(teams) as { id: TeamRole; name: string; icon: string; color: string }[]).map(t => (
        <span
          key={t.id}
          className="text-[10px] font-medium px-2 py-1 rounded-lg border"
          style={{ borderColor: t.color + '55', color: t.color }}
        >
          {t.icon} {t.name}
        </span>
      ))}
    </div>

    {incidents.map((inc, i) => (
      <IncidentCard key={i} incident={inc} index={i} />
    ))}
  </div>
);

/* ─── Main Operations Section ─── */
export const OperationsSection: React.FC<{
  stageId: string;
  stageTitle: string;
  activeSegment: string | null;
}> = ({ stageId, stageTitle, activeSegment }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('risks');
  const ops = getStageOps(stageId);

  if (!ops) return null;

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 md:p-6 border-b border-gray-100 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white">
            <ShieldAlert size={16} />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-gray-900">Операционная карта этапа</h2>
            <p className="text-xs text-gray-500">{stageTitle} · риски, каналы, тактики и сценарии реагирования</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 md:px-6 pt-4 border-b border-gray-100 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-3 text-sm font-semibold transition-colors flex items-center gap-2 ${
                activeTab === tab.key ? tab.color : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="opsTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: 'currentColor' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-5 md:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'risks'     && <RisksTab risks={ops.risks} improvements={ops.improvements} />}
            {activeTab === 'channels'  && <ChannelsTab channels={ops.channels} />}
            {activeTab === 'segments'  && <SegmentsTab tactics={ops.segmentTactics} activeSegment={activeSegment} />}
            {activeTab === 'incidents' && <IncidentsTab incidents={ops.incidents} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
