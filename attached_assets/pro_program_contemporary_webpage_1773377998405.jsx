export default function ProProgramPage() {
  const sections = [
    {
      eyebrow: "Profit Visibility",
      title: "See what each job can really earn you",
      body:
        "At your appointment, we’ll break down contractor pricing in plain English so you can see how margins are protected and where more profit can come from.",
      bullets: ["Trade pricing", "Job-lot discounts", "Transparent margins"],
    },
    {
      eyebrow: "Rebate Opportunity",
      title: "Turn purchasing volume into money back",
      body:
        "Many contractors focus on price and overlook what rebates can return over time. We’ll show you how the rebate structure works and what that can mean for your business.",
      bullets: ["Tiered rebates", "Annual payout", "No minimum to start"],
    },
    {
      eyebrow: "Portal Access",
      title: "Manage your account without the back-and-forth",
      body:
        "See how the PRO portal gives you 24/7 access to pricing, invoices, order history, and tracking so you can spend less time chasing information.",
      bullets: ["Online ordering", "Order tracking", "Account dashboard"],
    },
    {
      eyebrow: "Service Advantage",
      title: "Deliver a better experience for your customer",
      body:
        "From job-site delivery to showroom support for homeowners, our team works like an extension of yours. Your client gets a premium experience, and you stay in the driver’s seat.",
      bullets: ["Job-site delivery", "Showroom for your clients", "Dedicated account rep"],
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600">
                Appointment confirmed
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl md:leading-[1.02]">
                This is the meeting that shows you what the <span className="text-amber-700">PROgram</span> is actually worth.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600 md:text-xl">
                In just 20 minutes, you’ll see the pricing, rebates, tools, and service advantages that can help you protect margin, simplify ordering, and look stronger in front of your customers.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "See the numbers clearly",
                  "Understand the rebate opportunity",
                  "Leave with practical takeaways",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-stone-300 bg-stone-100 px-4 py-2 text-sm text-stone-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-stone-200 bg-stone-900 p-6 text-white shadow-2xl shadow-stone-300/40">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-7 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.22em] text-white/55">Why keep this appointment</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight">
                  Most contractors walk away seeing value they didn’t know they were missing.
                </h2>
                <div className="mt-8 space-y-4">
                  {[
                    "How contractor pricing affects your bottom line",
                    "How volume rebates can add up over time",
                    "How our team supports both you and your customer",
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-white/85">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-8 rounded-2xl bg-amber-600 px-5 py-4 text-base font-medium text-white">
                  Just 20 minutes. Big impact.
                </div>
                <p className="mt-4 text-sm text-white/60">We’re looking forward to meeting with you, John.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">What you’ll cover</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            A quick meeting with real business upside.
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone-600">
            This is not a generic overview. It’s a focused walkthrough of the pieces that can directly impact your profit, process, and customer experience.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-lg shadow-stone-200/50 transition hover:-translate-y-1"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
                {section.eyebrow}
              </p>
              <h3 className="mt-4 text-2xl font-semibold leading-tight">{section.title}</h3>
              <p className="mt-4 text-base leading-7 text-stone-600">{section.body}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {section.bullets.map((bullet) => (
                  <span
                    key={bullet}
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700"
                  >
                    {bullet}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-stone-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 md:flex-row md:items-center md:justify-between md:px-10">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.22em] text-white/50">Final reminder</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              You already booked the time. Show up and see what’s possible.
            </h3>
            <p className="mt-4 text-lg leading-8 text-white/70">
              Better margins, rebate potential, easier account management, and stronger contractor support all start with this conversation.
            </p>
          </div>
          <button className="rounded-2xl bg-amber-600 px-7 py-4 text-base font-semibold text-white transition hover:scale-[1.02]">
            I’ll Be There
          </button>
        </div>
      </section>
    </div>
  );
}
