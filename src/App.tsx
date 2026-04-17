import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Users,
  Heart,
  AlertTriangle,
  Shield,
  Zap,
  Eye,
  Star,
  MessageCircle,
  Target,
  Lightbulb,
  BarChart3,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cjmData, segments, CJMStage, Segment } from './data/cjmData';

/* ─── Helpers ─── */
const emotionLabel = (v: number): string => {
  if (v <= 2) return 'Очень низкий';
  if (v <= 4) return 'Низкий';
  if (v <= 5) return 'Средний';
  if (v <= 7) return 'Высокий';
  if (v <= 8) return 'Хороший';
  return 'Отличный';
};

const emotionColor = (v: number): string => {
  if (v <= 3) return '#ef4444';
  if (v <= 5) return '#f59e0b';
  if (v <= 7) return '#3b82f6';
  return '#10b981';
};

const emotionEmoji = (v: number): string => {
  if (v <= 2) return '😰';
  if (v <= 4) return '😟';
  if (v <= 5) return '😐';
  if (v <= 7) return '🙂';
  if (v <= 8) return '😊';
  return '😄';
};

/* ─── Section config ─── */
interface SectionConfig {
  key: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const sectionConfigs: SectionConfig[] = [
  { key: 'actions', title: 'Действия', icon: <Zap size={16} />, color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { key: 'touchpoints', title: 'Точки контакта', icon: <Users size={16} />, color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  { key: 'goals', title: 'Цели и мотивация', icon: <Target size={16} />, color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { key: 'thoughts', title: 'Мысли', icon: <MessageCircle size={16} />, color: 'text-sky-700', bgColor: 'bg-sky-50', borderColor: 'border-sky-200' },
  { key: 'emotions', title: 'Эмоции', icon: <Heart size={16} />, color: 'text-pink-700', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' },
  { key: 'pains', title: 'Боли', icon: <AlertTriangle size={16} />, color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  { key: 'barriers', title: 'Барьеры', icon: <Shield size={16} />, color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { key: 'triggers', title: 'Триггеры', icon: <Zap size={16} />, color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  { key: 'expectations', title: 'Ожидания', icon: <Eye size={16} />, color: 'text-indigo-700', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  { key: 'possibleProblems', title: 'Возможные проблемы', icon: <AlertTriangle size={16} />, color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },
  { key: 'momentOfTruth', title: 'Момент истины', icon: <Star size={16} />, color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { key: 'metrics', title: 'Метрики', icon: <BarChart3 size={16} />, color: 'text-cyan-700', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' },
  { key: 'opportunities', title: 'Возможности', icon: <Lightbulb size={16} />, color: 'text-lime-700', bgColor: 'bg-lime-50', borderColor: 'border-lime-200' },
];

/* ─── Emotion Curve SVG ─── */
const EmotionCurve: React.FC<{
  stages: CJMStage[];
  activeIndex: number;
  activeSegment: string | null;
  onStageClick: (i: number) => void;
}> = ({ stages, activeIndex, activeSegment, onStageClick }) => {
  const w = 900;
  const h = 180;
  const pad = 60;
  const plotW = w - pad * 2;
  const plotH = h - 50;

  const getEmotionValue = (stage: CJMStage): number => {
    if (activeSegment) {
      const seg = stage.segments.find(s => s.segmentId === activeSegment);
      return seg ? seg.emotionValue : stage.emotionValue;
    }
    return stage.emotionValue;
  };

  const points = stages.map((s, i) => ({
    x: pad + (i / (stages.length - 1)) * plotW,
    y: 30 + plotH - ((getEmotionValue(s) - 1) / 9) * plotH,
  }));

  const buildPath = () => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cp1x = points[i].x + (points[i + 1].x - points[i].x) * 0.4;
      const cp2x = points[i + 1].x - (points[i + 1].x - points[i].x) * 0.4;
      d += ` C ${cp1x} ${points[i].y}, ${cp2x} ${points[i + 1].y}, ${points[i + 1].x} ${points[i + 1].y}`;
    }
    return d;
  };

  const gradientPath = () => {
    const base = buildPath();
    return base + ` L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`;
  };

  const segColor = activeSegment
    ? segments.find(s => s.id === activeSegment)?.color || '#6366f1'
    : '#6366f1';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 200 }}>
      <defs>
        <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={segColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={segColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[1, 3, 5, 7, 9].map(v => {
        const y = 30 + plotH - ((v - 1) / 9) * plotH;
        return (
          <g key={v}>
            <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#e5e7eb" strokeWidth={0.5} strokeDasharray="4 4" />
            <text x={pad - 8} y={y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{v}</text>
          </g>
        );
      })}
      {/* Fill */}
      <motion.path
        d={gradientPath()}
        fill="url(#curveGrad)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      {/* Curve */}
      <motion.path
        d={buildPath()}
        fill="none"
        stroke={segColor}
        strokeWidth={3}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />
      {/* Points */}
      {points.map((p, i) => (
        <g key={i} onClick={() => onStageClick(i)} className="cursor-pointer">
          <motion.circle
            cx={p.x}
            cy={p.y}
            r={activeIndex === i ? 10 : 7}
            fill={activeIndex === i ? segColor : '#fff'}
            stroke={segColor}
            strokeWidth={activeIndex === i ? 3 : 2}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.08, type: 'spring' }}
            whileHover={{ scale: 1.3 }}
          />
          {activeIndex === i && (
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={16}
              fill="none"
              stroke={segColor}
              strokeWidth={1.5}
              strokeOpacity={0.4}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            />
          )}
          <text
            x={p.x}
            y={p.y - 16}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill={emotionColor(getEmotionValue(stages[i]))}
          >
            {emotionEmoji(getEmotionValue(stages[i]))} {getEmotionValue(stages[i])}
          </text>
        </g>
      ))}
    </svg>
  );
};

/* ─── Segment Selector ─── */
const SegmentSelector: React.FC<{
  segments: Segment[];
  active: string | null;
  onSelect: (id: string | null) => void;
}> = ({ segments: segs, active, onSelect }) => (
  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => onSelect(null)}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
        active === null
          ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/20'
          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
      }`}
    >
      👥 Все сегменты
    </button>
    {segs.map(seg => (
      <button
        key={seg.id}
        onClick={() => onSelect(seg.id)}
        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border-2"
        style={{
          backgroundColor: active === seg.id ? seg.color : '#fff',
          color: active === seg.id ? '#fff' : seg.color,
          borderColor: active === seg.id ? seg.color : seg.colorLight,
          boxShadow: active === seg.id ? `0 4px 14px ${seg.color}33` : 'none',
        }}
      >
        {seg.icon} {seg.shortName}
      </button>
    ))}
  </div>
);

/* ─── Segment Card ─── */
const SegmentCard: React.FC<{ segment: Segment }> = ({ segment }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      className="rounded-2xl border-2 overflow-hidden cursor-pointer"
      style={{ borderColor: segment.colorLight, backgroundColor: `${segment.colorLight}44` }}
      onClick={() => setOpen(!open)}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{segment.icon}</span>
          <div>
            <h4 className="font-bold text-gray-900">{segment.name}</h4>
            <p className="text-xs text-gray-500">{segment.age} · {segment.income} · {segment.children}</p>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={20} className="text-gray-400" />
        </motion.div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 text-sm">
              <p className="text-gray-700 leading-relaxed">{segment.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-white/80">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: segment.color }}>Выгода</span>
                  <p className="text-gray-700 mt-1">{segment.benefit}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/80">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: segment.color }}>Поведение</span>
                  <p className="text-gray-700 mt-1">{segment.behavior}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/80">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: segment.color }}>Стиль жизни</span>
                  <p className="text-gray-700 mt-1">{segment.lifestyle}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/80">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: segment.color }}>Конкуренты</span>
                  <p className="text-gray-700 mt-1">{segment.competitors}</p>
                </div>
              </div>
              <div className="p-3 rounded-xl border-2 bg-white/60" style={{ borderColor: segment.color + '44' }}>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: segment.color }}>Почему покупает</span>
                <p className="text-gray-800 mt-1 font-medium">{segment.whyBuys}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─── Section Block ─── */
const SectionBlock: React.FC<{
  config: SectionConfig;
  content: string | string[] | { channels: string[]; people: string[]; product: string[] };
}> = ({ config, content }) => {
  const [expanded, setExpanded] = useState(false);

  const renderContent = () => {
    if (typeof content === 'string') {
      return <p className="text-gray-700 text-sm leading-relaxed">{content}</p>;
    }
    if (Array.isArray(content)) {
      const items = expanded ? content : content.slice(0, 3);
      return (
        <div>
          <ul className="space-y-1.5">
            {items.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="text-gray-700 text-sm flex items-start gap-2"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: segments.find(() => true)?.color || '#6366f1' }}></span>
                {item}
              </motion.li>
            ))}
          </ul>
          {content.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs font-medium flex items-center gap-1 hover:underline"
              style={{ color: '#6366f1' }}
            >
              {expanded ? <>Свернуть <ChevronUp size={12} /></> : <>Ещё {content.length - 3} <ChevronDown size={12} /></>}
            </button>
          )}
        </div>
      );
    }
    // touchpoints object
    const tp = content as { channels: string[]; people: string[]; product: string[] };
    return (
      <div className="space-y-2">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Каналы</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {tp.channels.map((c, i) => (
              <span key={i} className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium">{c}</span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Люди</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {tp.people.map((p, i) => (
              <span key={i} className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium">{p}</span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Продукт</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {tp.product.map((pr, i) => (
              <span key={i} className="px-2 py-0.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium">{pr}</span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-4 rounded-xl border ${config.borderColor} ${config.bgColor}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={config.color}>{config.icon}</span>
        <h4 className={`font-bold text-sm ${config.color}`}>{config.title}</h4>
      </div>
      {renderContent()}
    </div>
  );
};

/* ─── Segment Journey Mini-Card ─── */
const SegmentJourneyCard: React.FC<{ stage: CJMStage; segmentId: string }> = ({ stage, segmentId }) => {
  const seg = segments.find(s => s.id === segmentId)!;
  const journey = stage.segments.find(s => s.segmentId === segmentId);
  if (!journey) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl border-2"
      style={{ borderColor: seg.colorLight, background: `linear-gradient(135deg, ${seg.colorLight}66, white)` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{seg.icon}</span>
        <span className="font-bold text-sm" style={{ color: seg.colorDark }}>{seg.name}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-lg">{emotionEmoji(journey.emotionValue)}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: seg.colorLight, color: seg.colorDark }}>
            {journey.emotionValue}/10
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <MessageCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: seg.color }} />
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase">Ключевая мысль</span>
            <p className="text-sm text-gray-800 italic">{journey.keyThought}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" style={{ color: seg.color }} />
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase">Главная боль</span>
            <p className="text-sm text-gray-800">{journey.keyPain}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Zap size={14} className="mt-0.5 flex-shrink-0" style={{ color: seg.color }} />
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase">Триггер</span>
            <p className="text-sm text-gray-800">{journey.keyTrigger}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Detail Panel ─── */
const DetailPanel: React.FC<{
  stage: CJMStage;
  activeSegment: string | null;
  onClose: () => void;
}> = ({ stage, activeSegment, onClose }) => {
  const getContent = (key: string): string | string[] | { channels: string[]; people: string[]; product: string[] } => {
    switch (key) {
      case 'actions': return stage.actions;
      case 'touchpoints': return stage.touchpoints;
      case 'goals': return stage.goals;
      case 'thoughts': return stage.thoughts;
      case 'emotions': return stage.emotions;
      case 'pains': return stage.pains;
      case 'barriers': return stage.barriers;
      case 'triggers': return stage.triggers;
      case 'expectations': return stage.expectations;
      case 'possibleProblems': return stage.possibleProblems;
      case 'momentOfTruth': return stage.momentOfTruth;
      case 'metrics': return stage.metrics;
      case 'opportunities': return stage.opportunities;
      default: return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full md:w-[520px] lg:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-gray-100">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{stage.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{stage.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg">{emotionEmoji(stage.emotionValue)}</span>
                <span className="text-sm font-medium text-gray-500">
                  Эмоциональный уровень: {emotionLabel(stage.emotionValue)} ({stage.emotionValue}/10)
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Segment-specific section */}
        {activeSegment ? (
          <div className="mb-4">
            <SegmentJourneyCard stage={stage} segmentId={activeSegment} />
          </div>
        ) : (
          <div className="mb-4 space-y-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Users size={14} />
              Путь по сегментам
            </h3>
            {segments.map(seg => (
              <SegmentJourneyCard key={seg.id} stage={stage} segmentId={seg.id} />
            ))}
          </div>
        )}

        {/* All sections */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 size={14} />
            Детальный разбор этапа
          </h3>
          {sectionConfigs.map(cfg => (
            <SectionBlock key={cfg.key} config={cfg} content={getContent(cfg.key)} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Stage Timeline Node ─── */
const StageNode: React.FC<{
  stage: CJMStage;
  index: number;
  total: number;
  isActive: boolean;
  activeSegment: string | null;
  onClick: () => void;
}> = ({ stage, index, isActive, activeSegment, onClick }) => {
  const getEmotion = (): number => {
    if (activeSegment) {
      const s = stage.segments.find(sg => sg.segmentId === activeSegment);
      return s ? s.emotionValue : stage.emotionValue;
    }
    return stage.emotionValue;
  };
  const ev = getEmotion();
  const clr = activeSegment
    ? segments.find(s => s.id === activeSegment)?.color || '#6366f1'
    : '#6366f1';

  return (
    <motion.div
      className="flex flex-col items-center cursor-pointer group relative"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      {/* Circle */}
      <div
        className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-300"
        style={{
          backgroundColor: isActive ? clr : '#f8fafc',
          border: `2.5px solid ${isActive ? clr : '#e2e8f0'}`,
          boxShadow: isActive ? `0 8px 25px ${clr}44` : 'none',
        }}
      >
        <span className="text-xl md:text-2xl">{stage.icon}</span>
        {/* Emotion badge */}
        <div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          style={{ backgroundColor: emotionColor(ev) }}
        >
          {ev}
        </div>
      </div>
      {/* Title */}
      <span className={`mt-2 text-xs md:text-[11px] font-semibold text-center leading-tight max-w-[80px] md:max-w-[90px] ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
        {stage.title}
      </span>
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute -bottom-2 w-8 h-1 rounded-full"
          style={{ backgroundColor: clr }}
        />
      )}
    </motion.div>
  );
};

/* ─── Stage Quick Preview Card ─── */
const StagePreview: React.FC<{
  stage: CJMStage;
  activeSegment: string | null;
  onOpenDetails: () => void;
}> = ({ stage, activeSegment, onOpenDetails }) => {
  const getEmotion = (): number => {
    if (activeSegment) {
      const s = stage.segments.find(sg => sg.segmentId === activeSegment);
      return s ? s.emotionValue : stage.emotionValue;
    }
    return stage.emotionValue;
  };
  const ev = getEmotion();
  const clr = activeSegment
    ? segments.find(s => s.id === activeSegment)?.color || '#6366f1'
    : '#6366f1';

  return (
    <motion.div
      key={stage.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', damping: 20, stiffness: 180 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/50 overflow-hidden"
    >
      {/* Top bar */}
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${clr}15` }}
            >
              {stage.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{stage.title}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                {emotionEmoji(ev)} {stage.emotions}
              </p>
            </div>
          </div>
          {/* Emotion gauge */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center" style={{ backgroundColor: emotionColor(ev) + '15', border: `2px solid ${emotionColor(ev)}33` }}>
              <span className="text-lg font-black" style={{ color: emotionColor(ev) }}>{ev}</span>
              <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: emotionColor(ev) }}>/10</span>
            </div>
          </div>
        </div>

        {/* Quick insights grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {/* Pains */}
          <div className="p-3 rounded-xl bg-red-50 border border-red-100">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle size={13} className="text-red-600" />
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Боли</span>
            </div>
            <ul className="space-y-1">
              {stage.pains.slice(0, 2).map((p, i) => (
                <li key={i} className="text-xs text-red-800 flex items-start gap-1.5">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-red-400 flex-shrink-0"></span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          {/* Goals */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Target size={13} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Цели</span>
            </div>
            <ul className="space-y-1">
              {stage.goals.slice(0, 2).map((g, i) => (
                <li key={i} className="text-xs text-emerald-800 flex items-start gap-1.5">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0"></span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
          {/* Barriers */}
          <div className="p-3 rounded-xl bg-orange-50 border border-orange-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Shield size={13} className="text-orange-600" />
              <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Барьеры</span>
            </div>
            <ul className="space-y-1">
              {stage.barriers.slice(0, 2).map((b, i) => (
                <li key={i} className="text-xs text-orange-800 flex items-start gap-1.5">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-orange-400 flex-shrink-0"></span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Moment of truth */}
        <div className="p-3 rounded-xl border-2 border-amber-200 bg-amber-50/60 mb-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Star size={13} className="text-amber-600" />
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Момент истины</span>
          </div>
          <p className="text-sm text-amber-900 leading-relaxed">{stage.momentOfTruth}</p>
        </div>

        {/* Segment journeys preview */}
        {activeSegment ? (
          <SegmentJourneyCard stage={stage} segmentId={activeSegment} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {segments.map(seg => {
              const journey = stage.segments.find(s => s.segmentId === seg.id);
              if (!journey) return null;
              return (
                <div
                  key={seg.id}
                  className="p-3 rounded-xl border"
                  style={{ borderColor: seg.colorLight, background: `${seg.colorLight}44` }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-sm">{seg.icon}</span>
                    <span className="text-xs font-bold" style={{ color: seg.colorDark }}>{seg.shortName}</span>
                    <span className="ml-auto text-xs">{emotionEmoji(journey.emotionValue)}</span>
                  </div>
                  <p className="text-[11px] text-gray-700 italic leading-snug">{journey.keyThought}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onOpenDetails}
          className="mt-4 w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-lg flex items-center justify-center gap-2"
          style={{ backgroundColor: clr, boxShadow: `0 4px 14px ${clr}33` }}
        >
          Подробнее об этапе <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

/* ─── Main App ─── */
export default function App() {
  const [activeStage, setActiveStage] = useState(0);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const currentStage = cjmData[activeStage];

  const goNext = useCallback(() => {
    setActiveStage(i => Math.min(i + 1, cjmData.length - 1));
  }, []);
  const goPrev = useCallback(() => {
    setActiveStage(i => Math.max(i - 1, 0));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Backdrop for detail panel */}
      <AnimatePresence>
        {detailOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setDetailOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Detail Panel */}
      <AnimatePresence>
        {detailOpen && (
          <DetailPanel
            stage={currentStage}
            activeSegment={activeSegment}
            onClose={() => setDetailOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-gray-100 bg-white/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-lg">
              UP
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Карта пути клиента</h1>
              <p className="text-xs text-gray-500">Платформа развития метанавыков · Дети 8–14 лет</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
            <span className="px-2 py-1 rounded-lg bg-gray-50 font-medium">9 этапов</span>
            <span className="px-2 py-1 rounded-lg bg-gray-50 font-medium">3 сегмента</span>
            <span className="px-2 py-1 rounded-lg bg-gray-50 font-medium">13 блоков данных</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Segment Selector + Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Users size={14} /> Сегменты аудитории
            </h2>
          </div>
          <SegmentSelector segments={segments} active={activeSegment} onSelect={setActiveSegment} />
          
          {/* Show segment cards when no specific segment selected */}
          {activeSegment === null && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {segments.map(seg => (
                <SegmentCard key={seg.id} segment={seg} />
              ))}
            </div>
          )}
          {/* Show single expanded segment card when selected */}
          {activeSegment !== null && (
            <div className="max-w-2xl">
              <SegmentCard segment={segments.find(s => s.id === activeSegment)!} />
            </div>
          )}
        </section>

        {/* Emotion Curve */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={14} /> Кривая эмоций
              {activeSegment && (
                <span className="text-xs font-normal normal-case text-gray-400 ml-1">
                  · {segments.find(s => s.id === activeSegment)?.name}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> Низкий</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Средний</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Высокий</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Отличный</span>
            </div>
          </div>
          <EmotionCurve
            stages={cjmData}
            activeIndex={activeStage}
            activeSegment={activeSegment}
            onStageClick={setActiveStage}
          />
          {/* Stage labels below curve */}
          <div className="flex justify-between mt-1 px-4">
            {cjmData.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveStage(i)}
                className={`text-[9px] md:text-[10px] font-medium text-center max-w-[80px] leading-tight transition-colors ${
                  activeStage === i ? 'text-gray-900 font-bold' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </section>

        {/* Stage Timeline */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Этапы пути клиента
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                disabled={activeStage === 0}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-gray-500">
                {activeStage + 1} / {cjmData.length}
              </span>
              <button
                onClick={goNext}
                disabled={activeStage === cjmData.length - 1}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Horizontal timeline */}
          <div className="flex items-center justify-between gap-1 md:gap-2 overflow-x-auto pb-4">
            {cjmData.map((stage, i) => (
              <React.Fragment key={stage.id}>
                <StageNode
                  stage={stage}
                  index={i}
                  total={cjmData.length}
                  isActive={activeStage === i}
                  activeSegment={activeSegment}
                  onClick={() => setActiveStage(i)}
                />
                {i < cjmData.length - 1 && (
                  <div className="hidden md:block flex-1 h-0.5 bg-gray-200 min-w-[16px] rounded-full relative">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        backgroundColor: activeSegment ? segments.find(s => s.id === activeSegment)?.color || '#6366f1' : '#6366f1',
                        width: i < activeStage ? '100%' : '0%',
                      }}
                      animate={{ width: i < activeStage ? '100%' : '0%' }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* Active Stage Preview */}
        <AnimatePresence mode="wait">
          <StagePreview
            key={currentStage.id}
            stage={currentStage}
            activeSegment={activeSegment}
            onOpenDetails={() => setDetailOpen(true)}
          />
        </AnimatePresence>

        {/* All stages comparison grid */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 md:p-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 size={14} /> Сравнение этапов
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-3 text-left text-gray-500 font-bold uppercase tracking-wider">Этап</th>
                  <th className="py-3 px-3 text-center text-gray-500 font-bold uppercase tracking-wider">Эмоции</th>
                  <th className="py-3 px-3 text-left text-gray-500 font-bold uppercase tracking-wider">Главная боль</th>
                  <th className="py-3 px-3 text-left text-gray-500 font-bold uppercase tracking-wider">Ключевой барьер</th>
                  <th className="py-3 px-3 text-left text-gray-500 font-bold uppercase tracking-wider">Триггер</th>
                </tr>
              </thead>
              <tbody>
                {cjmData.map((stage, i) => {
                  const ev = activeSegment
                    ? (stage.segments.find(s => s.segmentId === activeSegment)?.emotionValue || stage.emotionValue)
                    : stage.emotionValue;
                  const pain = activeSegment
                    ? (stage.segments.find(s => s.segmentId === activeSegment)?.keyPain || stage.pains[0])
                    : stage.pains[0];
                  const trigger = activeSegment
                    ? (stage.segments.find(s => s.segmentId === activeSegment)?.keyTrigger || stage.triggers[0])
                    : stage.triggers[0];
                  return (
                    <tr
                      key={stage.id}
                      className={`border-b border-gray-50 cursor-pointer transition-colors ${
                        activeStage === i ? 'bg-indigo-50/50' : 'hover:bg-gray-50/50'
                      }`}
                      onClick={() => setActiveStage(i)}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span>{stage.icon}</span>
                          <span className="font-semibold text-gray-900">{stage.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1">
                          {emotionEmoji(ev)}
                          <span className="font-bold" style={{ color: emotionColor(ev) }}>{ev}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-700 max-w-[200px]">{pain}</td>
                      <td className="py-3 px-3 text-gray-700 max-w-[200px]">{stage.barriers[0]}</td>
                      <td className="py-3 px-3 text-gray-700 max-w-[200px]">{trigger}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-8 py-6 text-center text-xs text-gray-400">
        <p>UP — Платформа развития метанавыков у детей 8–14 лет</p>
        <p className="mt-1">Карта пути клиента · Визуализация CJM · {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
