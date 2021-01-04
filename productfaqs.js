// Shop Name
if (typeof omgfaqs_checkJS == "undefined") {
  var omgfaqs_checkJS = 1;
  var ot_product_faqs_shopName = Shopify.shop;
  var rootlinkProductFaqs = "https://haolocal.omegatheme.com/omegaApp/product-faqs";

  if (typeof $ == "undefined") {
    javascript: (function (e, s) {
      e.src = s;
      e.onload = function () {
        $ = jQuery.noConflict();
        omgfaqs_init();
      };
      document.head.appendChild(e);
    })(
      document.createElement("script"),
      "https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"
    );
  } else {
    omgfaqs_init();
  }

  async function omgfaqs_init() {
    var ver = await omgfaqs_checkInstallApp();
    if (ver != null) {
      omgfaqs_loadFile(ver);
    }
  }

  // -----------------Fetch Settings-------------------
  function omgfaqs_checkInstallApp() {
    return new Promise((resolve) => {
      $.ajax({
        url: `${rootlinkProductFaqs}/productfaqs.php`,
        type: "GET",
        data: {
          shop: ot_product_faqs_shopName,
          action: "checkInstallApp",
        },
        dataType: "json",
      }).done((result) => {
        if (result.install && !result.expired) {
          resolve(result.ver);
        } else {
          resolve(null);
        }
      });
    });
  }
  // ----------------End Fetch Settings-----------------

  // -------------------------- Load file -------------------------
  function omgfaqs_loadFile(ver) {
    $("head").append(`
        <link href='${rootlinkProductFaqs}/assets/css/productfaqs.css?v=${ver}' rel='stylesheet' type='text/css'>
          `);
    omgfaqs_cachedScript(`${rootlinkProductFaqs}/app.js?v=${ver}`).done(
      function (script, textStatus) {
        omgfaqs_getJsonFile();
      }
    );
  }

  // ------------------------ End load file -----------------------

  function omgfaqs_cachedScript(url, options) {
    options = $.extend(options || {}, {
      dataType: "script",
      cache: true,
      url: url,
    });
    return $.ajax(options);
  }
}
