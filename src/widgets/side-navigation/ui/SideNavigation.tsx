import { BarChart3, CircleHelp, FolderKanban, LayoutDashboard, Settings, UsersRound, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { IconButton } from "@/shared/ui";

type SideNavigationProps = {
  isOpen: boolean;
  onClose: () => void;
  taskCount: number;
};

const primaryItems = [
  { label: "Обзор", icon: LayoutDashboard, active: true },
  { label: "Мои задачи", icon: FolderKanban, count: "12" },
  { label: "Команда", icon: UsersRound },
  { label: "Аналитика", icon: BarChart3 },
];

export function SideNavigation({ isOpen, onClose, taskCount }: SideNavigationProps) {
  return (
    <>
      {isOpen && <button className="navigation-overlay" aria-label="Закрыть навигацию" onClick={onClose} />}
      <aside className={cn("side-navigation", isOpen && "side-navigation--open")}>
        <div className="brand-row">
          <div className="brand-mark">T</div>
          <div><strong>TaskFlow</strong><span>управление работой</span></div>
          <IconButton label="Закрыть навигацию" className="navigation-close" onClick={onClose}><X size={19} aria-hidden="true" /></IconButton>
        </div>
        <nav aria-label="Основная навигация">
          <p className="navigation-label">Рабочий стол</p>
          <ul className="navigation-list">
            {primaryItems.map(({ label, icon: Icon, active, count }) => (
              <li key={label}>
                <a className={cn("navigation-link", active && "navigation-link--active")} href="#workspace">
                  <Icon size={19} aria-hidden="true" />
                  <span>{label}</span>
                  {count && <em>{label === "Мои задачи" ? taskCount : count}</em>}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="navigation-projects">
          <div className="navigation-label-row"><p className="navigation-label">Проекты</p><button type="button" aria-label="Добавить проект">+</button></div>
          <ul className="project-list">
            <li><a href="#product"><span className="project-dot project-dot--yellow" />Product design</a></li>
            <li><a href="#platform"><span className="project-dot project-dot--blue" />Core platform</a></li>
            <li><a href="#success"><span className="project-dot project-dot--green" />Customer success</a></li>
          </ul>
        </div>

        <div className="navigation-footer">
          <a href="#settings"><Settings size={18} aria-hidden="true" /> Настройки</a>
          <a href="#help"><CircleHelp size={18} aria-hidden="true" /> Центр помощи</a>
          <div className="user-card"><span className="avatar avatar--me">РЮ</span><div><strong>Рамазан Юсупов</strong><small>Администратор</small></div><button type="button" aria-label="Открыть меню профиля">•••</button></div>
        </div>
      </aside>
    </>
  );
}
