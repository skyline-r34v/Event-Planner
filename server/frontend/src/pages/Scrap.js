import React, { useState } from "react";
import axios from "axios";

function Scrap() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Trigger Python scraper
  const startScraping = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://192.168.29.251:5000/scrape");
      setData(res.data);
    } catch (error) {
      console.error("Error scraping data", error);
    }
    setLoading(false);
  };

  // Fetch latest data without scraping
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://192.168.29.251:5000/data");
      setData(res.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Google Maps Scraper</h1>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={startScraping} disabled={loading} style={{ marginRight: "10px" }}>
          {loading ? "Scraping..." : "Start Scraping"}
        </button>
        <button onClick={fetchData} disabled={loading}>
          {loading ? "Loading..." : "Load Latest Data"}
        </button>
      </div>

      {data.length > 0 && (
        <table border="1" cellPadding="8" style={{ marginTop: "20px", width: "100%" , color:"white"}}>
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Keyword</th>
              <th>Name</th>
              <th>Rating</th>
              <th>Address</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {data.map((place, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td> {/* Serial number starts from 1 */}
                <td>{place.keyword}</td>
                <td>{place.name}</td>
                <td>{place.rating}</td>
                <td>{place.address}</td>
                <td>{place.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Scrap;
