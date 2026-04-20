const apiBase = "http://localhost:4000";

async function runTests() {
  console.log("🚀 Starting API Verification...");

  try {
    // 1. Login
    const loginRes = await fetch(`${apiBase}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@demo.com", password: "Demo@1234" }),
    });

    if (!loginRes.ok) throw new Error("Login failed");
    const loginData = await loginRes.json();
    const token = loginData.data.tokens.accessToken;
    console.log("✅ Logged in successfully.");

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // 2. Test Costs with filters
    const startDate = "2026-04-01";
    const endDate = "2026-04-30";
    const costsRes = await fetch(`${apiBase}/api/v1/costs?startDate=${startDate}&endDate=${endDate}`, { headers });
    const costsData = await costsRes.json();
    console.log(`✅ Costs API: Found ${costsData.data.length} records for April.`);

    // 3. Test Earnings with filters
    const earningsRes = await fetch(`${apiBase}/api/v1/earnings?startDate=${startDate}&endDate=${endDate}`, { headers });
    const earningsData = await earningsRes.json();
    console.log(`✅ Earnings API: Found ${earningsData.data.length} records for April.`);

    // 4. Test Fleet P&L Report
    const pnlRes = await fetch(`${apiBase}/api/v1/reports/fleet-pnl?startDate=${startDate}&endDate=${endDate}`, { headers });
    const pnlData = await pnlRes.json();
    console.log(`✅ P&L Report: Found ${pnlData.data.cars.length} vehicles with data.`);
    console.log(`   Total Revenue: ₹${(Number(pnlData.data.totalRevenuePaise) / 100).toLocaleString()}`);
    console.log(`   Total Cost: ₹${(Number(pnlData.data.totalCostPaise) / 100).toLocaleString()}`);

    console.log("\n✨ API Testing Complete. Backend is stable.");

  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

runTests();
