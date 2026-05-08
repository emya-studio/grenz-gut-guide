import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Menu, X, ShoppingCart, Leaf, Activity, Droplets, Sparkles,
  HelpCircle, ChevronDown, Star, Play, Phone, Instagram, Send,
  MessageCircle, ShieldCheck, Lock, Check, ArrowLeft,
} from "lucide-react";
import heroImg from "@/assets/grenz-hero.jpg";
import productImg from "@/assets/product.jpg";
import video1 from "@/assets/video1.jpg";
import video2 from "@/assets/video2.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Grenz | دمنوش آرامش گوارشی" },
      { name: "description", content: "Grenz؛ دمنوش سلامت‌محور برای همراهی در روتین آرامش گوارشی. راهنمای انتخاب محصول مناسب بر اساس وضعیت گوارشی شما." },
    ],
  }),
});

type ConditionKey = "crohn" | "uc" | "ibsd" | "ibscm" | "daily";

const PRODUCTS: Record<ConditionKey, { name: string; tagline: string; bullets: string[]; price: string }> = {
  crohn:  { name: "Grenz Crohn Calm",      tagline: "همراه روتین آرامش برای حساسیت‌های گوارشی پیچیده", bullets: ["ترکیب گیاهی ملایم", "بدون افزودنی شیمیایی", "مناسب مصرف روزانه"], price: "۲۸۵٬۰۰۰ تومان" },
  uc:     { name: "Grenz UC Balance",      tagline: "دمنوش متعادل‌کننده برای سبک زندگی آرام‌تر",     bullets: ["گیاهان منتخب آرام‌بخش", "بسته‌بندی بهداشتی", "طعم ملایم"], price: "۲۹۵٬۰۰۰ تومان" },
  ibsd:   { name: "Grenz IBS-D Comfort",   tagline: "همراه آرامش برای روزهای حساس روده",             bullets: ["ترکیب ملایم گوارشی", "کمک به حس راحتی", "مصرف ساده"], price: "۲۶۵٬۰۰۰ تومان" },
  ibscm:  { name: "Grenz IBS-C/M Relief",  tagline: "همراه روزانه برای الگوی ترکیبی یا یبوست",       bullets: ["گیاهان فیبرمحور", "حس سبکی روزانه", "بدون شیرینی افزوده"], price: "۲۶۵٬۰۰۰ تومان" },
  daily:  { name: "Grenz Daily Gut Calm",  tagline: "دمنوش روزانه برای آرامش عمومی گوارش",           bullets: ["مناسب مصرف هر روز", "ملایم و بی‌خطر برای روتین", "طعم لطیف"], price: "۲۴۵٬۰۰۰ تومان" },
};

