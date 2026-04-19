import { HOME_HOW_IT_WORKS_STEPS } from "~/lib/constants";

const HowItWorks = () => (
  <section
    id="how-it-works"
    className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
  >
    {/* Section header */}
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
        From idea to song in three steps
      </h2>

      <p className="text-muted-foreground mt-4 text-base leading-relaxed">
        No DAWs. No plugins. No learning curve.
      </p>
    </div>

    {/* Steps */}
    <div className="mx-auto mt-16 max-w-5xl">
      <div className="grid gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-10">
        {HOME_HOW_IT_WORKS_STEPS.map(({ number, icon: Icon, title, body }) => (
          <div key={number} className="group relative flex flex-col gap-5">
            {/* Decorative large number */}
            <div
              aria-hidden="true"
              style={{ fontSize: "6rem" }}
              className="text-primary/8 pointer-events-none absolute -top-4 -left-2 leading-none font-bold select-none"
            >
              {number}
            </div>

            {/* Icon circle */}
            <div className="border-border bg-card relative z-10 flex size-12 items-center justify-center rounded-xl border shadow-sm transition-shadow duration-200 group-hover:shadow-md">
              <Icon className="text-primary size-5" aria-hidden="true" />
            </div>

            {/* Text */}
            <div className="relative z-10">
              <h3 className="text-foreground text-base font-semibold">
                {title}
              </h3>

              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
