type StripeConstructor = new (secretKey: string, options: Record<string, unknown>) => StripeClient;

type StripeClient = {
  checkout: {
    sessions: {
      create: (payload: Record<string, unknown>) => Promise<{ id: string; url: string | null }>;
    };
  };
  webhooks: {
    constructEvent: (body: string, signature: string, secret: string) => {
      type: string;
      data: { object: { id: string; mode?: string; metadata?: Record<string, string>; payment_intent?: string | unknown } };
    };
  };
};

let stripeClient: StripeClient | undefined;

async function importExternal(moduleName: string) {
  const importer = new Function("moduleName", "return import(moduleName)") as (name: string) => Promise<Record<string, unknown>>;
  return importer(moduleName);
}

export async function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!stripeClient) {
    const loaded = await importExternal("stripe");
    const Stripe = (loaded.default || loaded) as StripeConstructor;
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-04-30.basil",
      typescript: true,
    });
  }

  return stripeClient;
}