const CONDITION_CARDS: { key: ConditionKey; title: string; line: string; Icon: any }[] = [
  { key: "crohn", title: "کرون (Crohn)", line: "همراه روتین برای حساسیت‌های گوارشی مزمن", Icon: Activity },
  { key: "uc",    title: "کولیت اولسراتیو (UC)", line: "همراهی در سبک زندگی آرام‌تر گوارشی", Icon: ShieldCheck },
  { key: "ibsd",  title: "IBS-D (اسهال غالب)",  line: "روزهای حساس روده با الگوی اسهال", Icon: Droplets },
  { key: "ibscm", title: "IBS-C / IBS-M",       line: "یبوست یا الگوی ترکیبی روده", Icon: Leaf },
];

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<ConditionKey | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [cart, setCart] = useState<ConditionKey[]>([]);
  const productSectionRef = useRef<HTMLDivElement>(null);
  const guideSectionRef = useRef<HTMLDivElement>(null);

  const isUnlocked = !!selectedCondition;
  const recommended = selectedCondition ? PRODUCTS[selectedCondition] : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToGuide = () => guideSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToProduct = () => productSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const pickCondition = (key: ConditionKey) => {
    setSelectedCondition(key);
    setShowQuestionnaire(false);
    setTimeout(scrollToProduct, 250);
  };

  // Map questionnaire answers -> condition
  const computeFromAnswers = (a: Record<number, string>): ConditionKey => {
    if (a[2]?.includes("کرون")) return "crohn";
    if (a[2]?.includes("کولیت")) return "uc";
    if (a[2]?.includes("IBD")) return "daily";
    if (a[1] === "بیشتر اسهال" || a[3]?.includes("اسهال مکرر")) return "ibsd";
    if (a[1] === "بیشتر یبوست" || a[1] === "ترکیبی از اسهال و یبوست" || a[3]?.includes("یبوست")) return "ibscm";
    return "daily";
  };

  const submitQuestionnaire = () => {
    const valid = /^09\d{9}$/.test(phone.trim());
    if (!valid) { setPhoneError("لطفا شماره تماس معتبر وارد کنید."); return; }
    setPhoneError("");
    const cond = computeFromAnswers(answers);
    setSelectedCondition(cond);
    toast.success("نتیجه شما آماده شد");
    setTimeout(scrollToProduct, 300);
  };

  const addToCart = (key: ConditionKey) => {
    setCart((c) => [...c, key]);
    toast.success("محصول پیشنهادی به سبد خرید اضافه شد.");
  };

  const buyNow = () => toast("در مرحله بعد به صفحه پرداخت متصل می‌شود.");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        scrolled={scrolled}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        cartCount={cart.length}
      />

      {/* HERO */}
      <section className="bg-gradient-hero pt-24 pb-12 px-5">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-7 w-full max-w-sm aspect-square rounded-3xl bg-white shadow-soft overflow-hidden flex items-center justify-center">
            <img src={heroImg} alt="بسته‌بندی دمنوش Grenz" width={1024} height={1024} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-snug text-primary-deep">
            Grenz؛ دمنوش آرامش گوارشی برای روزهای حساس
          </h1>
          <p className="mt-5 text-base sm:text-lg leading-8 text-muted-foreground">
            Grenz یک دمنوش سلامت‌محور برای افرادی است که به دنبال آرامش بیشتر در روتین گوارشی خود هستند.
            با تجربه‌ای ساده، طبیعی و قابل اعتماد، به شما کمک می‌کند انتخاب مناسب‌تری برای شرایط بدنی خود داشته باشید.
            ابتدا وضعیت گوارشی خود را انتخاب کنید تا محصول پیشنهادی مخصوص شما نمایش داده شود.
          </p>
          <button
            onClick={scrollToGuide}
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-7 py-4 text-white font-bold shadow-soft transition active:scale-[.98] hover:opacity-95"
          >
            شروع راهنمای انتخاب
            <ArrowLeft className="w-5 h-5" />
          </button>
          <p className="mt-4 text-xs text-muted-foreground">
            بدون ادعای درمانی؛ انتخاب آگاهانه بر اساس اطلاعات شما
          </p>
        </div>
      </section>

      {/* INTERACTIVE GUIDE */}
      <section id="guide" ref={guideSectionRef} className="px-5 py-14 bg-white">
        <div className="mx-auto max-w-4xl">
          <SectionTitle
            kicker="راهنمای انتخاب"
            title="راهنمای سریع انتخاب دمنوش مناسب شما"
            desc="برای نمایش محصول پیشنهادی، ابتدا وضعیت گوارشی خود را انتخاب کنید. اگر مطمئن نیستید، گزینه «نمی‌دانم» را بزنید و به چند سوال کوتاه پاسخ دهید."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {CONDITION_CARDS.map(({ key, title, line, Icon }) => {
              const active = selectedCondition === key;
              return (
                <button
                  key={key}
                  onClick={() => pickCondition(key)}
                  className={`text-right rounded-2xl border p-5 transition shadow-card hover:shadow-soft hover:-translate-y-0.5 ${
                    active ? "border-primary bg-secondary" : "border-border bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-secondary text-primary-deep flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </span>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">{title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-6">{line}</p>
                    </div>
                    {active && <Check className="w-5 h-5 text-primary" />}
                  </div>
                  <span className="mt-4 block w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold">
                    انتخاب این وضعیت
                  </span>
                </button>
              );
            })}
          </div>

          {/* I don't know */}
          <div className="mt-5">
            <button
              onClick={() => { setShowQuestionnaire((v) => !v); }}
              className="w-full rounded-2xl border border-dashed border-primary/40 bg-accent/40 px-5 py-4 text-primary-deep font-semibold flex items-center justify-between"
            >
              <span className="flex items-center gap-2"><HelpCircle className="w-5 h-5" /> نمی‌دانم — به من کمک کن</span>
              <ChevronDown className={`w-5 h-5 transition ${showQuestionnaire ? "rotate-180" : ""}`} />
            </button>

            {showQuestionnaire && (
              <Questionnaire
                step={step} setStep={setStep}
                answers={answers} setAnswers={setAnswers}
                phone={phone} setPhone={setPhone}
                phoneError={phoneError}
                onSubmit={submitQuestionnaire}
              />
            )}
          </div>

          {/* Credibility block */}
          <div className="mt-10 rounded-2xl border border-border bg-secondary/60 p-6">
            <h4 className="font-bold text-primary-deep flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> انتخاب آگاهانه، نه تشخیص پزشکی
            </h4>
            <p className="text-sm text-muted-foreground mt-2 leading-7">
              Grenz تلاش می‌کند به شما کمک کند بر اساس اطلاعاتی که از وضعیت گوارشی خود وارد می‌کنید، محصول مناسب‌تری را انتخاب کنید. این راهنما جایگزین تشخیص پزشک نیست.
            </p>
            <ul className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
              <li className="rounded-xl bg-white border border-border p-3">مشورت با پزشک در صورت مصرف دارو یا داشتن بیماری زمینه‌ای</li>
              <li className="rounded-xl bg-white border border-border p-3">پرهیز از ادعاهای درمانی</li>
              <li className="rounded-xl bg-white border border-border p-3">تفاوت تجربه مصرف در افراد مختلف</li>
            </ul>
          </div>
        </div>
      </section>

      {/* LOCKED WRAPPER FOR REST */}
      <div className="relative">
        {!isUnlocked && (
          <div className="absolute inset-0 z-20 flex items-start justify-center pt-16 px-5 pointer-events-none">
            <div className="rounded-2xl bg-white border border-border shadow-soft px-5 py-4 max-w-md text-center pointer-events-auto">
              <Lock className="w-5 h-5 mx-auto text-primary-deep" />
              <p className="mt-2 text-sm text-foreground">
                برای مشاهده محصولات و ادامه صفحه، ابتدا وضعیت گوارشی خود را انتخاب کنید.
              </p>
              <button onClick={scrollToGuide} className="mt-3 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold">
                رفتن به راهنما
              </button>
            </div>
          </div>
        )}

        <div className={isUnlocked ? "" : "locked-blur"}>
          {/* PRODUCT */}
          <section id="products" ref={productSectionRef} className="px-5 py-14 bg-secondary/40">
            <div className="mx-auto max-w-4xl">
              <SectionTitle kicker="پیشنهاد شخصی" title="محصول پیشنهادی شما"
                desc={recommended ? "بر اساس انتخاب شما، این دمنوش برای همراهی با روتین گوارشی‌تان پیشنهاد می‌شود." : "پس از انتخاب وضعیت، محصول پیشنهادی شما اینجا نمایش داده می‌شود."} />

              {recommended && (
                <div className="mt-8 rounded-3xl bg-white border border-border shadow-soft overflow-hidden fade-in">
                  <div className="grid md:grid-cols-2">
                    <div className="bg-secondary/60 p-6 flex items-center justify-center">
                      <img src={productImg} alt={recommended.name} loading="lazy" width={768} height={768}
                        className="w-full max-w-xs aspect-square object-cover rounded-2xl" />
                    </div>
                    <div className="p-6 sm:p-8">
                      <span className="inline-block text-xs rounded-full bg-secondary text-primary-deep px-3 py-1">پیشنهاد ویژه شما</span>
                      <h3 className="mt-3 text-2xl font-extrabold text-primary-deep">{recommended.name}</h3>
                      <p className="text-muted-foreground mt-2 leading-7">{recommended.tagline}</p>
                      <ul className="mt-4 space-y-2">
                        {recommended.bullets.map((b) => (
                          <li key={b} className="flex items-center gap-2 text-sm text-foreground">
                            <Check className="w-4 h-4 text-calm" /> {b}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-lg font-bold text-foreground">{recommended.price}</span>
                        <QuantitySelector />
                      </div>
                      <div className="mt-5 flex flex-col sm:flex-row gap-3">
                        <button onClick={() => addToCart(selectedCondition!)}
                          className="flex-1 rounded-2xl bg-gradient-primary text-white font-bold py-3 shadow-soft active:scale-[.98]">
                          افزودن به سبد خرید
                        </button>
                        <button onClick={buyNow}
                          className="flex-1 rounded-2xl bg-white border border-primary text-primary-deep font-bold py-3">
                          خرید فوری
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Carousel of other products */}
              <div className="mt-10">
                <h4 className="font-bold text-primary-deep mb-3">سایر محصولات Grenz</h4>
                <div className="flex gap-4 overflow-x-auto pb-3 -mx-5 px-5 snap-x">
                  {(Object.keys(PRODUCTS) as ConditionKey[]).map((key) => {
                    const p = PRODUCTS[key];
                    const enabled = key === selectedCondition;
                    return (
                      <div key={key} className={`snap-start flex-shrink-0 w-64 rounded-2xl border bg-white p-4 ${enabled ? "border-primary shadow-card" : "border-border opacity-70"}`}>
                        <img src={productImg} alt={p.name} loading="lazy" width={400} height={400}
                          className="w-full aspect-square object-cover rounded-xl" />
                        <h5 className="mt-3 font-bold text-foreground text-sm">{p.name}</h5>
                        <p className="text-xs text-muted-foreground mt-1 leading-5">{p.tagline}</p>
                        {enabled ? (
                          <button onClick={() => addToCart(key)} className="mt-3 w-full rounded-xl bg-primary text-primary-foreground py-2 text-sm font-semibold">
                            افزودن به سبد
                          </button>
                        ) : (
                          <p className="mt-3 text-[11px] text-muted-foreground bg-secondary rounded-lg p-2 text-center">
                            برای خرید این محصول، ابتدا وضعیت مرتبط را انتخاب کنید
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ANYAR */}
          <AnyarSection v1={video1} v2={video2} />

          {/* FAQ */}
          <FAQSection />

          {/* TESTIMONIALS */}
          <Testimonials />
        </div>
      </div>

      <Footer />

      {/* Sticky bottom CTA */}
      <StickyCTA
        unlocked={isUnlocked}
        onPick={scrollToGuide}
        onBuy={() => { if (selectedCondition) addToCart(selectedCondition); scrollToProduct(); }}
      />
      <div className="h-24" />
    </div>
  );
}

/* ---------- subcomponents ---------- */

function SectionTitle({ kicker, title, desc }: { kicker: string; title: string; desc: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <span className="text-xs font-semibold tracking-wider text-primary uppercase">{kicker}</span>
      <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-primary-deep">{title}</h2>
      <p className="mt-3 text-muted-foreground leading-7">{desc}</p>
    </div>
  );
}

function Header({ scrolled, menuOpen, setMenuOpen, cartCount }: any) {
  const links = [
    ["خانه", "#top"], ["راهنمای انتخاب", "#guide"], ["محصولات", "#products"],
    ["آن‌یار", "#anyar"], ["سوالات متداول", "#faq"], ["رضایت مشتریان", "#reviews"], ["تماس با ما", "#footer"],
  ];
  return (
    <header id="top" className={`fixed top-0 inset-x-0 z-40 transition ${scrolled ? "bg-white/85 backdrop-blur shadow-card" : "bg-white/60 backdrop-blur-sm"}`}>
      <div className="mx-auto max-w-5xl flex items-center justify-between px-5 h-16">
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-secondary" aria-label="منو">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <a href="#top" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-gradient-primary text-white flex items-center justify-center font-extrabold">G</span>
          <span className="font-extrabold text-primary-deep tracking-tight">Grenz</span>
        </a>
        <a href="#products" className="relative p-2 rounded-lg hover:bg-secondary" aria-label="سبد خرید">
          <ShoppingCart className="w-6 h-6 text-primary-deep" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -left-1 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </a>
      </div>
      {menuOpen && (
        <nav className="bg-white border-t border-border">
          <ul className="mx-auto max-w-5xl px-5 py-3 grid gap-1">
            {links.map(([t, h]) => (
              <li key={h}>
                <a href={h} onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-secondary text-foreground">
                  {t}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function QuantitySelector() {
  const [q, setQ] = useState(1);
  return (
    <div className="flex items-center rounded-xl border border-border overflow-hidden">
      <button onClick={() => setQ((x) => Math.max(1, x - 1))} className="px-3 py-2 hover:bg-secondary">−</button>
      <span className="px-4 font-semibold">{q}</span>
      <button onClick={() => setQ((x) => x + 1)} className="px-3 py-2 hover:bg-secondary">+</button>
    </div>
  );
}

const QUESTIONS = [
  { q: "الگوی اصلی دفع شما در بیشتر روزها چگونه است؟", opts: ["بیشتر اسهال", "بیشتر یبوست", "ترکیبی از اسهال و یبوست", "نرمال ولی همراه با درد یا نفخ"] },
  { q: "آیا پزشک قبلا برای شما IBD، کرون یا کولیت تشخیص داده است؟", opts: ["بله، کرون", "بله، کولیت اولسراتیو", "بله، IBD ولی نوع دقیق را نمی‌دانم", "خیر / مطمئن نیستم"] },
  { q: "کدام مورد بیشتر با تجربه شما نزدیک است؟", opts: ["درد شکمی و اسهال مکرر", "یبوست و نفخ", "تغییرات متناوب بین اسهال و یبوست", "التهاب یا بیماری گوارشی تاییدشده توسط پزشک"] },
  { q: "هدف اصلی شما از استفاده از دمنوش چیست؟", opts: ["آرامش گوارشی روزانه", "کاهش حس نفخ و سنگینی", "همراهی با رژیم مراقبت گوارشی", "انتخاب محصول مناسب‌تر بر اساس شرایطم"] },
];

function Questionnaire({ step, setStep, answers, setAnswers, phone, setPhone, phoneError, onSubmit }: any) {
  const total = 5;
  const isQuestionStep = step <= 4;
  const current = QUESTIONS[step - 1];
  const canNext = isQuestionStep ? !!answers[step] : true;
  return (
    <div className="mt-4 rounded-2xl border border-border bg-white p-5 shadow-card fade-in">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground">گام {step} از {total}</span>
        <div className="flex-1 mx-3 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-gradient-primary transition-all" style={{ width: `${(step / total) * 100}%` }} />
        </div>
      </div>

      {isQuestionStep ? (
        <div>
          <h4 className="font-bold text-foreground">{current.q}</h4>
          <div className="mt-3 grid gap-2">
            {current.opts.map((o) => {
              const selected = answers[step] === o;
              return (
                <button key={o}
                  onClick={() => setAnswers({ ...answers, [step]: o })}
                  className={`text-right rounded-xl border px-4 py-3 transition ${selected ? "border-primary bg-secondary text-primary-deep font-semibold" : "border-border hover:bg-secondary/60"}`}>
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <label className="font-bold text-foreground block">برای دریافت نتیجه و مشاوره انتخاب محصول، شماره تماس خود را وارد کنید.</label>
          <input
            value={phone} onChange={(e) => setPhone(e.target.value)}
            inputMode="tel" placeholder="مثلا 09123456789"
            className="mt-3 w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary text-left ltr"
            dir="ltr"
          />
          {phoneError && <p className="mt-2 text-sm text-destructive">{phoneError}</p>}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="rounded-xl px-4 py-2.5 text-sm border border-border disabled:opacity-40">
          مرحله قبل
        </button>
        {step < total ? (
          <button
            onClick={() => canNext && setStep(step + 1)}
            disabled={!canNext}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-gradient-primary text-white disabled:opacity-50">
            مرحله بعد
          </button>
        ) : (
          <button onClick={onSubmit} className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-gradient-primary text-white">
            نمایش نتیجه و محصول پیشنهادی
          </button>
        )}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        این نتیجه تشخیص پزشکی نیست و فقط برای انتخاب محصول مناسب‌تر در سایت Grenz استفاده می‌شود.
      </p>
    </div>
  );
}

function AnyarSection({ v1, v2 }: { v1: string; v2: string }) {
  const videos = [
    { thumb: v1, title: "چطور علائم گوارشی خود را بهتر بشناسیم؟", desc: "نکاتی ساده برای شناخت بهتر سبک زندگی گوارشی." },
    { thumb: v2, title: "اشتباهات رایج در مصرف دمنوش‌ها و مکمل‌های گیاهی", desc: "آنچه باید پیش از مصرف بدانید." },
  ];
  return (
    <section id="anyar" className="px-5 py-14 bg-white">
      <div className="mx-auto max-w-4xl">
        <SectionTitle kicker="آن‌یار" title="آن‌یار؛ همراه آگاهی و مراقبت گوارشی"
          desc="در این بخش می‌توانید محتوای آموزشی کوتاه درباره سبک زندگی، تغذیه و آرامش گوارشی مشاهده کنید." />
        <div className="mt-8 grid md:grid-cols-2 gap-5">
          {videos.map((v) => <VideoCard key={v.title} {...v} />)}
        </div>
      </div>
    </section>
  );
}

function VideoCard({ thumb, title, desc }: { thumb: string; title: string; desc: string }) {
  const [play, setPlay] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-white shadow-card">
      <div className="relative aspect-video bg-secondary">
        {play ? (
          <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" title={title}
            className="w-full h-full" allow="autoplay; encrypted-media" loading="lazy" />
        ) : (
          <button onClick={() => setPlay(true)} className="group w-full h-full block">
            <img src={thumb} alt={title} loading="lazy" className="w-full h-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition">
              <span className="w-16 h-16 rounded-full bg-white/95 text-primary-deep flex items-center justify-center shadow-soft">
                <Play className="w-7 h-7 mr-1" />
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="p-4">
        <h5 className="font-bold text-foreground">{title}</h5>
        <p className="text-sm text-muted-foreground mt-1 leading-6">{desc}</p>
      </div>
    </div>
  );
}

const FAQS = [
  { q: "Grenz چه زمانی اثر خود را نشان می‌دهد؟", a: "تجربه افراد متفاوت است. Grenz با هدف همراهی در روتین آرامش گوارشی طراحی شده و زمان احساس تغییر می‌تواند بسته به سبک زندگی، تغذیه و شرایط بدن متفاوت باشد." },
  { q: "آیا Grenz تداخل دارویی دارد؟", a: "اگر دارو مصرف می‌کنید، بیماری زمینه‌ای دارید، باردار هستید یا تحت درمان پزشک هستید، قبل از مصرف هر دمنوش یا محصول گیاهی با پزشک یا داروساز مشورت کنید." },
  { q: "آیا Grenz عوارض دارد؟", a: "ترکیبات گیاهی نیز ممکن است برای برخی افراد حساسیت یا ناسازگاری ایجاد کنند. در صورت بروز واکنش غیرعادی، مصرف را قطع کرده و با پزشک مشورت کنید." },
  { q: "Grenz مناسب چه افرادی نیست؟", a: "افراد باردار یا شیرده، کودکان، افراد دارای بیماری زمینه‌ای جدی، کسانی که داروهای خاص مصرف می‌کنند، یا افراد دارای حساسیت به ترکیبات گیاهی باید قبل از مصرف با پزشک مشورت کنند." },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="px-5 py-14 bg-secondary/40">
      <div className="mx-auto max-w-3xl">
        <SectionTitle kicker="پرسش و پاسخ" title="سوالات متداول" desc="پاسخ سوالات رایج درباره Grenz و مصرف آن." />
        <div className="mt-8 space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className="rounded-2xl bg-white border border-border overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-3 p-4 text-right">
                <span className="font-semibold text-foreground">{f.q}</span>
                <ChevronDown className={`w-5 h-5 text-primary-deep transition ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <div className="px-4 pb-5 text-sm text-muted-foreground leading-7">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  { name: "نگار، تهران", rating: 5, text: "بعد از چند روز استفاده، حس آرامش بیشتری در روتین گوارشی‌ام داشتم." },
  { name: "علی، اصفهان", rating: 5, text: "بسته‌بندی، طعم و راهنمای انتخاب محصول برایم قابل اعتماد بود." },
  { name: "مریم، مشهد", rating: 4, text: "برای انتخاب محصول مناسب، راهنمای سایت خیلی کمکم کرد." },
];

function Testimonials() {
  return (
    <section id="reviews" className="px-5 py-14 bg-white">
      <div className="mx-auto max-w-5xl">
        <SectionTitle kicker="رضایت مشتریان" title="تجربه مصرف‌کنندگان Grenz" desc="بخشی از بازخوردهای واقعی کاربران ما." />
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-white p-5 shadow-card">
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < t.rating ? "fill-primary" : "opacity-30"}`} />
                ))}
              </div>
              <p className="mt-3 text-foreground leading-7">«{t.text}»</p>
              <p className="mt-3 text-sm text-muted-foreground">{t.name}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs text-muted-foreground text-center">
          تجربه مصرف‌کنندگان ممکن است برای هر فرد متفاوت باشد.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="footer" className="bg-primary-deep text-white px-5 py-12 mt-4">
      <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-white text-primary-deep flex items-center justify-center font-extrabold">G</span>
            <span className="font-extrabold tracking-tight">Grenz</span>
          </div>
          <p className="mt-3 text-sm text-white/80 leading-7">
            Grenz یک برند سلامت‌محور در حوزه دمنوش‌های گیاهی است که با تمرکز بر سادگی، آرامش و انتخاب آگاهانه طراحی شده است.
          </p>
          <p className="mt-4 text-sm flex items-center gap-2"><Phone className="w-4 h-4" /> پشتیبانی: ۰۲۱-۰۰۰۰۰۰۰۰</p>
          <div className="mt-3 flex gap-3">
            <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20"><Send className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20"><MessageCircle className="w-4 h-4" /></a>
          </div>
        </div>
        <div>
          <h5 className="font-bold mb-3">دسترسی سریع</h5>
          <ul className="space-y-2 text-sm text-white/80">
            <li><a href="#top" className="hover:text-white">خانه</a></li>
            <li><a href="#" className="hover:text-white">درباره ما</a></li>
            <li><a href="#footer" className="hover:text-white">تماس با ما</a></li>
            <li><a href="#products" className="hover:text-white">محصولات</a></li>
            <li><a href="#guide" className="hover:text-white">بیماری‌ها</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold mb-3">سلب مسئولیت پزشکی</h5>
          <p className="text-xs text-white/70 leading-6">
            مطالب این سایت جایگزین تشخیص، درمان یا توصیه پزشک نیست. محصولات Grenz با هدف همراهی در سبک زندگی سالم طراحی شده‌اند و ادعای تشخیص، درمان یا پیشگیری از بیماری ندارند.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-5xl mt-8 pt-5 border-t border-white/10 text-xs text-white/60 text-center">
        © {new Date().getFullYear()} Grenz. تمامی حقوق محفوظ است.
      </div>
    </footer>
  );
}

function StickyCTA({ unlocked, onPick, onBuy }: { unlocked: boolean; onPick: () => void; onBuy: () => void }) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 px-3 pb-3">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white/95 backdrop-blur shadow-soft border border-border p-3 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-primary-deep flex-shrink-0" />
        <p className="flex-1 text-xs sm:text-sm text-foreground leading-5">
          {unlocked ? "محصول پیشنهادی شما آماده است" : "برای مشاهده محصول پیشنهادی، ابتدا وضعیت گوارشی خود را انتخاب کنید"}
        </p>
        {unlocked ? (
          <button onClick={onBuy} className="rounded-xl bg-gradient-primary text-white text-sm font-bold px-4 py-2.5 active:scale-[.98]">
            افزودن به سبد خرید
          </button>
        ) : (
          <button onClick={onPick} className="rounded-xl bg-gradient-primary text-white text-sm font-bold px-4 py-2.5 active:scale-[.98]">
            شروع انتخاب
          </button>
        )}
      </div>
    </div>
  );
}
