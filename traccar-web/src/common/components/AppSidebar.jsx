import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import {
  Tooltip, Typography, Badge, Menu, MenuItem as MuiMenuItem,
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StarIcon from '@mui/icons-material/Star';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimelineIcon from '@mui/icons-material/Timeline';
import RouteIcon from '@mui/icons-material/Route';
import BarChartIcon from '@mui/icons-material/BarChart';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import NotesIcon from '@mui/icons-material/Notes';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import TuneIcon from '@mui/icons-material/Tune';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DnsIcon from '@mui/icons-material/Dns';
import DrawIcon from '@mui/icons-material/Draw';
import FolderIcon from '@mui/icons-material/Folder';
import BuildIcon from '@mui/icons-material/Build';
import PeopleIcon from '@mui/icons-material/People';
import TodayIcon from '@mui/icons-material/Today';
import CalculateIcon from '@mui/icons-material/Calculate';
import SendIcon from '@mui/icons-material/Send';
import CampaignIcon from '@mui/icons-material/Campaign';
import ShieldIcon from '../../resources/images/icon/shield.svg?react';

import { sessionActions } from '../../store';
import { useTranslation } from './LocalizationProvider';
import { useAdministrator, useManager, useRestriction } from '../util/permissions';
import { nativePostMessage } from './NativeInterface';
import usePersistedState from '../util/usePersistedState';
import useFeatures from '../util/useFeatures';

const COLLAPSED_WIDTH = 56;
const EXPANDED_WIDTH = 240;
const SECONDARY_WIDTH = 200;
const BG_COLOR = '#0F7EA3';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    height: '100%',
    flexShrink: 0,
    zIndex: 6,
    '@media print': { display: 'none' },
  },
  rail: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: BG_COLOR,
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  header: {
    height: 56,
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    flexShrink: 0,
  },
  headerExpanded: {
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1.5),
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    padding: 0,
    '&:hover': { opacity: 0.8 },
  },
  logoText: {
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.9375rem',
    whiteSpace: 'nowrap',
    letterSpacing: '-0.01em',
  },
  nav: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: theme.spacing(1),
    '&::-webkit-scrollbar': { width: 4 },
    '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    border: 'none',
    borderRadius: theme.shape.borderRadius * 2,
    marginBottom: 2,
    color: 'rgba(255,255,255,0.85)',
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
    backgroundColor: 'transparent',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
  },
  navItemCollapsed: { justifyContent: 'center', padding: theme.spacing(1.25) },
  navItemExpanded: { justifyContent: 'flex-start', padding: theme.spacing(1.25, 1.5), gap: theme.spacing(1.5) },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.95) !important',
    color: `${BG_COLOR} !important`,
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  navItemSelected: { backgroundColor: 'rgba(255,255,255,0.15) !important' },
  navIcon: { width: 20, height: 20, flexShrink: 0 },
  navLabel: { fontSize: '0.875rem', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' },
  navChevron: { width: 16, height: 16, opacity: 0.5 },
  secondary: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: SECONDARY_WIDTH,
    backgroundColor: BG_COLOR,
    borderLeft: '1px solid rgba(255,255,255,0.12)',
    flexShrink: 0,
    overflow: 'hidden',
  },
  secondaryHeader: {
    height: 56,
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 2),
    gap: theme.spacing(1),
    flexShrink: 0,
  },
  secondaryTitle: { color: '#fff', fontWeight: 500, fontSize: '0.875rem', whiteSpace: 'nowrap' },
  secondaryIcon: { width: 18, height: 18, color: 'rgba(255,255,255,0.7)', flexShrink: 0 },
  secondaryNav: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: theme.spacing(0.5, 1),
    '&::-webkit-scrollbar': { width: 4 },
    '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
  },
  subItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    border: 'none',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1, 1.5),
    gap: theme.spacing(1.25),
    marginBottom: 2,
    color: 'rgba(255,255,255,0.75)',
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
    backgroundColor: 'transparent',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' },
  },
  subItemActive: {
    backgroundColor: 'rgba(255,255,255,0.9) !important',
    color: `${BG_COLOR} !important`,
    fontWeight: 500,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  subIcon: { width: 16, height: 16, flexShrink: 0 },
  subLabel: { fontSize: '0.8125rem', whiteSpace: 'nowrap', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' },
  userSection: { padding: theme.spacing(1), flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.1)' },
  userButton: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    border: 'none',
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(1),
    gap: theme.spacing(1.5),
    color: 'rgba(255,255,255,0.85)',
    cursor: 'pointer',
    transition: 'background 0.15s',
    backgroundColor: 'transparent',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
  },
  userButtonCollapsed: { justifyContent: 'center', padding: theme.spacing(1) },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 600,
    flexShrink: 0,
  },
  userName: { fontSize: '0.875rem', fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { fontSize: '0.6875rem', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' },
  toggleBtn: {
    color: 'rgba(255,255,255,0.8)',
    border: 'none',
    background: 'none',
    borderRadius: '50%',
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
  },
}));

