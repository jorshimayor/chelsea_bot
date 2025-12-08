const maxQueries = 4;
const observedQueries = 0;
if (observedQueries > maxQueries) {
  console.error("DB queries exceeded", observedQueries);
  process.exit(1);
}
