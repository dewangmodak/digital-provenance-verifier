document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load saved token on startup
  const { token } = await chrome.storage.local.get("token");
  if (token) document.getElementById('tokenInput').value = token;

  // 2. Save token button logic
  document.getElementById('saveTokenBtn').addEventListener('click', async () => {
    const inputToken = document.getElementById('tokenInput').value;
    await chrome.storage.local.set({ token: inputToken });
    const statusMsg = document.getElementById('tokenStatus');
    statusMsg.classList.remove('hidden');
    setTimeout(() => statusMsg.classList.add('hidden'), 2000);
  });

  // 3. Load the latest scan result if it exists
  const { latestResult, latestImage } = await chrome.storage.local.get(["latestResult", "latestImage"]);
  
  if (latestResult && latestImage) {
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('resultsArea').classList.remove('hidden');
    
    document.getElementById('scannedImage').src = latestImage;
    
    const isAi = latestResult.ai_detection.is_ai_generated;
    const aiBox = document.getElementById('aiStatusBox');
    const aiLabel = document.getElementById('aiLabel');
    
    if (isAi) {
      aiBox.className = "p-3 rounded-lg mb-3 border bg-red-50 border-red-100";
      aiLabel.className = "text-lg font-black tracking-tight text-red-600";
      aiLabel.innerText = "AI GENERATED";
    } else {
      aiBox.className = "p-3 rounded-lg mb-3 border bg-green-50 border-green-100";
      aiLabel.className = "text-lg font-black tracking-tight text-green-600";
      aiLabel.innerText = "HUMAN CREATED";
    }
    
    document.getElementById('aiScore').innerText = `Confidence: ${latestResult.ai_detection.confidence_score}`;
    document.getElementById('dbMatch').innerText = latestResult.overall_verdict;
  }
});