import { getEnv } from "../../config/env.js";
import { getLogger } from "../../lib/logger.js";

export interface CreateCustomerParams {
  email: string;
  name: string;
  orgId: string;
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  trialDays?: number;
}

export interface Subscription {
  id: string;
  customerId: string;
  status: "active" | "past_due" | "canceled" | "trialing" | "incomplete";
  priceId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface Invoice {
  id: string;
  customerId: string;
  subscriptionId: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  invoiceUrl: string;
  created: string;
}

export interface IPaymentProvider {
  createCustomer(params: CreateCustomerParams): Promise<{ id: string }>;
  createSubscription(params: CreateSubscriptionParams): Promise<Subscription>;
  cancelSubscription(subscriptionId: string): Promise<Subscription>;
  getSubscription(subscriptionId: string): Promise<Subscription | null>;
  listInvoices(customerId: string): Promise<Invoice[]>;
  createBillingPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<{ url: string }>;
}

class StripePaymentProvider implements IPaymentProvider {
  private apiKey: string;
  private logger = getLogger();
  private baseUrl = "https://api.stripe.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    path: string,
    method: "GET" | "POST" | "DELETE" = "GET",
    body?: Record<string, string>,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    this.logger.debug({ url, method }, "Stripe API request");

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
    };

    let requestBody: string | undefined;
    if (body) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      requestBody = new URLSearchParams(body).toString();
    }

    const response = await fetch(url, { method, headers, body: requestBody });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(
        { status: response.status, body: errorBody },
        "Stripe API error",
      );
      throw new Error(`Stripe API error: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async createCustomer(params: CreateCustomerParams): Promise<{ id: string }> {
    const body: Record<string, string> = {
      email: params.email,
      name: params.name,
      "metadata[orgId]": params.orgId,
    };
    if (params.metadata) {
      for (const [key, value] of Object.entries(params.metadata)) {
        body[`metadata[${key}]`] = value;
      }
    }
    return this.request<{ id: string }>("/customers", "POST", body);
  }

  async createSubscription(
    params: CreateSubscriptionParams,
  ): Promise<Subscription> {
    const body: Record<string, string> = {
      customer: params.customerId,
      "items[0][price]": params.priceId,
    };
    if (params.trialDays) {
      body["trial_period_days"] = String(params.trialDays);
    }

    const raw = await this.request<Record<string, unknown>>(
      "/subscriptions",
      "POST",
      body,
    );
    return this.mapSubscription(raw);
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    const raw = await this.request<Record<string, unknown>>(
      `/subscriptions/${subscriptionId}`,
      "DELETE",
    );
    return this.mapSubscription(raw);
  }

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    try {
      const raw = await this.request<Record<string, unknown>>(
        `/subscriptions/${subscriptionId}`,
      );
      return this.mapSubscription(raw);
    } catch {
      return null;
    }
  }

  async listInvoices(customerId: string): Promise<Invoice[]> {
    const raw = await this.request<{ data: Record<string, unknown>[] }>(
      `/invoices?customer=${customerId}&limit=20`,
    );
    return raw.data.map((inv) => this.mapInvoice(inv));
  }

  async createBillingPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<{ url: string }> {
    return this.request<{ url: string }>(
      "/billing_portal/sessions",
      "POST",
      { customer: customerId, return_url: returnUrl },
    );
  }

  private mapSubscription(raw: Record<string, unknown>): Subscription {
    return {
      id: raw["id"] as string,
      customerId: raw["customer"] as string,
      status: raw["status"] as Subscription["status"],
      priceId: ((raw["items"] as { data: { price: { id: string } }[] })?.data?.[0]
        ?.price?.id ?? "") as string,
      currentPeriodStart: new Date(
        (raw["current_period_start"] as number) * 1000,
      ).toISOString(),
      currentPeriodEnd: new Date(
        (raw["current_period_end"] as number) * 1000,
      ).toISOString(),
      cancelAtPeriodEnd: raw["cancel_at_period_end"] as boolean,
    };
  }

  private mapInvoice(raw: Record<string, unknown>): Invoice {
    return {
      id: raw["id"] as string,
      customerId: raw["customer"] as string,
      subscriptionId: raw["subscription"] as string,
      amountDue: raw["amount_due"] as number,
      amountPaid: raw["amount_paid"] as number,
      currency: raw["currency"] as string,
      status: raw["status"] as Invoice["status"],
      invoiceUrl: (raw["hosted_invoice_url"] as string) ?? "",
      created: new Date((raw["created"] as number) * 1000).toISOString(),
    };
  }
}

class MockPaymentProvider implements IPaymentProvider {
  private subscriptions = new Map<string, Subscription>();
  private counter = 0;

  private nextId(prefix: string): string {
    this.counter++;
    return `${prefix}_mock_${this.counter.toString().padStart(6, "0")}`;
  }

  async createCustomer(params: CreateCustomerParams): Promise<{ id: string }> {
    return { id: this.nextId("cus") };
  }

  async createSubscription(
    params: CreateSubscriptionParams,
  ): Promise<Subscription> {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const sub: Subscription = {
      id: this.nextId("sub"),
      customerId: params.customerId,
      status: params.trialDays ? "trialing" : "active",
      priceId: params.priceId,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
    };

    this.subscriptions.set(sub.id, sub);
    return sub;
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    const sub = this.subscriptions.get(subscriptionId);
    if (!sub) {
      throw new Error(`Subscription ${subscriptionId} not found`);
    }
    sub.cancelAtPeriodEnd = true;
    return sub;
  }

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    return this.subscriptions.get(subscriptionId) ?? null;
  }

  async listInvoices(customerId: string): Promise<Invoice[]> {
    const now = new Date();
    return [
      {
        id: this.nextId("inv"),
        customerId,
        subscriptionId: "sub_mock_000001",
        amountDue: 9900,
        amountPaid: 9900,
        currency: "usd",
        status: "paid",
        invoiceUrl: "https://invoice.stripe.com/mock/inv_001",
        created: now.toISOString(),
      },
    ];
  }

  async createBillingPortalSession(
    _customerId: string,
    returnUrl: string,
  ): Promise<{ url: string }> {
    return {
      url: `https://billing.stripe.com/mock/session?return_url=${encodeURIComponent(returnUrl)}`,
    };
  }
}

export function createPaymentProvider(): IPaymentProvider {
  const env = getEnv();

  if (env.STRIPE_SECRET_KEY) {
    return new StripePaymentProvider(env.STRIPE_SECRET_KEY);
  }

  return new MockPaymentProvider();
}
