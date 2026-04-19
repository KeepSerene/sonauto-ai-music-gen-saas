import { HOME_FEATURES } from "~/lib/constants";

const Features = () => (
  <section
    id="features"
    className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
  >
    {/* Subtle background glow */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
    >
      <div className="bg-accent/8 h-125 w-175 rounded-full blur-[140px]" />
    </div>

    {/* Section header */}
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
        Everything you need to create
      </h2>

      <p className="text-muted-foreground mt-4 text-base leading-relaxed">
        Built to get out of your way and let the music happen.
      </p>
    </div>

    {/* Feature grid */}
    <div className="mx-auto mt-16 max-w-5xl">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {HOME_FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="border-border/60 bg-card/60 hover:bg-card group flex flex-col gap-4 rounded-xl border p-6 backdrop-blur-sm transition-colors duration-200"
          >
            <div className="border-border bg-background flex size-10 items-center justify-center rounded-lg border">
              <Icon
                className="text-primary size-5 transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              />
            </div>

            <div>
              <h3 className="text-foreground text-sm font-semibold">{title}</h3>

              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
