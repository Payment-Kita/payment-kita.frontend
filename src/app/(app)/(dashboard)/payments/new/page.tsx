import { NewPaymentView } from '@/presentation/view/payments/new';
import { getNewPaymentPageInit } from '@/presentation/view/payments/new/getNewPaymentPageInit';

export default async function NewPaymentPage() {
    const initData = await getNewPaymentPageInit();

    return <NewPaymentView initData={initData} />;
}
