const SiteSettings = require("../../models/SiteSettings");
const defaults = require("../../data/defaultSiteSettings");

async function updateSiteSettings(req, res) {
  try {
    const settings = await SiteSettings.findOneAndUpdate(
      { key: "site" },
      { $set: req.body },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({
      success: true,
      message: "Site settings updated",
      data: settings,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occured" });
  }
}

async function resetSiteSettings(req, res) {
  try {
    const settings = await SiteSettings.findOneAndUpdate(
      { key: "site" },
      { $set: defaults },
      { new: true, upsert: true }
    );
    res.status(200).json({
      success: true,
      message: "Settings reset to defaults",
      data: settings,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occured" });
  }
}

module.exports = { updateSiteSettings, resetSiteSettings };
