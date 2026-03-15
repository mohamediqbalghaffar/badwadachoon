'use client';

import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUI } from '@/contexts/UIContext';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
    AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogFooter
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup,
    DropdownMenuRadioItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Languages, RotateCcw, Moon, Sun, Monitor, Smartphone, Palette, Database,
    Save, Upload, Trash2, Info, Download, RefreshCw, CheckCircle2, AlertCircle,
    Loader2, Zap, Bell, BellOff, Volume2, VolumeX, Play
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Locale } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { toast } from "@/hooks/use-toast";

/* ─────────────────────── Section Wrapper ─────────────────────── */
function SettingsSection({
    icon: Icon,
    title,
    gradientFrom = 'from-primary/80',
    gradientTo = 'to-primary/40',
    children,
    className,
}: {
    icon: React.ElementType;
    title: string;
    gradientFrom?: string;
    gradientTo?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("space-y-4", className)}>
            <h2 className="text-lg font-semibold flex items-center gap-2.5 text-primary group">
                <span className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                    <Icon className="h-5 w-5" />
                </span>
                {title}
            </h2>
            <Card className="border-none shadow-lg bg-card/60 backdrop-blur-xl overflow-hidden">
                <div className={cn("h-1.5 bg-gradient-to-r", gradientFrom, gradientTo)} />
                <CardContent className="space-y-6 pt-6 pb-6">
                    {children}
                </CardContent>
            </Card>
        </div>
    );
}

/* ─────────────────── Interactive Button Card ─────────────────── */
function ActionButton({
    icon: Icon,
    label,
    onClick,
    variant = 'outline',
    className,
    disabled,
    loading,
}: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    variant?: 'outline' | 'destructive' | 'default';
    className?: string;
    disabled?: boolean;
    loading?: boolean;
}) {
    return (
        <Button
            variant={variant}
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                "h-20 flex flex-col gap-2 transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98]",
                variant === 'outline' && "border-primary/20 hover:border-primary/50 hover:bg-primary/5",
                className
            )}
        >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Icon className="h-6 w-6 text-primary" />}
            <span className="text-sm">{label}</span>
        </Button>
    );
}

