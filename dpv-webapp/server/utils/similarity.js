exports.computeSimilarityScore = (phashDistance, dhashDistance) => {
  const MAX_DISTANCE = 64;

  const pSim = 1 - phashDistance / MAX_DISTANCE;
  const dSim = 1 - dhashDistance / MAX_DISTANCE;

  const avgSimilarity = (pSim + dSim) / 2;

  return Math.round(avgSimilarity * 100); // 0–100
};
