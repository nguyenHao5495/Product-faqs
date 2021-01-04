<?php
ini_set('display_errors', true);
error_reporting(0);
require 'vendor/autoload.php';
use sandeepshetty\shopify_api;

require 'conn-shopify.php';
if (isset($_GET["action"])) {
    $action = $_GET["action"];
    $shop = $_GET["shop"];

    if ($action == "getStorePlanChange") {
        $webhookContent = "";
        $webhook = fopen('php://input', 'rb');
        while (!feof($webhook)) {
            $webhookContent .= fread($webhook, 4096);
        }
        fclose($webhook);
        $data = json_decode($webhookContent, true);
        if ($data["plan_name"] == 'closed' || $data["plan_name"] == 'cancelled' || $data["plan_name"] == 'fraudulent') {
            $db->query("update tbl_usersettings set status = '" . $data["plan_name"] . "' where shop = '$shop' and app_id = $appId");
        } else {
            $db->query("update tbl_usersettings set status = 'active' where shop = '$shop' and app_id = $appId");
        }
    }
}