/* ─────────────────── Toggle Row Component ─────────────────── */
function ToggleRow({
    id,
    label,
    description,
    checked,
    onCheckedChange,
    icon: Icon,
}: {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
    icon?: React.ElementType;
}) {
    return (
        <div className="flex items-center justify-between rounded-xl border p-4 shadow-sm bg-card/80 hover:bg-card transition-colors duration-200">
            <div className="flex items-start gap-3">
                {Icon && (
                    <span className="p-1.5 rounded-lg bg-primary/10 mt-0.5">
                        <Icon className="h-4 w-4 text-primary" />
                    </span>
                )}
                <div className="space-y-0.5">
                    <Label htmlFor={id} className="text-base font-medium cursor-pointer">{label}</Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
            </div>
            <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} dir='ltr' />
        </div>
    );
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function GeneralSettings(): React.ReactNode {
    const { language, setLanguage, t } = useLanguage();
    const { uiFont, setUiFont, theme, setTheme, viewMode, setViewMode } = useUI();
    const {
        handleSaveData, handleLoadData, handleClearAllData,
        isLocalStorageAllowed, handlePermissionResponse,
        isAutoBackupEnabled, toggleAutoBackup
    } = useTask();
    const { currentUser } = useAuth();

    const loadFileInputRef = React.useRef<HTMLInputElement>(null);

    /* ── Update state ── */
    const [updateStatus, setUpdateStatus] = React.useState<'idle' | 'checking' | 'up-to-date' | 'update-found' | 'error'>('idle');
    const [currentVersionInfo, setCurrentVersionInfo] = React.useState<{ version: string; buildDate: string } | null>(null);
    const [needsReload, setNeedsReload] = React.useState(false);

    /* ── Bubble state ── */
    const [bubbleActive, setBubbleActive] = React.useState(false);
    const [bubbleLoading, setBubbleLoading] = React.useState(false);

    /* ── Notification state ── */
    const [remindersEnabled, setRemindersEnabled] = React.useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('taskmaster_reminders_v1') !== 'false';
        }
        return true;
    });
    const [soundEnabled, setSoundEnabled] = React.useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('taskmaster_sound_v1') !== 'false';
        }
        return true;
    });

    /* ── Android detection ── */
    const isAndroid = typeof window !== 'undefined' &&
        !!(window as any).Capacitor &&
        (window as any).Capacitor.getPlatform?.() === 'android';

    const getBubblePlugin = () =>
        (window as any)?.Capacitor?.Plugins?.Bubble ?? null;

    /* ── Bubble handlers ── */
    const handleStartBubble = async () => {
        const Bubble = getBubblePlugin();
        if (!Bubble) return;
        setBubbleLoading(true);
        try {
            await Bubble.startBubble();
            setBubbleActive(true);
            toast({ title: 'Bubble started', description: 'Floating bubble is now active.' });
        } catch {
            toast({ title: 'Error', description: 'Could not start the bubble.', variant: 'destructive' });
        } finally {
            setBubbleLoading(false);
        }
    };

    const handleStopBubble = async () => {
        const Bubble = getBubblePlugin();
        if (!Bubble) return;
        setBubbleLoading(true);
        try {
            await Bubble.stopBubble();
            setBubbleActive(false);
            toast({ title: 'Bubble stopped', description: 'Floating bubble has been removed.' });
        } catch {
            toast({ title: 'Error', description: 'Could not stop the bubble.', variant: 'destructive' });
        } finally {
            setBubbleLoading(false);
        }
    };

    /* ── Notification handlers ── */
    const handleToggleReminders = (val: boolean) => {
        setRemindersEnabled(val);
        localStorage.setItem('taskmaster_reminders_v1', String(val));
        if (val && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        toast({
            title: val ? t('enableReminders') : t('enableReminders'),
            description: val ? t('enableRemindersDesc') : t('enableRemindersDesc'),
        });
    };

    const handleToggleSound = (val: boolean) => {
        setSoundEnabled(val);
        localStorage.setItem('taskmaster_sound_v1', String(val));
    };

    const handleTestNotification = () => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Tasks (by HTS)', {
                body: t('testNotificationSent'),
                icon: '/favicon.ico',
            });
        } else if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(perm => {
                if (perm === 'granted') {
                    new Notification('Tasks (by HTS)', {
                        body: t('testNotificationSent'),
                        icon: '/favicon.ico',
                    });
                }
            });
        }
        toast({ title: t('testNotification'), description: t('testNotificationSent') });
    };

    /* ── Version loading ── */
    React.useEffect(() => {
        fetch('/version.json?nocache=' + Date.now())
            .then(r => r.json())
            .then(data => setCurrentVersionInfo(data))
            .catch(() => { });
    }, []);

    /* ── Update handler ── */
    const handleCheckForUpdates = async () => {
        setUpdateStatus('checking');
        setNeedsReload(false);
        try {
            let swUpdated = false;
            if ('serviceWorker' in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                for (const reg of regs) {
                    await reg.update();
                    if (reg.waiting) {
                        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                        swUpdated = true;
                    }
                }
            }
            const res = await fetch('/version.json?nocache=' + Date.now(), { cache: 'no-store' });
            const latest = await res.json();

            if (currentVersionInfo && latest.version !== currentVersionInfo.version) {
                setCurrentVersionInfo(latest);
                setUpdateStatus('update-found');
                setNeedsReload(true);
            } else if (swUpdated) {
                setUpdateStatus('update-found');
                setNeedsReload(true);
            } else {
                setUpdateStatus('up-to-date');
            }
        } catch {
            setUpdateStatus('error');
        }
    };

    const handleReloadNow = () => {
        window.location.reload();
    };

    /* ── Font options ── */
    const uiFontOptions = [
        { name: t('fontDefault'), value: 'Speda, sans-serif' },
        { name: 'نۆتۆ سانس (عەرەبی)', value: '"Noto Sans Arabic", sans-serif' },
        { name: 'ڕابەر', value: 'Rabar_021, sans-serif' },
        { name: t('fontSystem'), value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
    ];

    const isRtl = language === 'ku';

    return (
        <div className="space-y-8 max-w-2xl mx-auto pb-10" dir={isRtl ? 'rtl' : 'ltr'}>

            {/* ━━━ Description ━━━ */}
            <p className="text-sm text-muted-foreground leading-relaxed">{t('generalSettingsDesc')}</p>

            {/* ━━━━━━━━━━━━━━ 1. APPEARANCE ━━━━━━━━━━━━━━ */}
            <SettingsSection
                icon={Palette}
                title={t('appearance')}
                gradientFrom="from-violet-500/70"
                gradientTo="to-pink-500/40"
            >
                {/* Theme Selection */}
                <div className="space-y-3">
                    <Label className="text-base font-medium">{t('theme')}</Label>
                    <div className="grid grid-cols-3 gap-4">
                        {([
                            { value: 'light' as const, icon: Sun, label: t('themeLight') },
                            { value: 'dark' as const, icon: Moon, label: t('themeDark') },
                            { value: 'system' as const, icon: Monitor, label: t('themeSystem') },
                        ]).map(opt => (
                            <Button
                                key={opt.value}
                                variant={theme === opt.value ? "default" : "outline"}
                                onClick={() => setTheme(opt.value)}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 h-auto p-4 rounded-xl border-2",
                                    "transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]",
                                    "whitespace-normal text-center",
                                    theme === opt.value
                                        ? "border-primary bg-primary/10 text-primary shadow-md shadow-primary/10"
                                        : "border-border bg-card hover:bg-accent/10"
                                )}
                            >
                                <opt.icon className="h-6 w-6" />
                                <span className="text-sm font-medium">{opt.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                <Separator className="opacity-50" />

                {/* View Mode */}
                <div className="space-y-3">
                    <Label className="text-base font-medium">{t('viewMode')}</Label>
                    <p className="text-sm text-muted-foreground">{t('viewModeDesc')}</p>
                    <div className="grid grid-cols-2 gap-4">
                        {([
                            { value: 'desktop' as const, icon: Monitor, label: t('viewModeDesktop') },
                            { value: 'mobile' as const, icon: Smartphone, label: t('viewModeMobile') },
                        ]).map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setViewMode(opt.value)}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2",
                                    "transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] hover:bg-accent/10",
                                    viewMode === opt.value
                                        ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                                        : "border-border bg-card"
                                )}
                            >
                                <opt.icon className="h-6 w-6" />
                                <span className="text-sm">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <Separator className="opacity-50" />

                {/* Language */}
                <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                        <span className="p-1.5 rounded-lg bg-primary/10 mt-0.5">
                            <Languages className="h-4 w-4 text-primary" />
                        </span>
                        <div className="space-y-0.5">
                            <Label className="text-base font-medium">{t('languageSettings')}</Label>
                            <p className="text-sm text-muted-foreground">{t('languageSettingsDescription')}</p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-[180px] justify-between">
                                {t('kurdish')}
                                <Languages className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[180px]" align={isRtl ? "start" : "end"}>
                            <DropdownMenuRadioGroup value={language} onValueChange={(value: string) => setLanguage(value as Locale)}>
                                <DropdownMenuRadioItem value="ku" className="justify-between">
                                    {t('kurdish')}
                                    {language === 'ku' && <span className="text-primary">✓</span>}
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Separator className="opacity-50" />

                {/* Font */}
                <div className="space-y-3">
                    <Label className="text-base font-medium">{t('uiFont')}</Label>
                    <Select value={uiFont} onValueChange={setUiFont} dir={isRtl ? "rtl" : "ltr"}>
                        <SelectTrigger className={`h-12 w-full bg-card/50 ${isRtl ? 'text-right' : 'text-left'}`}>
                            <SelectValue placeholder={t('fontSelect')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]" align={isRtl ? "end" : "start"}>
                            {uiFontOptions.map(font => (
                                <SelectItem
                                    key={font.value}
                                    value={font.value}
                                    style={{ fontFamily: font.value }}
                                    className={`cursor-pointer ${isRtl ? 'justify-end text-right' : ''}`}
                                >
                                    {font.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </SettingsSection>

            {/* ━━━━━━━━━━━━━━ 2. DATA MANAGEMENT ━━━━━━━━━━━━━━ */}
            <SettingsSection
                icon={Database}
                title={t('dataManagement')}
                gradientFrom="from-emerald-500/70"
                gradientTo="to-teal-500/40"
            >
                <ToggleRow
                    id="local-storage-switch"
                    label={t('autoSaveToLocal')}
                    description={t('autoSaveToLocalDesc')}
                    checked={isLocalStorageAllowed === true}
                    onCheckedChange={handlePermissionResponse}
                    icon={Save}
                />

                <ToggleRow
                    id="auto-backup-switch"
                    label={t('autoBackup')}
                    description={t('autoBackupDesc')}
                    checked={isAutoBackupEnabled}
                    onCheckedChange={toggleAutoBackup}
                    icon={Upload}
                />

                <div className="grid grid-cols-2 gap-4">
                    <ActionButton icon={Save} label={t('saveData')} onClick={handleSaveData} />
                    <ActionButton icon={Upload} label={t('loadData')} onClick={() => loadFileInputRef.current?.click()} />
                </div>
                <input type="file" ref={loadFileInputRef} onChange={handleLoadData} accept=".json" className="hidden" />

                {/* Danger Zone */}
                <div className="rounded-xl border-2 border-destructive/20 bg-destructive/5 p-5 space-y-3">
                    <h3 className="text-destructive font-semibold flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                        </span>
                        {t('dangerZone')}
                    </h3>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform">
                                <Trash2 className="h-4 w-4" />
                                {t('clearAllData')}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir={isRtl ? 'rtl' : 'ltr'}>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-destructive flex items-center gap-2">
                                    <Trash2 className="h-5 w-5" />
                                    {t('confirmClearAllDataTitle')}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {currentUser ? t('confirmClearAllDataDescriptionFirestore') : t('confirmClearAllDataDescription')}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearAllData} className="bg-destructive hover:bg-destructive/90">
                                    {t('confirmDelete')}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </SettingsSection>

            {/* ━━━━━━━━━━━━━━ 3. APP DOWNLOADS ━━━━━━━━━━━━━━ */}
            <SettingsSection
                icon={Download}
                title={t('downloadApp')}
                gradientFrom="from-blue-500/70"
                gradientTo="to-cyan-500/40"
            >
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('downloadAppDescription')}
                </p>

                <div className="grid grid-cols-1 gap-4">
                    {/* Android Download */}
                    <div className="space-y-3 p-5 rounded-xl border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-colors duration-300">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{t('downloadAndroidApk')}</h3>
                                <p className="text-xs text-muted-foreground">.apk • Android 7.0+</p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {t('downloadApkInfoDesc')}
                        </p>
                        <Button
                            className="w-full gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform"
                            variant="outline"
                            onClick={() => {
                                const a = document.createElement('a');
                                a.href = '/Tasks.byHTS.apk';
                                a.download = 'Tasks.byHTS.apk';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                            }}
                        >
                            <Download className="h-4 w-4" />
                            {t('download')}
                        </Button>
                    </div>

                    {/* Windows Download */}
                    <div className="space-y-3 p-5 rounded-xl border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-colors duration-300">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                <Monitor className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{t('downloadWindowsExe')}</h3>
                                <p className="text-xs text-muted-foreground">.exe • Windows 10+</p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {t('downloadWindowsDesc')}
                        </p>
                        <Button
                            className="w-full gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform"
                            variant="outline"
                            onClick={() => {
                                window.open('https://github.com/mohamediqbalghaffar/Tasks-By-HTS/releases', '_blank');
                            }}
                        >
                            <Download className="h-4 w-4" />
                            {t('download')}
                        </Button>
                    </div>
                </div>
            </SettingsSection>

            {/* ━━━━━━━━━━━━━━ 4. FLOATING BUBBLE (Android only) ━━━━━━━━━━━━━━ */}
            {isAndroid && (
                <SettingsSection
                    icon={Zap}
                    title="حەبوبەی شناوەر"
                    gradientFrom="from-amber-500/70"
                    gradientTo="to-orange-500/40"
                >
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        چالاک بکە حەبوبەی شناوەرەکە بۆ دەستگەیشتن خێرا بە بەرنامەکە لە سەرووی هەموو بەرنامەکانی تر.
                    </p>

                    <ToggleRow
                        id="bubble-toggle"
                        label="حەبوبەی شناوەر"
                        description={bubbleActive ? 'چالاکە — لەسەر شاشەکەتە' : 'ناچالاکە'}
                        checked={bubbleActive}
                        onCheckedChange={(checked: boolean) => checked ? handleStartBubble() : handleStopBubble()}
                        icon={Zap}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            className="gap-2 h-14 flex flex-col border-primary/20 hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            disabled={bubbleLoading || bubbleActive}
                            onClick={handleStartBubble}
                        >
                            {bubbleLoading && !bubbleActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 text-primary" />}
                            <span className="text-xs">دەستپێکردن</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2 h-14 flex flex-col border-destructive/20 hover:border-destructive/50 hover:bg-destructive/5 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            disabled={bubbleLoading || !bubbleActive}
                            onClick={handleStopBubble}
                        >
                            {bubbleLoading && bubbleActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 text-destructive" />}
                            <span className="text-xs">ڕاگرتن</span>
                        </Button>
                    </div>
                </SettingsSection>
            )}

            {/* ━━━━━━━━━━━━━━ 5. NOTIFICATIONS ━━━━━━━━━━━━━━ */}
            <SettingsSection
                icon={Bell}
                title={t('notifications')}
                gradientFrom="from-rose-500/70"
                gradientTo="to-pink-500/40"
            >
                <ToggleRow
                    id="reminders-switch"
                    label={t('enableReminders')}
                    description={t('enableRemindersDesc')}
                    checked={remindersEnabled}
                    onCheckedChange={handleToggleReminders}
                    icon={remindersEnabled ? Bell : BellOff}
                />

                <ToggleRow
                    id="sound-switch"
                    label={t('soundEnabled')}
                    description={t('soundEnabledDesc')}
                    checked={soundEnabled}
                    onCheckedChange={handleToggleSound}
                    icon={soundEnabled ? Volume2 : VolumeX}
                />

                <Button
                    variant="outline"
                    onClick={handleTestNotification}
                    className="w-full gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform border-primary/20 hover:border-primary/50"
                >
                    <Play className="h-4 w-4 text-primary" />
                    {t('testNotification')}
                </Button>
            </SettingsSection>

            {/* ━━━━━━━━━━━━━━ 6. APP UPDATES ━━━━━━━━━━━━━━ */}
            <SettingsSection
                icon={RefreshCw}
                title={t('updateApp')}
                gradientFrom="from-sky-500/70"
                gradientTo="to-indigo-500/40"
            >
                {/* Current version info */}
                {currentVersionInfo && (
                    <div className="flex items-center justify-between text-sm rounded-xl bg-muted/40 px-4 py-3.5 border">
                        <div className="space-y-0.5">
                            <p className="font-medium">{t('currentVersion')}</p>
                            <p className="text-xs text-muted-foreground">{t('buildDate')}: {currentVersionInfo.buildDate}</p>
                        </div>
                        <span className="font-mono text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-semibold">
                            {currentVersionInfo.version}
                        </span>
                    </div>
                )}

                {/* Status messages */}
                {updateStatus === 'up-to-date' && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-500/10 rounded-xl px-4 py-3.5 border border-green-500/20">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{t('upToDate')}</span>
                    </div>
                )}
                {updateStatus === 'update-found' && (
                    <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-xl px-4 py-3.5 border border-primary/20">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{t('updateAvailable')}</span>
                    </div>
                )}
                {updateStatus === 'error' && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3.5 border border-destructive/20">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{t('updateErrorDesc')}</span>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                    <Button
                        className="flex-1 gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform"
                        variant="outline"
                        disabled={updateStatus === 'checking'}
                        onClick={handleCheckForUpdates}
                    >
                        {updateStatus === 'checking' ? (
                            <><Loader2 className="h-4 w-4 animate-spin" />{t('checkingForUpdates')}</>
                        ) : (
                            <><RefreshCw className="h-4 w-4" />{t('checkForUpdates')}</>
                        )}
                    </Button>

                    {needsReload && (
                        <Button
                            className="flex-1 gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform"
                            onClick={handleReloadNow}
                        >
                            <RotateCcw className="h-4 w-4" />
                            {t('reloadNow')}
                        </Button>
                    )}
                </div>
            </SettingsSection>

            {/* ━━━━━━━━━━━━━━ 7. ABOUT ━━━━━━━━━━━━━━ */}
            <SettingsSection
                icon={Info}
                title={t('about')}
                gradientFrom="from-primary/70"
                gradientTo="to-primary/30"
            >
                <div className="text-center space-y-4">
                    <div className="bg-gradient-to-br from-primary/20 to-primary/5 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/10">
                        <span className="text-3xl font-bold text-primary">HTS</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">Tasks (by HTS)</h3>
                        <p className="text-muted-foreground mt-1">Version 1.1.0</p>
                    </div>
                </div>

                <Separator className="opacity-50" />

                <div className="space-y-4 text-right">
                    <div className="bg-muted/50 rounded-xl p-5 space-y-3">
                        <h4 className="font-semibold text-lg text-primary">دروستکراوە لەلایەن:</h4>
                        <div className="space-y-2 text-sm">
                            <p className="font-medium text-base">محمد اقبال غفار</p>
                            <p className="text-muted-foreground">جێگری بەڕێوەبەری کارگێڕی</p>
                            <p className="text-muted-foreground leading-relaxed">
                                ئۆفیسی سەرەکیی کۆمپانیای هەڵەبجە بۆ خزمەتگوزاری تیلیکۆم و وزەی نوێبووەوە HTS (سنووردار)
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-5 space-y-2 text-sm">
                        <p className="font-medium">کۆمپانیای هەڵەبجە بۆ خزمەتگوزاری تیلیکۆم</p>
                        <p className="text-muted-foreground">Halabja Telecom Services (HTS)</p>
                    </div>
                </div>
            </SettingsSection>

            {/* ━━━ Refresh button ━━━ */}
            <Separator className="opacity-30" />
            <Button
                variant="ghost"
                onClick={() => window.location.reload()}
                className="w-full text-muted-foreground hover:text-primary gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
                <RotateCcw className="h-4 w-4" />
                {t('refresh')}
            </Button>
        </div>
    );
};

/* ─── Named export for page.tsx import compatibility ─── */
export { default as GeneralSettings } from './general-settings';
