chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "verify-dpv-image",
    title: "Verify Image with DPV.AI",
    contexts: ["image"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "verify-dpv-image") {
    const imageUrl = info.srcUrl;

    chrome.notifications.create({
      type: "basic",
      iconUrl: imageUrl,
      title: "DPV.AI Engine",
      message: "Downloading and analyzing image... Please wait."
    });

    try {
      // 1. Get the user's JWT token
      const { token } = await chrome.storage.local.get("token");
      if (!token) throw new Error("Please open the DPV extension and paste your login token first!");

      // 2. Download the image from the web
      const imageRes = await fetch(imageUrl);
      const blob = await imageRes.blob();

      // 3. Package it for the backend (just like our React app!)
      const formData = new FormData();
      formData.append("image", blob, "extension-upload.jpg");

      // 4. Send to Node.js server
      const apiRes = await fetch("http://localhost:5000/api/v1/verify", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }, // Bouncer pass! NO Content-Type here.
        body: formData
      });

      const data = await apiRes.json();
      if (!data.success) throw new Error(data.message || "Verification failed");

      // 5. Save the result so the popup can show it
      await chrome.storage.local.set({ latestResult: data.data, latestImage: imageUrl });

      // 6. Tell the user it's done!
      chrome.notifications.create({
        type: "basic",
        iconUrl: imageUrl,
        title: "✅ DPV.AI Verification Complete",
        message: `Verdict: ${data.data.overall_verdict}. Click the extension puzzle piece to view the full report!`
      });

    } catch (err) {
      console.error(err);
      chrome.notifications.create({
        type: "basic",
        iconUrl: imageUrl,
        title: "❌ DPV.AI Error",
        message: err.message
      });
    }
  }
});