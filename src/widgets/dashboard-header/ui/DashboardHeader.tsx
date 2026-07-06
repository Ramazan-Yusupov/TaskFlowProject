import { Bell, ChevronDown, CirclePlus, Command, FolderKanban, Menu } from "lucide-react";
import { Button, IconButton } from "@/shared/ui";
import { ThemeToggle, type Theme } from "@/features/toggle-theme";

type DashboardHeaderProps = {
  theme: Theme;
  onToggleTheme: () => void;
  onCreateTicket: () => void;
  onOpenNavigation: () => void;
};

export function DashboardHeader({
  theme,
  onToggleTheme,
  onCreateTicket,
  onOpenNavigation,
}: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header__title">
        <IconButton label="Открыть навигацию" className="mobile-menu" onClick={onOpenNavigation}>
          <Menu size={20} aria-hidden="true" />
        </IconButton>
        <div className="workspace-mark" aria-hidden="true"><FolderKanban size={18} /></div>
        <div>
          <p className="eyebrow">Рабочее пространство</p>
          <button type="button" className="workspace-switcher">Nova team <ChevronDown size={16} aria-hidden="true" /></button>
        </div>
      </div>
      <div className="dashboard-header__actions">
        <div className="command-hint"><Command size={15} aria-hidden="true" /> Быстрый поиск</div>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <IconButton label="Уведомления" className="notification-button"><Bell size={20} aria-hidden="true" /><span /></IconButton>
        <Button onClick={onCreateTicket}><CirclePlus size={18} aria-hidden="true" /> Новая задача</Button>
      </div>
    </header>
  );
}
