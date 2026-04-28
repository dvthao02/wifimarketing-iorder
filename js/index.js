function loadConfig(data) {
  IndexObj.init(data);
}

const IndexObj = {
  postUrl: "",

  init: function (data) {
    this.loadJson(data);
    setTimeout(function () {
      $("#body_loading").addClass("hide");
    }, 1000);
    this.initEvent();
  },

  loadJson: function (data) {
    this.postUrl = data?.post_url || "";
    I18nObj.init(data);
    I18nObj.renderHtmlLang();
  },

  initEvent: function () {
    const self = this;
    $("#wifi_entry_btn").on("click", function (event) {
      event.preventDefault();
      self.onEnterWifi();
    });
  },

  onEnterWifi() {
    $("#login_msg").text("");

    const age = $("#survey_age").val();
    const phone = $("#survey_phone").val().trim();
    const optin = $("#survey_optin").is(":checked");

    if (!age) {
      $("#login_msg").text(I18nObj.$t("age_required"));
      return;
    }

    if (!phone) {
      $("#login_msg").text(I18nObj.$t("lead_required"));
      return;
    }

    if (!/^\+?[0-9\s-]{9,15}$/.test(phone)) {
      $("#login_msg").text(I18nObj.$t("lead_phone_invalid"));
      return;
    }

    const leadPayload = {
      ageRange: age,
      phone: phone,
      optIn: optin,
      lang: I18nObj.currentLang,
      source: "wifi-marketing-landing",
      sessionId: this._getParamVal("sessionId"),
      createdAt: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem("iorder_wifi_lead", JSON.stringify(leadPayload));
    } catch (e) {
      console.warn("Cannot save lead to sessionStorage", e);
    }

    this.sendLeadBestEffort(leadPayload);
    this.redirectToWifi();
  },

  sendLeadBestEffort(payload) {
    try {
      $.ajax({
        url: "/api/marketing/lead",
        method: "POST",
        data: JSON.stringify(payload),
        contentType: "application/json",
      });
    } catch (e) {
      console.warn("Lead submit skipped", e);
    }
  },

  redirectToWifi() {
    const redirectTarget =
      this._getParamVal("logonurl") ||
      this._getParamVal("redirecturl") ||
      this._getParamVal("redirect") ||
      this.postUrl ||
      "https://iorder.vn/home";

    window.location.href = redirectTarget;
  },

  _getParamVal(paras) {
    try {
      const topUrl = decodeURI(window.top.location.href);
      const queryString = topUrl.split("?")[1];
      if (!queryString) {
        return null;
      }

      const paraString = queryString.split("&");
      const paraObj = {};
      for (let i = 0; i < paraString.length; i++) {
        const pair = paraString[i].split("=");
        if (pair.length === 2) {
          paraObj[pair[0].toLowerCase()] = decodeURIComponent(pair[1]);
        }
      }

      const returnValue = paraObj[paras.toLowerCase()];
      return returnValue !== undefined ? returnValue : null;
    } catch (e) {
      console.error("Error accessing top window URL:", e);
      return null;
    }
  },
};
