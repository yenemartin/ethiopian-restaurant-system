"use client";
import React, { useEffect, useMemo, useState } from "react";

type Mode = "pickup" | "dine-in";
type MenuCategory = "Meat" | "Vegan" | "Combo" | "Sides" | "Drinks";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  available: boolean;
  spice: "" | "Mild" | "Medium" | "Hot";
  image: string;
};

type CartItem = MenuItem & { qty: number };

type KitchenOrder = {
  id: string;
  type: Mode;
  status: "open" | "preparing" | "served" | "ready" | "completed";
  payment: "paid" | "unpaid";
  total: number;
  pickupTime?: string;
  table?: number;
  items: { name: string; qty: number }[];
};

type RestaurantHeroImage = {
  src: string;
  name: string;
  caption: string;
};

function parseTimeToMinutes(value: string): number {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return -1;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const suffix = match[3].toUpperCase();

  if (suffix === "PM" && hours !== 12) hours += 12;
  if (suffix === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function isWithinConfiguredHours({
  open,
  close,
  enabled,
  now,
}: {
  open: string;
  close: string;
  enabled: boolean;
  now: Date;
}): boolean {
  if (!enabled) return false;

  const openMinutes = parseTimeToMinutes(open);
  const closeMinutes = parseTimeToMinutes(close);
  if (openMinutes < 0 || closeMinutes < 0) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (closeMinutes >= openMinutes) {
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }

  return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
}

function calculateOrderAmounts(items: CartItem[], taxRate: number, serviceFee: number) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = Number((subtotal * taxRate).toFixed(2));
  const fee = Number(serviceFee.toFixed(2));
  const total = Number((subtotal + tax + fee).toFixed(2));
  return { subtotal, tax, fee, total };
}

function getSelfTestResults() {
  const results: { name: string; passed: boolean }[] = [];
  const test = (name: string, passed: boolean) => results.push({ name, passed });

  test("11:00 AM parses correctly", parseTimeToMinutes("11:00 AM") === 660);
  test("12:00 AM parses correctly", parseTimeToMinutes("12:00 AM") === 0);
  test("7:05 PM parses correctly", parseTimeToMinutes("7:05 PM") === 1145);
  test(
    "Standard hours allow noon",
    isWithinConfiguredHours({
      open: "11:00 AM",
      close: "9:30 PM",
      enabled: true,
      now: new Date("2026-04-23T12:00:00"),
    }) === true
  );
  test(
    "Standard hours block 10 PM",
    isWithinConfiguredHours({
      open: "11:00 AM",
      close: "9:30 PM",
      enabled: true,
      now: new Date("2026-04-23T22:00:00"),
    }) === false
  );
  test(
    "Overnight hours allow 1 AM",
    isWithinConfiguredHours({
      open: "6:00 PM",
      close: "2:00 AM",
      enabled: true,
      now: new Date("2026-04-23T01:00:00"),
    }) === true
  );

  const totals = calculateOrderAmounts(
    [
      {
        id: "preview-doro-wat",
        name: "A",
        description: "",
        category: "Meat",
        price: 10,
        available: true,
        spice: "",
        image: "ethiopian-doro-wat",
        qty: 2,
      },
      {
        id: "preview-misir-wat",
        name: "B",
        description: "",
        category: "Sides",
        price: 5,
        available: true,
        spice: "",
        image: "ethiopian-injera",
        qty: 1,
      },
    ],
    0.1,
    1.5
  );

  test("Subtotal is correct", totals.subtotal === 25);
  test("Total is correct", totals.total === 29);

  return results;
}

const initialMenu: MenuItem[] = [
  {
    id: "preview-doro-wat",
    name: "Doro Wat",
    description: "Spicy chicken stew with egg and injera.",
    category: "Meat",
    price: 18.99,
    available: true,
    spice: "Hot",
    image: "ethiopian-doro-wat",
  },
  {
    id: "preview-misir-wat",
    name: "Misir Wat",
    description: "Berbere lentils, slow-simmered and rich.",
    category: "Vegan",
    price: 14.5,
    available: true,
    spice: "Medium",
    image: "ethiopian-misir-wat",
  },
  {
    id: "preview-veggie-combo",
    name: "Veggie Combo",
    description: "Assorted seasonal vegetables and lentils on injera.",
    category: "Combo",
    price: 16.99,
    available: true,
    spice: "Mild",
    image: "ethiopian-veggie-combo",
  },
  {
    id: "preview-kitfo",
    name: "Kitfo",
    description: "Minced beef, mitmita butter, ayib on the side.",
    category: "Meat",
    price: 22,
    available: false,
    spice: "Hot",
    image: "ethiopian-kitfo",
  },
  {
    id: "preview-injera",
    name: "Extra Injera",
    description: "Fresh rolled injera.",
    category: "Sides",
    price: 2.5,
    available: true,
    spice: "",
    image: "ethiopian-injera",
  },
  {
    id: "preview-coffee",
    name: "Ethiopian Coffee",
    description: "Traditional dark roast coffee.",
    category: "Drinks",
    price: 4.5,
    available: true,
    spice: "",
    image: "ethiopian-coffee",
  },
];

const initialHero: RestaurantHeroImage = {
  src: "ethiopian-restaurant-seattle-main",
  name: "Addis Ababa Dining Room",
  caption: "Warm lighting, modern Ethiopian decor, and a lively dining atmosphere.",
};

const sampleOrders: KitchenOrder[] = [
  {
    id: "P-104",
    type: "pickup",
    status: "preparing",
    payment: "paid",
    total: 38.48,
    pickupTime: "ASAP",
    items: [
      { name: "Doro Wat", qty: 1 },
      { name: "Extra Injera", qty: 1 },
      { name: "Ethiopian Coffee", qty: 2 },
    ],
  },
  {
    id: "T-12",
    type: "dine-in",
    status: "served",
    payment: "unpaid",
    total: 54.23,
    table: 12,
    items: [
      { name: "Veggie Combo", qty: 2 },
      { name: "Misir Wat", qty: 1 },
    ],
  },
  {
    id: "T-7",
    type: "dine-in",
    status: "preparing",
    payment: "unpaid",
    total: 22,
    table: 7,
    items: [{ name: "Kitfo", qty: 1 }],
  },
];

function CardShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-white shadow-sm border border-stone-100 ${className}`}>{children}</div>;
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function AppButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  className?: string;
}) {
  const styles =
    variant === "primary"
      ? "bg-stone-950 text-white hover:bg-stone-800"
      : variant === "secondary"
        ? "bg-white text-stone-950 border border-stone-200 hover:bg-stone-50"
        : "bg-transparent text-stone-700 hover:bg-stone-100";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

function ImageBox({ src, title, subtitle }: { src: string; title: string; subtitle: string }) {
  const isPlaceholder = src.startsWith("ethiopian-");

  if (!isPlaceholder) {
    return <img src={src} alt={title} className="h-full w-full object-cover" />;
  }

  const themeMap: Record<string, string> = {
    "ethiopian-doro-wat": "from-red-950 via-red-700 to-amber-500",
    "ethiopian-misir-wat": "from-orange-950 via-orange-700 to-yellow-500",
    "ethiopian-veggie-combo": "from-green-950 via-lime-700 to-yellow-400",
    "ethiopian-kitfo": "from-rose-950 via-rose-700 to-orange-500",
    "ethiopian-injera": "from-stone-700 via-amber-600 to-yellow-300",
    "ethiopian-coffee": "from-stone-950 via-stone-700 to-amber-700",
    "ethiopian-restaurant-seattle-main": "from-stone-950 via-amber-800 to-stone-700",
  };

  const labelMap: Record<string, string> = {
    "ethiopian-doro-wat": "ዶሮ ወጥ",
    "ethiopian-misir-wat": "ምስር ወጥ",
    "ethiopian-veggie-combo": "የጾም በየነቱ",
    "ethiopian-kitfo": "ክትፎ",
    "ethiopian-injera": "እንጀራ",
    "ethiopian-coffee": "ቡና",
    "ethiopian-restaurant-seattle-main": "Addis Ababa",
  };

  return (
    <div className={`h-full w-full bg-gradient-to-br ${themeMap[src] || "from-stone-900 via-amber-800 to-stone-700"} p-6`}>
      <div className="flex h-full w-full flex-col items-center justify-center rounded-[2rem] border border-white/20 bg-black/10 text-center text-white">
        <div className="text-3xl font-bold tracking-wide">{labelMap[src] || title}</div>
        <div className="mt-3 text-xs uppercase tracking-[0.25em] text-white/80">{subtitle}</div>
      </div>
    </div>
  );
}

function MenuCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  return (
    <CardShell className="overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        <ImageBox src={item.image} title={item.name} subtitle="Ethiopian Kitchen" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
          <Badge className="bg-white text-stone-900">{item.category}</Badge>
          {item.spice ? <Badge className="bg-orange-100 text-orange-900">{item.spice}</Badge> : null}
          {!item.available ? <Badge className="bg-red-100 text-red-900">Unavailable</Badge> : null}
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-stone-900">{item.name}</h3>
            <p className="text-sm text-stone-500">{item.description}</p>
          </div>
          <div className="font-bold text-stone-900">${item.price.toFixed(2)}</div>
        </div>
        <AppButton disabled={!item.available} onClick={() => onAdd(item)} className="w-full">
          Add to order
        </AppButton>
      </div>
    </CardShell>
  );
}

function MainSite({
  hero,
  pickupOpen,
  pickupClose,
  dineInOpen,
  dineInClose,
  pickupEnabled,
  dineInEnabled,
  onOrder,
}: {
  hero: RestaurantHeroImage;
  pickupOpen: string;
  pickupClose: string;
  dineInOpen: string;
  dineInClose: string;
  pickupEnabled: boolean;
  dineInEnabled: boolean;
  onOrder: () => void;
}) {
  const [musicMode, setMusicMode] = useState<"dj" | "live" | null>(null);

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-stone-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 font-bold text-white">AA</div>
          <div>
            <div className="font-bold text-stone-900">Addis Ababa</div>
            <div className="text-xs text-stone-500">Ethiopian Restaurant • Seattle</div>
          </div>
        </div>
        <div className="hidden items-center gap-5 text-sm text-stone-600 md:flex">
          <span>Menu</span>
          <span>Pickup</span>
          <span>Dine-In</span>
          <span>Events</span>
          <span>Contact</span>
        </div>
        <AppButton onClick={onOrder}>Order Now</AppButton>
      </nav>

      <section className="grid items-stretch gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] bg-gradient-to-br from-stone-950 via-stone-900 to-amber-900 p-8 text-white shadow-sm md:p-10">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-white/15 text-white">Seattle Ethiopian Dining</Badge>
            <Badge className="bg-green-400/20 text-green-100">Open for pickup & dine-in</Badge>
          </div>
          <h2 className="mt-6 max-w-2xl text-4xl font-black leading-tight md:text-5xl">
            Injera, coffee, shared platters, and late-night Ethiopian vibes.
          </h2>
          <p className="mt-4 max-w-xl text-stone-200">
            Order direct for pickup, open a dine-in tab from your table, or reserve a night with DJ and live band experiences.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <AppButton onClick={onOrder} variant="secondary">Order Now →</AppButton>
            <AppButton variant="ghost" className="border border-white/30 text-white hover:bg-white/10">Reserve Table</AppButton>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4 text-sm">🧾 Direct ordering without marketplace fees</div>
            <div className="rounded-2xl bg-white/10 p-4 text-sm">✨ Group dining with platters and coffee</div>
            <div className="rounded-2xl bg-white/10 p-4 text-sm">🛡️ Secure checkout and admin controls</div>
          </div>
        </div>

        <div className="grid gap-6">
          <CardShell className="overflow-hidden">
            <div className="relative aspect-[16/10]">
              <ImageBox src={hero.src} title={hero.name} subtitle="Seattle Restaurant" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
                <Badge className="bg-white/90 text-stone-900">Featured Restaurant Image</Badge>
                <div className="max-w-xs rounded-2xl bg-black/45 px-4 py-3 text-sm text-white backdrop-blur">
                  {hero.caption}
                </div>
              </div>
            </div>
          </CardShell>

          <CardShell className="p-5">
            <h3 className="text-xl font-bold text-stone-900">Hours</h3>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="rounded-2xl bg-stone-50 p-4">
                <div className="font-bold">Pickup</div>
                <div>{pickupEnabled ? `${pickupOpen} – ${pickupClose}` : "Closed"}</div>
              </div>
              <div className="rounded-2xl bg-stone-50 p-4">
                <div className="font-bold">Dine-In</div>
                <div>{dineInEnabled ? `${dineInOpen} – ${dineInClose}` : "Closed"}</div>
              </div>
            </div>
          </CardShell>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <CardShell className="p-6">
          <h3 className="text-2xl font-black text-stone-900">🌙 Night Experience</h3>
          <p className="mt-2 text-sm text-stone-600">Transform your evening with Ethiopian dining, music, and atmosphere.</p>
          <div className="mt-4 flex gap-3">
            <AppButton variant={musicMode === "dj" ? "primary" : "secondary"} onClick={() => setMusicMode("dj")}>DJ Night</AppButton>
            <AppButton variant={musicMode === "live" ? "primary" : "secondary"} onClick={() => setMusicMode("live")}>Live Band</AppButton>
          </div>
          <div className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm text-stone-700">
            {musicMode === "dj" && "High-energy DJ sets with modern Ethiopian and Afrobeat vibes."}
            {musicMode === "live" && "Live band performances with traditional and contemporary Ethiopian music."}
            {!musicMode && "Select DJ Night or Live Band to preview the vibe."}
          </div>
          <div className="mt-4 rounded-2xl border border-stone-200 p-4 text-sm">
            <div><strong>Next Event:</strong> Friday Night</div>
            <div>Cover: $10</div>
            <div>Reservation required</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <AppButton>Reserve Event Table</AppButton>
            <AppButton variant="secondary">Buy Cover Ticket</AppButton>
          </div>
        </CardShell>

        <CardShell className="p-6">
          <h3 className="text-2xl font-black text-stone-900">Featured Menu</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {initialMenu.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-2xl bg-stone-50 p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-stone-500">{item.category}</div>
                  </div>
                  <div className="font-bold">${item.price.toFixed(2)}</div>
                </div>
                <p className="mt-2 text-sm text-stone-600">{item.description}</p>
              </div>
            ))}
          </div>
        </CardShell>
      </section>
    </div>
  );
}

export default function HybridEthiopianRestaurantPreview() {
  const selfTests = useMemo(() => getSelfTestResults(), []);
  const [activeTab, setActiveTab] = useState<"main" | "customer" | "admin" | "kds" | "tests">("main");
  const [mode, setMode] = useState<Mode>("pickup");
  const [menu, setMenu] = useState<MenuItem[]>(initialMenu);
  const [hero, setHero] = useState<RestaurantHeroImage>(initialHero);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [dineInEnabled, setDineInEnabled] = useState(true);
  const [pickupOpen, setPickupOpen] = useState("11:00 AM");
  const [pickupClose, setPickupClose] = useState("9:30 PM");
  const [dineInOpen, setDineInOpen] = useState("11:00 AM");
  const [dineInClose, setDineInClose] = useState("10:00 PM");
  const [taxRate, setTaxRate] = useState("0.101");
  const [serviceFee, setServiceFee] = useState("0.00");
  const [category, setCategory] = useState<"All" | MenuCategory>("All");
  const [message, setMessage] = useState("");

  const fixedPreviewTime = new Date("2026-04-23T19:15:00");
  const isPickupOpen = isWithinConfiguredHours({ open: pickupOpen, close: pickupClose, enabled: pickupEnabled, now: fixedPreviewTime });
  const isDineInOpen = isWithinConfiguredHours({ open: dineInOpen, close: dineInClose, enabled: dineInEnabled, now: fixedPreviewTime });
  const isCurrentModeOpen = mode === "pickup" ? isPickupOpen : isDineInOpen;

  const visibleMenu = useMemo(() => {
    if (category === "All") return menu;
    return menu.filter((item) => item.category === category);
  }, [category, menu]);

  const amounts = useMemo(() => calculateOrderAmounts(cart, Number(taxRate || 0), Number(serviceFee || 0)), [cart, taxRate, serviceFee]);

  useEffect(() => {
    let ignore = false;
    async function loadMenu() {
      const response = await fetch("/api/menu");
      if (!response.ok) return;
      const data = await response.json();
      if (!ignore && Array.isArray(data.menu) && data.menu.length > 0) {
        setMenu(
          data.menu.map((item: MenuItem & { _id?: string }) => ({
            ...item,
            id: item._id || item.id,
          }))
        );
      }
    }
    loadMenu();
    return () => {
      ignore = true;
    };
  }, []);

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const found = prev.find((cartItem) => cartItem.id === item.id);
      if (found) {
        return prev.map((cartItem) => (cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }

  async function submitOrder() {
    if (cart.length === 0) {
      setMessage("Add at least one item before placing an order.");
      return;
    }

    if (!isCurrentModeOpen) {
      setMessage(mode === "pickup" ? "Pickup ordering is currently closed." : "Dine-in ordering is currently closed.");
      return;
    }

    setMessage(mode === "pickup" ? "Creating prepaid Stripe Checkout session…" : "Creating dine-in pay-later Stripe Checkout session…");

    const dbBackedItems = cart.filter((item) => !item.id.startsWith("preview-") && !item.id.startsWith("test-"));
    if (dbBackedItems.length !== cart.length) {
      setMessage("Seed MongoDB first, then refresh so checkout uses database menu item IDs.");
      return;
    }

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        orderType: mode,
        paymentMode: mode === "pickup" ? "prepaid" : "pay-later",
        customerName: mode === "pickup" ? "Pickup Guest" : "Table Guest",
        customerEmail: "guest@example.com",
        pickupTime: mode === "pickup" ? "ASAP" : undefined,
        tableNumber: mode === "dine-in" ? 12 : undefined,
        items: cart.map((item) => ({ menuItemId: item.id, quantity: item.qty })),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Unable to create checkout session.");
      return;
    }
    if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    else setMessage(`Order ${data.orderId} created.`);
  }

  const tabs = [
    { id: "main", label: "Main Site" },
    { id: "customer", label: "Customer" },
    { id: "admin", label: "Admin" },
    { id: "kds", label: "Kitchen" },
    { id: "tests", label: "Tests" },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-stone-900 md:text-4xl">Addis Ababa Restaurant UI Preview</h1>
            <p className="mt-1 text-stone-600">Pickup, dine-in, admin controls, kitchen display, events, and image management.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-green-100 text-green-900">Direct ordering system</Badge>
            <Badge className="bg-stone-100 text-stone-700">{selfTests.every((t) => t.passed) ? "Self-tests passed" : "Check tests"}</Badge>
          </div>
        </header>

        <div className="grid w-full gap-2 rounded-2xl bg-white p-2 shadow-sm md:grid-cols-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${activeTab === tab.id ? "bg-stone-950 text-white" : "text-stone-600 hover:bg-stone-100"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "main" && (
          <MainSite
            hero={hero}
            pickupOpen={pickupOpen}
            pickupClose={pickupClose}
            dineInOpen={dineInOpen}
            dineInClose={dineInClose}
            pickupEnabled={pickupEnabled}
            dineInEnabled={dineInEnabled}
            onOrder={() => setActiveTab("customer")}
          />
        )}

        {activeTab === "customer" && (
          <section className="grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">
            <div className="space-y-6">
              <CardShell className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-stone-900">Order Type</h2>
                    <p className="text-sm text-stone-500">Pickup is prepaid. Dine-in can pay later.</p>
                  </div>
                  <div className="flex gap-2">
                    <AppButton variant={mode === "pickup" ? "primary" : "secondary"} onClick={() => setMode("pickup")}>Pickup</AppButton>
                    <AppButton variant={mode === "dine-in" ? "primary" : "secondary"} onClick={() => setMode("dine-in")}>Dine-In</AppButton>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-stone-50 p-4 text-sm">
                    <div className="font-bold">Pickup Hours</div>
                    <div>{pickupEnabled ? `${pickupOpen} – ${pickupClose}` : "Closed"}</div>
                    <div className="mt-1 text-stone-500">{isPickupOpen ? "Accepting orders now" : "Currently closed"}</div>
                  </div>
                  <div className="rounded-2xl bg-stone-50 p-4 text-sm">
                    <div className="font-bold">Dine-In Hours</div>
                    <div>{dineInEnabled ? `${dineInOpen} – ${dineInClose}` : "Closed"}</div>
                    <div className="mt-1 text-stone-500">{isDineInOpen ? "Accepting orders now" : "Currently closed"}</div>
                  </div>
                </div>
              </CardShell>

              <div className="flex flex-wrap gap-2">
                {(["All", "Meat", "Vegan", "Combo", "Sides", "Drinks"] as const).map((cat) => (
                  <AppButton key={cat} variant={category === cat ? "primary" : "secondary"} onClick={() => setCategory(cat)}>{cat}</AppButton>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleMenu.map((item) => <MenuCard key={item.id} item={item} onAdd={addToCart} />)}
              </div>
            </div>

            <CardShell className="h-fit p-6 lg:sticky lg:top-6">
              <h2 className="text-xl font-black text-stone-900">🛒 Current Order</h2>
              <p className="mt-1 text-sm text-stone-500">{mode === "pickup" ? "Pickup is prepaid before fulfillment." : "Dine-in opens a tab and can be paid later."}</p>
              <div className="mt-5 space-y-3">
                {cart.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">Add menu items to preview the cart.</div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-2xl border border-stone-200 p-3">
                      <div>
                        <div className="font-bold">{item.name}</div>
                        <div className="text-xs text-stone-500">Qty {item.qty}</div>
                      </div>
                      <div className="font-bold">${(item.price * item.qty).toFixed(2)}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-5 space-y-2 rounded-2xl bg-stone-50 p-4 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>${amounts.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>${amounts.tax.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Service Fee</span><span>${amounts.fee.toFixed(2)}</span></div>
                <div className="flex justify-between text-base font-black"><span>Total</span><span>${amounts.total.toFixed(2)}</span></div>
              </div>
              {message ? <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-stone-700">{message}</div> : null}
              <AppButton onClick={submitOrder} className="mt-5 w-full">{mode === "pickup" ? "Pay for Pickup" : "Send Dine-In Order"}</AppButton>
            </CardShell>
          </section>
        )}

        {activeTab === "admin" && (
          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <CardShell className="p-6">
              <h2 className="text-xl font-black text-stone-900">🌙 Night Event Settings</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input className="rounded-2xl border border-stone-200 px-4 py-2" placeholder="Event Day (e.g. Friday)" />
                <input className="rounded-2xl border border-stone-200 px-4 py-2" placeholder="Start Time (e.g. 7:00 PM)" />
                <input className="rounded-2xl border border-stone-200 px-4 py-2" placeholder="Cover Charge ($)" />
                <input className="rounded-2xl border border-stone-200 px-4 py-2" placeholder="Capacity" />
              </div>
              <AppButton className="mt-4 w-full">Save Event</AppButton>
            </CardShell>

            <CardShell className="p-6">
              <h2 className="text-xl font-black text-stone-900">⚙️ Hours, Billing & Restaurant Image</h2>
              <div className="mt-4 space-y-4 rounded-2xl border border-stone-200 p-4">
                <div className="font-bold">Homepage Restaurant Image</div>
                <input className="w-full rounded-2xl border border-stone-200 px-4 py-2" value={hero.src} onChange={(e) => setHero((prev) => ({ ...prev, src: e.target.value }))} placeholder="Restaurant image URL or placeholder key" />
                <input className="w-full rounded-2xl border border-stone-200 px-4 py-2" value={hero.name} onChange={(e) => setHero((prev) => ({ ...prev, name: e.target.value }))} placeholder="Image title" />
                <input className="w-full rounded-2xl border border-stone-200 px-4 py-2" value={hero.caption} onChange={(e) => setHero((prev) => ({ ...prev, caption: e.target.value }))} placeholder="Image caption" />
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-bold">Pickup Open<input className="w-full rounded-2xl border border-stone-200 px-4 py-2 font-normal" value={pickupOpen} onChange={(e) => setPickupOpen(e.target.value)} /></label>
                <label className="space-y-2 text-sm font-bold">Pickup Close<input className="w-full rounded-2xl border border-stone-200 px-4 py-2 font-normal" value={pickupClose} onChange={(e) => setPickupClose(e.target.value)} /></label>
                <label className="space-y-2 text-sm font-bold">Dine-In Open<input className="w-full rounded-2xl border border-stone-200 px-4 py-2 font-normal" value={dineInOpen} onChange={(e) => setDineInOpen(e.target.value)} /></label>
                <label className="space-y-2 text-sm font-bold">Dine-In Close<input className="w-full rounded-2xl border border-stone-200 px-4 py-2 font-normal" value={dineInClose} onChange={(e) => setDineInClose(e.target.value)} /></label>
                <label className="space-y-2 text-sm font-bold">Tax Rate<input className="w-full rounded-2xl border border-stone-200 px-4 py-2 font-normal" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} /></label>
                <label className="space-y-2 text-sm font-bold">Service Fee<input className="w-full rounded-2xl border border-stone-200 px-4 py-2 font-normal" value={serviceFee} onChange={(e) => setServiceFee(e.target.value)} /></label>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={pickupEnabled} onChange={(e) => setPickupEnabled(e.target.checked)} /> Pickup enabled</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={dineInEnabled} onChange={(e) => setDineInEnabled(e.target.checked)} /> Dine-in enabled</label>
              </div>
            </CardShell>

            <CardShell className="p-6 xl:col-span-2">
              <h2 className="text-xl font-black text-stone-900">📸 Menu Pricing & Food Images</h2>
              <div className="mt-4 space-y-3">
                {menu.map((item) => (
                  <div key={item.id} className="grid gap-3 rounded-2xl border border-stone-200 p-3 md:grid-cols-[1fr_120px_120px_1.4fr]">
                    <div>
                      <div className="font-bold">{item.name}</div>
                      <div className="text-sm text-stone-500">{item.category}</div>
                    </div>
                    <input className="rounded-2xl border border-stone-200 px-4 py-2" value={item.price} onChange={(e) => setMenu((prev) => prev.map((x) => x.id === item.id ? { ...x, price: Number(e.target.value || 0) } : x))} />
                    <AppButton variant={item.available ? "secondary" : "ghost"} onClick={() => setMenu((prev) => prev.map((x) => x.id === item.id ? { ...x, available: !x.available } : x))}>{item.available ? "Available" : "Hidden"}</AppButton>
                    <input className="rounded-2xl border border-stone-200 px-4 py-2" value={item.image} onChange={(e) => setMenu((prev) => prev.map((x) => x.id === item.id ? { ...x, image: e.target.value } : x))} placeholder="Food image URL or placeholder key" />
                  </div>
                ))}
              </div>
            </CardShell>
          </section>
        )}

        {activeTab === "kds" && (
          <section className="rounded-3xl bg-stone-950 p-6 text-white">
            <h2 className="text-2xl font-black">👨‍🍳 Kitchen Display Screen</h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {sampleOrders.map((order) => (
                <div key={order.id} className="space-y-4 rounded-3xl border border-stone-800 bg-stone-900 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-bold">{order.type === "pickup" ? `Pickup ${order.id}` : `Table ${order.table}`}</div>
                      <div className="text-sm text-stone-400">{order.type === "pickup" ? `Pickup time: ${order.pickupTime}` : "Dine-in order"}</div>
                    </div>
                    <div className="space-y-2 text-right text-xs">
                      <div className="rounded-full bg-white px-3 py-1 font-bold text-stone-900">{order.status}</div>
                      <div className="rounded-full bg-white px-3 py-1 font-bold text-stone-900">{order.payment}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={`${item.name}-${index}`} className="flex justify-between rounded-2xl bg-stone-800 px-3 py-2">
                        <span>{item.name}</span>
                        <strong>x{item.qty}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-black">${order.total.toFixed(2)}</div>
                    <div className="flex gap-2">
                      <AppButton variant="secondary">Fire</AppButton>
                      <AppButton>Ready</AppButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "tests" && (
          <CardShell className="p-6">
            <h2 className="text-xl font-black text-stone-900">Build-Safe Self Tests</h2>
            <div className="mt-4 space-y-3">
              {selfTests.map((test) => (
                <div key={test.name} className="flex items-center justify-between rounded-2xl border border-stone-200 p-3">
                  <span className="text-sm text-stone-700">{test.name}</span>
                  <Badge className={test.passed ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}>{test.passed ? "Passed" : "Failed"}</Badge>
                </div>
              ))}
            </div>
          </CardShell>
        )}
      </div>
    </div>
  );
}
