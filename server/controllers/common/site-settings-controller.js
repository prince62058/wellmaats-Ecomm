const SiteSettings = require("../../models/SiteSettings");
const defaults = require("../../data/defaultSiteSettings");

async function getSiteSettings(req, res) {
  try {
    let settings = await SiteSettings.findOne({ key: "site" });
    if (!settings) {
      settings = await SiteSettings.create(defaults);
    }
    res.status(200).json({ success: true, data: settings });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occured" });
  }
}

module.exports = { getSiteSettings };
