<?php
header('Set-Cookie: cross-site-cookie=name; SameSite=None; Secure'); 
use sandeepshetty\shopify_api;
require 'vendor/autoload.php';
require 'conn-shopify.php';

if (isset($_GET['shop'])) {
    $shop = $_GET['shop'];
} else {
    ?>
    <head>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
        <script src="https://cdn.shopify.com/s/assets/external/app.js"></script>
    </head>
    <div class="container">
        <h1 class="page-heading">Input your shop name to continue: </h1>
        <form class="form-inline">
            <input type="text" style="width: 500px" class="inputShop form-control">
            <button class="btn btn-primary submitShop" type="submit">Continue</button>
        </form>
    </div>
    <script>
        $('.submitShop').click(function (e) {
        e.preventDefault();
        window.location = 'https://' + $('.inputShop').val() + '/admin/api/auth?api_key=<?php echo $apiKey; ?>';
        });</script>
    <?php
    die();
}

$shop_data = $db->query("select * from tbl_usersettings where store_name = '" . $shop . "' and app_id = $appId");
$shop_data = $shop_data->fetch_object();
$installedDate = $shop_data->installed_date;
$confirmation_url = $shop_data->confirmation_url;
$clientStatus = $shop_data->status;

$date1 = new DateTime($installedDate);
$date2 = new DateTime("now");
$interval = date_diff($date1, $date2);
$diff = (int) $interval->format('%R%a');
if ($clientStatus != 'active') {
    header('Location: ' . $rootLink . '/chargeRequire.php?shop=' . $shop);
} else {
    $select_settings = $db->query("SELECT * FROM tbl_appsettings WHERE id = $appId");
    $app_settings = $select_settings->fetch_object();
    $shop_data = $db->query("select * from tbl_usersettings where store_name = '" . $shop . "' and app_id = $appId");
    $shop_data = $shop_data->fetch_object();
    $shopify = shopify_api\client(
        $shop, $shop_data->access_token, $app_settings->api_key, $app_settings->shared_secret
    );
    $shopInfo = $shopify("GET", "/admin/shop.json");
    $version = 15; //15
    ?>
    <!DOCTYPE html>
    <head>
        <title>Product Questions and Answers by Omega Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="admin/lib/bootstrap.min.css?v=1">
        <link type="text/css" rel="stylesheet" href="admin/lib/bootstrap-vue.css"/>
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.2.0/css/all.css">
        <link rel="stylesheet" href="admin/lib/vue-material.min.css">
        <link rel="stylesheet" href="admin/lib/default.css"> 
        <link rel="stylesheet" href="admin/lib/flatpickr.min.css">
        <link rel="stylesheet" href="admin/lib/vue-multiselect.min.css">
        <link rel="stylesheet" href="admin/lib/polaris/polaris-vue.css">
        <link rel="stylesheet" type="text/css" href="admin/styles/appStyles.css?v=<?php echo $version ?>">
        <script src="https://cdn.shopify.com/s/assets/external/app.js"></script>
        <script src="admin/lib/jquery.min.js"></script>
        <script type="text/javascript" src="admin/lib/vue.min.js"></script>
        <script type="text/javascript">
            ShopifyApp.init({
              apiKey: '<?php echo "faqs-for-specific-products"; ?>',
              shopOrigin: 'https://<?php echo $shop; ?>',
            });
        </script>
    </head>
    <body>
        <div id="productFaqsApp">
            <div v-if="settings != null" >
                <b-tabs content-class="mt-3">
                    <b-tab title="Product List" active>
                        <product-faqs 
                            :settings="settings"
                        ></product-faqs>
                    </b-tab>
                    <b-tab title="Settings General">
                        <settings 
                            :settings="settings"
                            :title-settings="titleSettings"
                        ></settings>
                    </b-tab>
                    <b-tab title="Email Settings">
                        <div class="page-container">
                            <email-settings 
                                :settings="settings"
                            ></email-settings>
                        </div>
                    </b-tab>
                    <b-tab title="Instructions">
                        <instructions></instructions>
                    </b-tab>
                </b-tabs>
            </div>
        </div>
        <div class="app-footer md-layout">
			<?php require 'admin/review/star.php'; ?>
			<div class="footer-header md-layout-item md-size-100" style="text-align: center;">
				Some other sweet <strong>Omega</strong> apps you might like!
				<a target="_blank" href="https://apps.shopify.com/partners/omegaapps">
					(View all app)
				</a>
			</div>
			<div class="omg-more-app row" style="clear:both; margin:10px 0;width:100%;"> 
				<div class="col-md-4" style="text-align: center;">
					<p><a href="https://apps.shopify.com/quantity-price-breaks-limit-purchase?utm_source=order_tagger_admin" target="_blank"><img alt="Quantity Price Breaks by Omega" src="https://s3.amazonaws.com/shopify-app-store/shopify_applications/small_banners/5143/splash.png?1452220345"></a></p>
				</div>
				<div class="col-md-4" style="text-align: center;">
					<p><a href="https://apps.shopify.com/order-tagger-by-omega?utm_source=order_tagger_admin" target="_blank"><img alt="Order Tagger by Omega" src="https://s3.amazonaws.com/shopify-app-store/shopify_applications/small_banners/17108/splash.png?1510565540"></a></p>
				</div>
				<div class="col-md-4" style="text-align: center;">
					<p><a href="https://apps.shopify.com/omega-estimated-shipping-date?utm_source=order_tagger_admin" target="_blank"><img alt="Estimated Shipping date" src="https://s3.amazonaws.com/shopify-app-store/shopify_applications/small_banners/20227/splash.png?1522632344"></a></p>
				</div>
				 
			</div>		
			
		</div>			
		<div class="footer-copyright md-layout-item md-size-100" style="text-align: center;">
            ©2017-2019 <a href="https://www.omegatheme.com/" target="_blank">Omegatheme</a> All Rights Reserved.
        </div>
        <?php include 'facebook-chat.html'; ?>
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-126587266-1"></script>
		<script>
		  window.dataLayer = window.dataLayer || [];
		  function gtag(){dataLayer.push(arguments);}
		  gtag('js', new Date());

		  gtag('config', 'UA-126587266-1');
		</script>
		<?php include 'google_remarketing_tag.txt'; ?>	
        <script type="text/javascript" src="admin/lib/bootstrap.min.js"></script>
        <script type="text/javascript">
            $(".closeNote").click(function (e) {
                e.preventDefault();
                $(".noteWrap").hide();
            });
            $(".refreshCharge").click(function (e) {
                e.preventDefault();
                $.get("recharge.php?shop=<?php echo $shop; ?>", function (result) {
                    location.href = result;
                });
            });
            window.shop = "<?php echo $shop; ?>";
            window.rootLink = "<?php echo $rootLink; ?>";
            window.adminEmail = "<?php echo $shopInfo["email"]; ?>";
            window.adminName = "<?php echo $shopInfo["name"]; ?>";
            window.version = "<?php echo $version ?>";
        </script>
        <script type="text/javascript" src="admin/lib/polaris/polaris-vue.min.js"></script>
        <script type="text/javascript" src="admin/lib/flatpickr.js"></script>
        <script type="text/javascript" src="admin/lib/vue-multiselect.min.js"></script>
        <script type="text/javascript" src="admin/lib/tinymce/tinymce.min.js"></script>
        <script type="text/javascript" src="admin/lib/vue-flatpickr.js"></script>
        <script type="text/javascript" src="admin/lib/httpVueLoader.js"></script>
        <script type="text/javascript" src="admin/lib/vue-resource.min.js"></script>
        <script src="admin/lib/popper.min.js?v=1"></script>
        <script src="//unpkg.com/babel-polyfill@latest/dist/polyfill.min.js"></script>
        <script src="admin/lib/bootstrap.min.js"></script>
        <script src="admin/lib/bootstrap-vue.js"></script>
        <script type="text/javascript" src="admin/scripts/main.js?v=<?php echo $version ?>"></script>
    </body>
<?php } ?>

