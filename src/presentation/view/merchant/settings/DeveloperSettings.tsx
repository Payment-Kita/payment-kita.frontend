'use client';

import React, { useState, useEffect } from "react";
import {
    Copy,
    RefreshCcw,
    Wifi,
    WifiOff,
    Terminal,
    Save,
    CheckCircle,
    ShieldCheck,
    Key,
    ShieldAlert,
    HelpCircle,
    ExternalLink,
    ChevronRight,
    Database,
    Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";
import {
    merchantRepository,
    webhookRepository,
    apiKeyRepository,
    walletRepository,
} from "@/data/repositories/repository_impl";
import { useWebhookSettings } from "@/presentation/hooks/useWebhookSettings";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Button, Input, Switch } from "@/presentation/components/atoms";
import { BaseModal, DataTableCard, SettingsSectionCard } from "@/presentation/components/molecules";
import Link from "next/link";
import { useChainsQuery, useTokensQuery } from "@/data/usecase";
import { ChainSelector } from "@/presentation/components/organisms/ChainSelector";
import { TokenSelector } from "@/presentation/components/organisms/TokenSelector";
import type { ChainItemData } from "@/presentation/components/molecules/ChainListItem";
import type { TokenItemData } from "@/presentation/components/molecules/TokenListItem";
import { useTranslation } from "@/presentation/hooks";

/**
 * DeveloperSettings Component
 * 
 * Implements Phase 6.2: Merchant Self-Service Interface (Frontend Deep Dive).
 * Features a premium, dark-themed UI for managing Webhooks and API Keys.
 */
