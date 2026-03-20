import { AdminMerchantSettlementProfileView } from '@/presentation/view/admin/merchants/AdminMerchantSettlementProfileView';

export default async function AdminMerchantSettlementProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminMerchantSettlementProfileView merchantId={id} />;
}