const AppSidebar = () => {
  const { classes, cx } = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const t = useTranslation();

  const user = useSelector((state) => state.session.user);
  const socket = useSelector((state) => state.session.socket);
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const readonly = useRestriction('readonly');
  const admin = useAdministrator();
  const manager = useManager();
  const features = useFeatures();
  const userId = user?.id;

  const [isCollapsed, setIsCollapsed] = usePersistedState('sidebarCollapsed', true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const reportItems = [
    { title: t('reportCombined'), icon: StarIcon, url: '/reports/combined' },
    { title: t('reportEvents'), icon: NotificationsActiveIcon, url: '/reports/events' },
    { title: t('reportTrips'), icon: PlayCircleFilledIcon, url: '/reports/trips' },
    { title: t('reportStops'), icon: PauseCircleFilledIcon, url: '/reports/stops' },
    { title: t('reportSummary'), icon: FormatListBulletedIcon, url: '/reports/summary' },
    { title: t('reportChart'), icon: TrendingUpIcon, url: '/reports/chart' },
    { title: t('reportReplay'), icon: RouteIcon, url: '/replay' },
    { title: t('reportPositions'), icon: TimelineIcon, url: '/reports/route' },
    { title: t('sharedLogs'), icon: NotesIcon, url: '/reports/logs' },
    ...(!readonly ? [{ title: t('reportScheduled'), icon: EventRepeatIcon, url: '/reports/scheduled' }] : []),
    ...(admin ? [
      { title: t('statisticsTitle'), icon: BarChartIcon, url: '/reports/statistics' },
      { title: t('reportAudit'), icon: VerifiedUserIcon, url: '/reports/audit' },
    ] : []),
  ];

  const settingsItems = [
    { title: t('sharedPreferences'), icon: TuneIcon, url: '/settings/preferences' },
    ...(!readonly ? [
      { title: t('sharedNotifications'), icon: NotificationsIcon, url: '/settings/notifications' },
      { title: t('settingsUser'), icon: PersonIcon, url: `/settings/user/${userId}` },
      { title: t('deviceTitle'), icon: DnsIcon, url: '/settings/devices' },
      { title: t('sharedGeofences'), icon: DrawIcon, url: '/geofences' },
      ...(!features.disableGroups ? [{ title: t('settingsGroups'), icon: FolderIcon, url: '/settings/groups' }] : []),
      ...(!features.disableDrivers ? [{ title: t('sharedDrivers'), icon: PersonIcon, url: '/settings/drivers' }] : []),
      ...(!features.disableCalendars ? [{ title: t('sharedCalendars'), icon: TodayIcon, url: '/settings/calendars' }] : []),
      ...(!features.disableComputedAttributes ? [{ title: t('sharedComputedAttributes'), icon: CalculateIcon, url: '/settings/attributes' }] : []),
      ...(!features.disableMaintenance ? [{ title: t('sharedMaintenance'), icon: BuildIcon, url: '/settings/maintenances' }] : []),
      ...(!features.disableSavedCommands ? [{ title: t('sharedSavedCommands'), icon: SendIcon, url: '/settings/commands' }] : []),
    ] : []),
    ...(manager ? [
      { title: t('serverAnnouncement'), icon: CampaignIcon, url: '/settings/announcement' },
      ...(admin ? [{ title: t('settingsServer'), icon: SettingsIcon, url: '/settings/server' }] : []),
      { title: t('settingsUsers'), icon: PeopleIcon, url: '/settings/users' },
    ] : []),
  ];

  const menuItems = [
    { key: 'map', title: t('mapTitle'), icon: MapIcon, url: '/', badge: socket === false },
    { key: 'gate', title: 'Gate', icon: MeetingRoomIcon, url: '/gate' },
    { key: 'reports', title: t('reportTitle'), icon: DescriptionIcon, items: reportItems },
    { key: 'settings', title: t('settingsTitle'), icon: SettingsIcon, items: settingsItems },
  ];

  const isPathActive = (url) => {
    if (url === '/') return location.pathname === '/';
    return location.pathname.startsWith(url);
  };

  const isModuleActive = (item) => {
    if (item.url) return isPathActive(item.url);
    if (item.items) return item.items.some((sub) => isPathActive(sub.url));
    return false;
  };

  useEffect(() => {
    const activeModule = menuItems.find((item) => item.items && isModuleActive(item));
    if (activeModule && (!selectedModule || selectedModule.key !== activeModule.key)) {
      setSelectedModule(activeModule);
    }
  }, [location.pathname]);

  const handleModuleClick = (item) => {
    if (item.items) {
      setSelectedModule(selectedModule?.key === item.key ? null : item);
    } else if (item.url) {
      navigate(item.url);
      setSelectedModule(null);
    }
  };

  const handleSubItemClick = (url) => {
    if (url === '/reports/combined' && selectedDeviceId) {
      navigate(`/reports/combined?deviceId=${selectedDeviceId}`);
    } else {
      navigate(url);
    }
  };

  const handleLogout = async () => {
    setUserMenuAnchor(null);
    const notificationToken = window.localStorage.getItem('notificationToken');
    if (notificationToken && !user.readonly) {
      window.localStorage.removeItem('notificationToken');
      const tokens = user.attributes.notificationTokens?.split(',') || [];
      if (tokens.includes(notificationToken)) {
        await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...user,
            attributes: {
              ...user.attributes,
              notificationTokens: tokens.length > 1 ? tokens.filter((it) => it !== notificationToken).join(',') : undefined,
            },
          }),
        });
      }
    }
    await fetch('/api/session', { method: 'DELETE' });
    nativePostMessage('logout');
    navigate('/login');
    dispatch(sessionActions.updateUser(null));
  };

  const hasSecondary = selectedModule && selectedModule.items;
  const showFullRail = !isCollapsed && !hasSecondary;
  const railWidth = showFullRail ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
  const userInitial = (user.name || user.email || '?').charAt(0).toUpperCase();

  return (
    <div className={classes.root}>
      <div className={classes.rail} style={{ width: railWidth }}>
        <div className={cx(classes.header, showFullRail && classes.headerExpanded)}>
          {showFullRail ? (
            <>
              <button type="button" className={classes.logo} onClick={() => navigate('/')}>
                <ShieldIcon style={{ width: 24, height: 24, color: '#fff' }} />
                <span className={classes.logoText}>Raqeeb</span>
              </button>
              <button type="button" className={classes.toggleBtn} onClick={() => setIsCollapsed(true)}>
                <ChevronLeftIcon fontSize="small" />
              </button>
            </>
          ) : (
            <button
              type="button"
              className={classes.toggleBtn}
              onClick={() => (hasSecondary ? setSelectedModule(null) : setIsCollapsed(false))}
            >
              {hasSecondary ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </button>
          )}
        </div>
        <nav className={classes.nav}>
          {menuItems.map((item) => {
            const active = isModuleActive(item);
            const isCurrent = selectedModule?.key === item.key;
            const Icon = item.icon;
            const btn = (
              <button
                key={item.key}
                type="button"
                className={cx(classes.navItem, showFullRail ? classes.navItemExpanded : classes.navItemCollapsed, active && classes.navItemActive, isCurrent && !active && classes.navItemSelected)}
                onClick={() => handleModuleClick(item)}
              >
                {item.badge ? (
                  <Badge color="error" variant="dot" overlap="circular" invisible={!item.badge}><Icon className={classes.navIcon} /></Badge>
                ) : (
                  <Icon className={classes.navIcon} />
                )}
                {showFullRail && (
                  <>
                    <span className={classes.navLabel}>{item.title}</span>
                    {item.items && <ChevronRightIcon className={classes.navChevron} />}
                  </>
                )}
              </button>
            );
            return showFullRail ? btn : <Tooltip key={item.key} title={item.title} placement="right" arrow>{btn}</Tooltip>;
          })}
        </nav>
        <div className={classes.userSection}>
          {showFullRail ? (
            <button type="button" className={classes.userButton} onClick={(e) => setUserMenuAnchor(e.currentTarget)}>
              <div className={classes.avatar}>{userInitial}</div>
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div className={classes.userName}>{user.name || user.email}</div>
                <div className={classes.userRole}>{admin ? 'Admin' : (manager ? 'Manager' : t('settingsUser'))}</div>
              </div>
            </button>
          ) : (
            <Tooltip title={user.name || user.email} placement="right" arrow>
              <button type="button" className={cx(classes.userButton, classes.userButtonCollapsed)} onClick={(e) => setUserMenuAnchor(e.currentTarget)}>
                <div className={classes.avatar}>{userInitial}</div>
              </button>
            </Tooltip>
          )}
          <Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={() => setUserMenuAnchor(null)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
            {!readonly && (
              <MuiMenuItem onClick={() => { setUserMenuAnchor(null); navigate(`/settings/user/${userId}`); }}>
                <PersonIcon fontSize="small" sx={{ mr: 1 }} />{t('settingsUser')}
              </MuiMenuItem>
            )}
            <MuiMenuItem onClick={handleLogout}>
              <ExitToAppIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} /><Typography color="error">{t('loginLogout')}</Typography>
            </MuiMenuItem>
          </Menu>
        </div>
      </div>
      {hasSecondary && (
        <div className={classes.secondary}>
          <div className={classes.secondaryHeader}>
            <selectedModule.icon className={classes.secondaryIcon} />
            <Typography className={classes.secondaryTitle}>{selectedModule.title}</Typography>
          </div>
          <nav className={classes.secondaryNav}>
            {selectedModule.items.map((item) => {
              const SubIcon = item.icon;
              return (
                <button key={item.url} type="button" className={cx(classes.subItem, isPathActive(item.url) && classes.subItemActive)} onClick={() => handleSubItemClick(item.url)}>
                  <SubIcon className={classes.subIcon} />
                  <span className={classes.subLabel}>{item.title}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
};

export default AppSidebar;
