declare module 'midtrans-client' {
  interface SnapConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  interface CustomerDetails {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  }

  interface ItemDetails {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }

  interface SnapTransactionParams {
    transaction_details: TransactionDetails;
    customer_details?: CustomerDetails;
    item_details?: ItemDetails[];
    callbacks?: {
      finish?: string;
    };
  }

  interface SnapTransactionResponse {
    token: string;
    redirect_url: string;
  }

  class Snap {
    constructor(config: SnapConfig);
    createTransaction(params: SnapTransactionParams): Promise<SnapTransactionResponse>;
  }

  class CoreApi {
    constructor(config: SnapConfig);
    transaction: {
      status(orderId: string): Promise<any>;
      cancel(orderId: string): Promise<any>;
    };
  }

  export { Snap, CoreApi };
  export default { Snap, CoreApi };
}
