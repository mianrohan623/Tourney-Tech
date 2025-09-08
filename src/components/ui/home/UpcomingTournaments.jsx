import { tournaments } from "@/constants/home/upcommingTournamentData";

export default function UpcomingTournaments() {
 

  return (
    <section
      id="upcoming"
      className="py-20"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Upcoming Tournaments</h2>
        <p className="mb-10 max-w-xl mx-auto" style={{ color: "#9CA3AF" }}>
          Join exciting tournaments and test your skills against top players. Don’t miss out!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {tournaments.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-xl shadow hover:shadow-lg transition"
              style={{ backgroundColor: "var(--card-background)" }}
            >
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--accent-color)" }}
              >
                {item.name}
              </h3>
              <p style={{ color: "#D1D5DB" }}>🎮 <strong>Game:</strong> {item.game}</p>
              <p style={{ color: "#D1D5DB" }}>👥 <strong>Type:</strong> {item.type}</p>
              <p className="mt-2" style={{ color: "#9CA3AF" }}>📅 {item.date}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
