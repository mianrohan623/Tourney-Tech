export const mapMatches = (rawMatches) => {
  return rawMatches.map((match) => {
    const mappedParticipants = match.participants.map((p) => ({
      ...p,
      resultText: p.id === match.winnerId ? "WON" : "LOST",
      isWinner: p.id === match.winnerId,
    }));

    return {
      ...match,
      state: match.winnerId ? "DONE" : "SCHEDULED",
      participants: mappedParticipants,
    };
  });
};
