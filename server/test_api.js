const axios = require("axios");
const http = require("http");
// Try to hit the endpoint locally for multiple drivers
async function test() {
  try {
    const loginRes = await new Promise((resolve, reject) => {
      const req = http.request(
        "http://127.0.0.1:5000/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
        (res) => {
          let body = "";
          res.on("data", (d) => (body += d));
          res.on("end", () => resolve(JSON.parse(body)));
        },
      );
      req.write(
        JSON.stringify({ email: "demo@example.com", password: "password123" }),
      );
      req.end();
    });

    const token = loginRes.token;
    if (!token) throw new Error("No token!" + JSON.stringify(loginRes));

    const driversRes = await new Promise((resolve) => {
      const req = http.request(
        "http://127.0.0.1:5000/api/auth/drivers",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
        (res) => {
          let body = "";
          res.on("data", (d) => (body += d));
          res.on("end", () => resolve(JSON.parse(body)));
        },
      );
      req.end();
    });

    for (const d of driversRes) {
      const perf = await new Promise((resolve) => {
        const req = http.request(
          `http://127.0.0.1:5000/api/drivers/${d.uuid}/performance`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
          (res) => {
            let body = "";
            res.on("data", (d) => (body += d));
            res.on("end", () => resolve(JSON.parse(body)));
          },
        );
        req.end();
      });
      console.log("DRIVER:", d.first_name, "UUID:", d.uuid);
      console.log("HISTORY:", perf.history);
      console.log("RECENT:", perf.recentDeliveries?.length);
    }
  } catch (e) {
    console.error(e);
  }
}
test();
