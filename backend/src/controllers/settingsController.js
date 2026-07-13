const pool = require("../config/db");

const getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT setting_key, setting_value FROM site_settings");
    const settings = {};
    rows.forEach((r) => (settings[r.setting_key] = r.setting_value));
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateSettings = async (req, res) => {
  const settings = req.body;
  try {
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        "INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
        [key, value, value]
      );
    }
    res.json({ message: "Settings updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSettings, updateSettings };
