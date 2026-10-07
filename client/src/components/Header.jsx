import { PRIORITIES } from '../constants.js';
import { useTheme } from '../hooks/useTheme.js';
import { LogoIcon, MoonIcon, PlusIcon, SearchIcon, SunIcon } from './icons.jsx';

export default function Header({ filter, onFilterChange, total, done, onAdd }) {
  const [theme, toggleTheme] = useTheme();
  const percent = total ? Math.round((done / total) * 100) : 0;
  const updateFilter = (changes) => onFilterChange((f) => ({ ...f, ...changes }));

  return (
    <header className="topbar">
      <div className="brand">
        <LogoIcon />
        <span>TaskBoard</span>
      </div>

      <div className="toolbar">
        <label className="search">
          <SearchIcon />
          <input
            type="search"
            placeholder="Tìm công việc…"
            aria-label="Tìm công việc"
            value={filter.query}
            onChange={(e) => updateFilter({ query: e.target.value })}
          />
        </label>
        <select
          aria-label="Lọc theo độ ưu tiên"
          value={filter.priority}
          onChange={(e) => updateFilter({ priority: e.target.value })}
        >
          <option value="all">Mọi độ ưu tiên</option>
          {PRIORITIES.map((p) => (
            <option key={p.id} value={p.id}>
              Ưu tiên {p.label.toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="progress" title={`${done}/${total} công việc đã hoàn thành`}>
        <div
          className="progress-bar"
          role="progressbar"
          aria-label="Tiến độ"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
        <span className="progress-text">
          {done}/{total} xong
        </span>
      </div>

      <div className="topbar-actions">
        <button
          type="button"
          className="icon-btn icon-btn-lg"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          title={theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <button type="button" className="btn btn-primary" onClick={onAdd}>
          <PlusIcon />
          <span>
            Thêm<span className="hide-sm"> công việc</span>
          </span>
        </button>
      </div>
    </header>
  );
}
