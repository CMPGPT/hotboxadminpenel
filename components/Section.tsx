export function Section({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="card card-padding">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}