export const DeveloperSettings = () => {
    const queryClient = useQueryClient();
    const { status: pingStatus, sendTestPing } = useWebhookSettings();
    const { t } = useTranslation();
    const { data: chains } = useChainsQuery();
    const { data: tokens } = useTokensQuery();

    // State
    const [webhookUrl, setWebhookUrl] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [merchant, setMerchant] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [apiKeys, setApiKeys] = useState<any[]>([]);
    const [wallets, setWallets] = useState<any[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSavingSettlement, setIsSavingSettlement] = useState(false);
    const [settlementForm, setSettlementForm] = useState({
        invoice_currency: "IDRX",
        dest_chain: "",
        dest_token: "",
        dest_wallet: "",
        bridge_token_symbol: "USDC",
    });
    const [selectedSettlementChainId, setSelectedSettlementChainId] = useState("");
    const [selectedSettlementTokenId, setSelectedSettlementTokenId] = useState("");

    const syncSettlementProfile = (profile?: any) => {
        if (!profile) return;
        const nextChain = profile.dest_chain || "";
        const nextToken = profile.dest_token || "";
        const nextWallet = profile.dest_wallet || "";
        const nextInvoiceCurrency = profile.invoice_currency || "IDRX";
        const nextBridgeTokenSymbol = profile.bridge_token_symbol || "USDC";

        setSettlementForm({
            invoice_currency: nextInvoiceCurrency,
            dest_chain: nextChain,
            dest_token: nextToken,
            dest_wallet: nextWallet,
            bridge_token_symbol: nextBridgeTokenSymbol,
        });
    };

    // Key Modal State
    const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [createdSecret, setCreatedSecret] = useState<string | null>(null);

    // Fetch Initial Data
    useEffect(() => {
        const load = async () => {
            try {
                const [keyRes, settlementRes, walletRes] = await Promise.all([
                    apiKeyRepository.getApiKeys(),
                    merchantRepository.getSettlementProfile(),
                    walletRepository.listWallets()
                ]);
                if (keyRes.data) setApiKeys(keyRes.data || []);
                if (settlementRes?.data) syncSettlementProfile(settlementRes.data);
                if (walletRes?.data) setWallets(walletRes.data.wallets || []);
            } catch (e) {
                console.error("Failed to load settings data", e);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (!chains?.items || !settlementForm.dest_chain) return;
        const matchedChain = chains.items.find((chain: any) => chain.caip2 === settlementForm.dest_chain);
        if (matchedChain) {
            setSelectedSettlementChainId(String(matchedChain.id));
        }
    }, [chains, settlementForm.dest_chain]);

    useEffect(() => {
        if (!tokens?.items || !settlementForm.dest_token || !selectedSettlementChainId) return;
        const matchedToken = (tokens.items as any[]).find((token: any) => {
            return String(token.chainId) === selectedSettlementChainId &&
                String(token.contractAddress || '').toLowerCase() === settlementForm.dest_token.toLowerCase();
        });
        if (matchedToken) {
            setSelectedSettlementTokenId(String(matchedToken.id));
        }
    }, [tokens, settlementForm.dest_token, selectedSettlementChainId]);

    const setSettlementField = (key: keyof typeof settlementForm, value: string) => {
        setSettlementForm(prev => ({ ...prev, [key]: value }));
    };

    const chainItems: ChainItemData[] = (chains?.items || []).map((chain: any) => ({
        id: String(chain.id),
        networkId: String(chain.id),
        name: chain.name,
        logoUrl: chain.logoUrl,
        chainType: chain.chainType,
    }));

    const tokenItems: TokenItemData[] = ((tokens?.items as any[]) || []).map((token: any) => ({
        id: String(token.id),
        symbol: token.symbol,
        name: token.name,
        logoUrl: token.logoUrl,
        address: token.contractAddress,
        isNative: token.isNative,
        chainId: String(token.chainId),
        decimals: token.decimals,
    }));

    const settlementTokens = tokenItems.filter((token) => token.chainId === selectedSettlementChainId);

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            const res = await merchantRepository.updateSettings({
                callbackUrl: webhookUrl,
                webhookIsActive: isActive
            });
            if (res.error) throw new Error(res.error);
            toast.success(t('merchant_settings_view.save_changes'));
            queryClient.invalidateQueries({ queryKey: ['merchant', 'me'] });
        } catch (e: any) {
            toast.error(e.message || t('common.error'));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCreateKey = async () => {
        try {
            const res = await apiKeyRepository.createApiKey({ name: newKeyName, permissions: [] });
            if (res.data) {
                setCreatedSecret(res.data.secretKey);
                // Refresh keys
                const keyRes = await apiKeyRepository.getApiKeys();
                if (keyRes.data) setApiKeys(keyRes.data);
            }
        } catch (e) {
            toast.error(t('merchant_settings_view.api_keys.create_failed'));
        }
    };

    const handleSaveSettlement = async () => {
        setIsSavingSettlement(true);
        try {
            const res = await merchantRepository.updateSettlementProfile({
                dest_chain: settlementForm.dest_chain.trim(),
                dest_token: settlementForm.dest_token.trim(),
                dest_wallet: settlementForm.dest_wallet.trim(),
                bridge_token_symbol: settlementForm.bridge_token_symbol.trim().toUpperCase() || 'USDC',
            });
            if (res.error) throw new Error(res.error);
            if (res.data) {
                syncSettlementProfile(res.data);
            }
            const refreshed = await merchantRepository.getSettlementProfile();
            if (refreshed?.data) {
                syncSettlementProfile(refreshed.data);
            }
            toast.success(t('merchant_settings_view.settlement.saved_success'));
        } catch (e: any) {
            toast.error(e.message || t('merchant_settings_view.settlement.saved_failed'));
        } finally {
            setIsSavingSettlement(false);
        }
    };

    const handleSettlementChainSelect = (chain?: ChainItemData) => {
        const selected = (chains?.items || []).find((item: any) => String(item.id) === chain?.id);
        setSelectedSettlementChainId(chain?.id || "");
        setSelectedSettlementTokenId("");
        setSettlementForm(prev => ({
            ...prev,
            dest_chain: selected?.caip2 || "",
            dest_token: "",
        }));
    };

    const handleSettlementTokenSelect = (token?: TokenItemData) => {
        setSelectedSettlementTokenId(token?.id || "");
        setSettlementField('dest_token', token?.address || "");
    };

    const handleRevokeKey = async (id: string) => {
        if (!confirm(t('merchant_settings_view.api_keys.revoke_confirm'))) return;
        try {
            await apiKeyRepository.revokeApiKey(id);
            toast.success(t('merchant_settings_view.api_keys.revoked_success'));
            setApiKeys(prev => prev.map(k => k.id === id ? { ...k, isActive: false } : k));
        } catch (e) {
            toast.error(t('merchant_settings_view.api_keys.revoked_failed'));
        }
    };

    return (
        <div className="min-h-screen text-foreground">
            <div className="max-w-7xl mx-auto px-4 py-6 md:px-4 md:py-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-foreground">{t('merchant_settings_view.title')}</h1>
                        <p className="text-muted text-base">{t('merchant_settings_view.subtitle')}</p>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            onClick={handleUpdate}
                            loading={isUpdating}
                            variant="primary"
                            className="rounded-2xl"
                        >
                            {isUpdating ? <RefreshCcw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {t('merchant_settings_view.save_changes')}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left Panel: Configuration & Logs */}
                    <div className="col-span-12 space-y-8">

                        {/* Webhook Section */}
                        <SettingsSectionCard
                            icon={<Terminal size={24} />}
                            title={t('merchant_settings_view.webhook.title')}
                            description={t('merchant_settings_view.webhook.description')}
                            action={
                                <Button
                                    onClick={() => sendTestPing(webhookUrl)}
                                    loading={pingStatus === 'LOADING'}
                                    variant="secondary"
                                    size="sm"
                                    className="rounded-2xl"
                                >
                                    {pingStatus === 'LOADING' ? <RefreshCcw className="animate-spin w-3 h-3" /> : <Wifi className="w-3 h-3" />}
                                    {t('merchant_settings_view.webhook.test_ping')}
                                </Button>
                            }
                            className="overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <ShieldCheck size={180} />
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <Input
                                        label={t('merchant_settings_view.webhook.payload_destination')}
                                        placeholder="https://hooks.yourdomain.com/v1/payments"
                                        value={webhookUrl}
                                        onChange={e => setWebhookUrl(e.target.value)}
                                        className="rounded-2xl font-mono"
                                        inputSize="lg"
                                    />
                                    <p className="text-muted text-sm mt-4 flex items-center gap-2">
                                        <HelpCircle size={14} />
                                        {t('merchant_settings_view.webhook.payload_destination_help')}
                                    </p>
                                </div>

                                <Card variant="default" size="md" className="rounded-2xl bg-black/10">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-1">
                                            <h4 className="text-foreground font-bold text-lg">{t('merchant_settings_view.webhook.active_traffic_title')}</h4>
                                            <p className="text-muted text-sm">{t('merchant_settings_view.webhook.active_traffic_desc')}</p>
                                        </div>
                                        <Switch checked={isActive} onChange={setIsActive} />
                                    </div>
                                </Card>
                            </div>

                            {merchant?.webhookSecret && (
                                <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-muted uppercase tracking-wider">{t('merchant_settings_view.webhook.signing_secret')}</span>
                                        <div className="flex items-center gap-3">
                                            <code className="text-sm font-mono text-muted">
                                                {merchant.webhookSecret.substring(0, 16)}••••••••••••••••
                                            </code>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="rounded-2xl" onClick={() => {
                                        navigator.clipboard.writeText(merchant.webhookSecret);
                                        toast.success(t('merchant_settings_view.webhook.secret_copied'));
                                    }}>
                                        <Copy size={16} />
                                    </Button>
                                </div>
                            )}
                        </SettingsSectionCard>

                        {/* API Keys Section */}
                        <DataTableCard
                            title={t('merchant_settings_view.api_keys.title')}
                            icon={<Key className="text-green-500" size={20} />}
                            action={
                                <Button
                                    onClick={() => { setIsKeyModalOpen(true); setCreatedSecret(null); }}
                                    variant="secondary"
                                    size="sm"
                                    className="rounded-2xl"
                                >
                                    <RefreshCcw size={14} />
                                    {t('merchant_settings_view.api_keys.generate')}
                                </Button>
                            }
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-black/10 text-muted text-[10px] font-black uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">{t('merchant_settings_view.api_keys.name')}</th>
                                            <th className="px-6 py-4">{t('merchant_settings_view.api_keys.fingerprint')}</th>
                                            <th className="px-6 py-4">{t('merchant_settings_view.api_keys.status')}</th>
                                            <th className="px-6 py-4 text-right">{t('merchant_settings_view.api_keys.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {apiKeys.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-muted italic">{t('merchant_settings_view.api_keys.empty')}</td>
                                            </tr>
                                        ) : apiKeys.map(key => (
                                            <tr key={key.id} className="hover:bg-white/5 transition-all group">
                                                <td className="px-6 py-5 font-bold text-foreground text-sm">{key.name || t('merchant_settings_view.api_keys.untitled')}</td>
                                                <td className="px-6 py-5 font-mono text-xs text-muted">
                                                    {key.keyHash?.substring(0, 12)}••••
                                                </td>
                                                <td className="px-6 py-5">
                                                    {key.isActive ? (
                                                        <span className="flex items-center gap-1.5 text-green-500 text-[10px] font-black uppercase">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                            {t('merchant_settings_view.api_keys.active')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted text-[10px] font-black uppercase">{t('merchant_settings_view.api_keys.revoked')}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    {key.isActive && (
                                                        <Button
                                                            onClick={() => handleRevokeKey(key.id)}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="rounded-2xl text-red-400 hover:text-red-300"
                                                        >
                                                            <ShieldAlert size={18} />
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </DataTableCard>

                        {/* Recent Activity / Logs */}
                        <DataTableCard
                            title={t('merchant_settings_view.delivery_history.title')}
                            action={
                                <div className="text-muted text-sm font-medium flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    {t('merchant_settings_view.delivery_history.live_stream')}
                                </div>
                            }
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-black/10 text-muted text-[10px] font-black uppercase tracking-widest">
                                        <tr>
                                            <th className="px-8 py-4">{t('merchant_settings_view.delivery_history.event_type')}</th>
                                            <th className="px-8 py-4">{t('merchant_settings_view.delivery_history.status')}</th>
                                            <th className="px-8 py-4">{t('merchant_settings_view.delivery_history.http')}</th>
                                            <th className="px-8 py-4 text-right">{t('merchant_settings_view.delivery_history.time')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {logs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-10 text-center text-slate-600 italic">{t('merchant_settings_view.delivery_history.empty')}</td>
                                            </tr>
                                        ) : logs.map(log => (
                                            <tr key={log.id} className="hover:bg-slate-800/20 transition-all cursor-pointer group">
                                                <td className="px-8 py-6">
                                                    <span className="font-bold text-white text-sm">{log.eventType}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-black uppercase ${log.deliveryStatus === 'delivered' ? 'text-green-500' :
                                                            log.deliveryStatus === 'failed' ? 'text-red-500' : 'text-amber-500'
                                                            }`}>
                                                            {log.deliveryStatus}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 font-mono text-xs text-slate-500">
                                                    {log.httpStatus || "---"}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="text-slate-500 text-sm font-medium">
                                                        {new Date(log.createdAt).toLocaleTimeString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </DataTableCard>

                        <SettingsSectionCard
                            icon={<LinkIcon size={24} />}
                            title={t('merchant_settings_view.settlement.title')}
                            description={t('merchant_settings_view.settlement.description')}
                            action={
                                <Button
                                    onClick={handleSaveSettlement}
                                    loading={isSavingSettlement}
                                    variant="primary"
                                    className="rounded-2xl"
                                >
                                    {isSavingSettlement ? <RefreshCcw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                                    {t('merchant_settings_view.settlement.save')}
                                </Button>
                            }
                        >

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4 md:col-span-2">
                                        <p className="text-sm font-semibold text-foreground">{t('merchant_settings_view.settlement.token_group')}</p>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <ChainSelector
                                                label={t('merchant_settings_view.settlement.destination_chain')}
                                                chains={chainItems}
                                                selectedChainId={selectedSettlementChainId}
                                                onSelect={handleSettlementChainSelect}
                                                placeholder={t('merchant_settings_view.settlement.destination_chain_placeholder')}
                                            />
                                            <TokenSelector
                                                label={t('merchant_settings_view.settlement.destination_token')}
                                                tokens={settlementTokens}
                                                selectedTokenId={selectedSettlementTokenId}
                                                onSelect={handleSettlementTokenSelect}
                                                placeholder={selectedSettlementChainId ? t('merchant_settings_view.settlement.destination_token_placeholder') : t('merchant_settings_view.settlement.destination_token_select_chain_first')}
                                                disabled={!selectedSettlementChainId}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Input
                                    label={t('merchant_settings_view.settlement.destination_wallet')}
                                    placeholder={t('merchant_settings_view.settlement.destination_wallet_placeholder')}
                                    value={settlementForm.dest_wallet}
                                    onChange={(e) => setSettlementField('dest_wallet', e.target.value)}
                                />
                            </div>

                            <div className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                                <div className="p-6 bg-black/20 border border-white/10 rounded-2xl">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{t('merchant_settings_view.settlement.help_title')}</div>
                                    <ul className="space-y-2 text-sm text-slate-400 leading-relaxed">
                                        <li><span className="text-white font-semibold">{t('merchant_settings_view.settlement.token_group')}</span>: {t('merchant_settings_view.settlement.help_token')}</li>
                                        <li><span className="text-white font-semibold">{t('merchant_settings_view.settlement.destination_wallet')}</span>: {t('merchant_settings_view.settlement.help_wallet')}</li>
                                        <li><span className="text-white font-semibold">Internal defaults</span>: {t('merchant_settings_view.settlement.help_defaults')}</li>
                                    </ul>
                                    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 space-y-2">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Persisted Profile</div>
                                        <div className="text-xs text-slate-300 font-mono break-all">chain: {settlementForm.dest_chain || '-'}</div>
                                        <div className="text-xs text-slate-300 font-mono break-all">token: {settlementForm.dest_token || '-'}</div>
                                        <div className="text-xs text-slate-300 font-mono break-all">wallet: {settlementForm.dest_wallet || '-'}</div>
                                    </div>
                                </div>
                                <div className="p-6 bg-black/20 border border-white/10 rounded-2xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('merchant_settings_view.settlement.connected_wallets')}</div>
                                        <Link href="/wallets" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
                                            {t('merchant_settings_view.settlement.manage_wallets')}
                                        </Link>
                                    </div>
                                    {wallets.length === 0 ? (
                                        <p className="text-sm text-slate-500">{t('merchant_settings_view.settlement.no_wallets')}</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {wallets.map((wallet) => (
                                                <div key={wallet.id} className="rounded-xl border border-slate-800 bg-black/30 p-4 flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-semibold text-white truncate">{wallet.address}</div>
                                                        <div className="text-xs text-slate-500">{wallet.chainId}{wallet.isPrimary ? ' • Primary' : ''}</div>
                                                    </div>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => setSettlementField('dest_wallet', wallet.address)}
                                                    >
                                                        {t('merchant_settings_view.settlement.use_wallet')}
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SettingsSectionCard>
                    </div>
                </div>
            </div>

            {/* API Key Modal */}
            <BaseModal
                isOpen={isKeyModalOpen}
                onClose={() => setIsKeyModalOpen(false)}
                title={createdSecret ? t('merchant_settings_view.api_keys.modal_created_title') : t('merchant_settings_view.api_keys.modal_create_title')}
                onConfirm={createdSecret ? () => setIsKeyModalOpen(false) : handleCreateKey}
                confirmLabel={createdSecret ? t('merchant_settings_view.api_keys.modal_close') : t('merchant_settings_view.api_keys.modal_generate')}
            >
                {createdSecret ? (
                    <div className="space-y-6">
                        <Card variant="outlined" size="sm" className="rounded-2xl border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
                            <ShieldAlert className="text-amber-500 shrink-0" size={20} />
                            <p className="text-amber-200 text-sm">
                                {t('merchant_settings_view.api_keys.modal_secret_warning')}
                            </p>
                        </Card>
                        <Card variant="default" size="md" className="rounded-2xl bg-black/20 border-white/10 relative group">
                            <code className="text-white font-mono break-all text-sm">{createdSecret}</code>
                            <Button
                                onClick={() => {
                                    navigator.clipboard.writeText(createdSecret);
                                    toast.success(t('merchant_settings_view.webhook.secret_copied'));
                                }}
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-4 rounded-xl opacity-0 group-hover:opacity-100"
                            >
                                <Copy size={16} />
                            </Button>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Input
                            label={t('merchant_settings_view.api_keys.key_name')}
                            placeholder={t('merchant_settings_view.api_keys.key_name_placeholder')}
                            value={newKeyName}
                            onChange={e => setNewKeyName(e.target.value)}
                        />
                    </div>
                )}
            </BaseModal>
        </div>
    );
};

export default DeveloperSettings;
