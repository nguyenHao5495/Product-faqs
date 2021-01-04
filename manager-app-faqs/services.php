<?php
    require '../conn-shopify.php'; 
    require '../help.php'; 
    require '../vendor/autoload.php';
    
    if (isset($_GET['action'])) {
        $action = $_GET['action'];
        if ($action == 'getAllStores') {
            $stores = db_fetch_array("select id, store_name, installed_date from tbl_usersettings where app_id = $appId AND status = 'active' ORDER BY id DESC");
            foreach ($stores as $key => &$value) {
               $value['status'] = 0;
               $value['status_cache'] = 0;
               $value['statusEmailTemplate'] = 0;
            }
            echo json_encode($stores);
            exit;
        }
        if ($action == 'updateDataCache') {
            $shop = $_GET['shop'];
            $shopify = shopifyInit($db, $shop, $appId);
            createShopSettingsFile($shop);
            saveScriptTagId($shop, $shopify, 'product_faqs_settings');
            updateScriptTag($shop, $shopify, 'product_faqs_settings', $rootLink.'/productfaqs.js');
            echo json_encode(true);
            exit;
        }
        if ($action == 'deleteDataCache') {
            $shop = $_GET['shop'];
            deleteDataCache(CACHE_PATH . $shop);
            echo json_encode(true);
            exit;
        }
        if ($action == 'updateAllStore') {
            $stores = db_fetch_array("select id, store_name, installed_date from tbl_usersettings where app_id = $appId AND status = 'active'");

            foreach ($stores as $key => $value) {
                $shop = $value['store_name'];
                createShopSettingsFile($shop);
            }
            echo json_encode(true);
            exit;
        }
    }
    if (isset($_POST["action"])) {
        $action = $_POST["action"];
        $shop   = $_POST["shop"];
        if ($action == "updateEmailTemplate") {
            $settings = $_POST["settings"];
    
            $data = array(
                'admin_email_body'          => htmlentities( $settings["admin_email_body"], ENT_COMPAT, 'UTF-8'),
                'customer_email_body'       => htmlentities( $settings["customer_email_body"], ENT_COMPAT, 'UTF-8'),
                'admin_email_subject'       => $settings["admin_email_subject"],
            );
            db_update("product_faqs_settings",$data,"shop = '$shop'");
            echo json_encode(true);
        }
    }
?>  