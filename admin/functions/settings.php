<?php
ini_set('display_errors', TRUE);
error_reporting(E_ALL);
require '../../vendor/autoload.php';
use sandeepshetty\shopify_api;
require '../../conn-shopify.php';
require '../../help.php';
if (isset($_GET["action"])) {
    $action = $_GET["action"];
    $shop = $_GET["shop"];
    $shopify = shopifyInit($db, $shop, $appId);
    
    if ($action == "getSettings") {
        $settings = getShopSettings($shop);
        $dateFormat = array(
            array('value' => 'm/d/y','label' => date("m/d/y")),
            array('value' => 'd/m/y','label' => date("d/m/y")),
            array('value' => 'y/m/d','label' => date("y/m/d")),
            array('value' => 'd.m.y','label' => date("d.m.y")),
            array('value' => 'y.m.d','label' => date("y.m.d")),
            array('value' => 'Y-m-d','label' => date("Y-m-d")),
            array('value' => 'd-m-y','label' => date("d-m-y")),
            array('value' => 'd M, y','label' => date("d M, y")),
            array('value' => 'd M, Y','label' => date("d M, Y")),
            array('value' => 'd F, y','label' => date("d F, y")),
            array('value' => 'd F, Y','label' => date("d F, Y")),
            array('value' => 'F d, Y','label' => date("F d, Y")),
            array('value' => 'l, d F, Y','label' => date("l, d F, Y")),
            array('value' => 'D, M d, Y','label' => date("D, M d, Y")),
            array('value' => 'l, M d, Y','label' => date("l, M d, Y")),
            array('value' => 'l, F d, Y','label' => date("l, F d, Y")),
            array('value' => 'D, F d, Y','label' => date("D, F d, Y")),
            );
        $response = array(
            "settings" => $settings,
            "dateformat" => $dateFormat,
        );
        echo json_encode($response);
    }
    if ($action == "sendEmailTest"){
        $shopInfo = $shopify("GET", "/admin/shop.json");
        $settings = db_fetch_row("select * from product_faqs_settings where shop = '$shop'");
        $settings["admin_email_body"] = html_entity_decode($settings["admin_email_body"]);
        $settings["admin_email_body"] = str_replace("{!! shop_name !!}", $shopInfo["name"] ,$settings["admin_email_body"]);
        $settingsEmail = getSettingsGeneralEmail($settings);
        $settingsEmail['emailTo'] = $settings['admin_email'];
        $settingsEmail['titleEmail'] = $settings['admin_email_subject'];
        $settingsEmail['content'] =  $settings['admin_email_body'];
        $sendEmail = sendEmail($settingsEmail, $settings['admin_email']);
        echo json_encode($sendEmail);
        exit;
    }
}
if (isset($_POST['action'])) {
    $action     = $_POST['action'];
    $shop       = $_POST["shop"];
    $shopify = shopifyInit($db, $shop, $appId);
    if ($action == "saveGeneralSettings") {
        $settings = $_POST["settings"];
        if(is_array($settings)) {
            $data = array(
                'auto_publish'              => returnBooleanData($settings['auto_publish']),
                'per_page'                  => $settings['per_page'],
                'maximum_char'              => $settings['maximum_char'],
                'typeDate'                  => $settings['typeDate'],
                'dateTime'                  => $settings['dateTime'],
                'header_title'              => $settings['header_title'],
                'ask_question_button'       => $settings['ask_question_button'],
                'loadmore_button'           => $settings['loadmore_button'],
                'nomore_button'             => $settings['nomore_button'],
                'author_field'              => $settings['author_field'],
                'email_field'               => $settings['email_field'],
                'question_field'            => $settings['question_field'],
                'submit_text'               => $settings['submit_text'],
                'reply_text'                => $settings['reply_text'],
                'close_text'                => $settings['close_text'],
                'success_mess'              => $settings['success_mess'],
                'empty_mess'                => $settings['empty_mess'],
                'error_mess'                => $settings['error_mess'],
                'vote_success'              => $settings['vote_success'],
                'see_more_answer'           => $settings['see_more_answer'],
                'collapse_all_answers'      => $settings['collapse_all_answers'],
                'text_color'                => "#".$settings['text_color'],
                'bg_color'                  => "#".$settings['bg_color'],
                'timezone'                  => $settings['timezone'],
                'customcss'                 => $settings['customcss'],
            );  
            db_update("product_faqs_settings",$data,"shop = '$shop'");
            createShopSettingsFile($shop);
            saveScriptTagId($shop, $shopify, 'product_faqs_settings');
            updateScriptTag($shop, $shopify, 'product_faqs_settings', $rootLink.'/productfaqs.js');
        }
    }
    if ($action == "saveEmailTemplate") {
        $settings = $_POST["settings"];
        $data = array(
            "admin_email_smtp"          => $settings['admin_email_smtp'],
            "admin_email_port"          => $settings['admin_email_port'],
            "admin_email_encryption"    => $settings['admin_email_encryption'],
            "admin_email_user"          => $settings['admin_email_user'],
            "admin_email_pass"          => $settings['admin_email_pass'],
            'admin_send_mail'           => returnBooleanData($settings['admin_send_mail']),
            'admin_email'               => $settings["admin_email"],
            'admin_email_subject'       => $settings["admin_email_subject"],
            'admin_email_body'          => htmlentities( $settings["admin_email_body"], ENT_COMPAT, 'UTF-8'),
            'screen_name'               => $settings["screen_name"],
            'customer_email_subject'    => $settings["customer_email_subject"],
            'customer_email_body'       => htmlentities( $settings["customer_email_body"], ENT_COMPAT, 'UTF-8'),
        );  
        db_update("product_faqs_settings",$data,"shop = '$shop'");
        createShopSettingsFile($shop);
        saveScriptTagId($shop, $shopify, 'product_faqs_settings');
        updateScriptTag($shop, $shopify, 'product_faqs_settings', $rootLink.'/productfaqs.js');
    }
}
function getShopSettings($shop) {
    $settings = db_fetch_row("SELECT * FROM product_faqs_settings WHERE shop = '$shop'");
    if (!empty($settings)) {
        $settings["text_color"] = str_replace("#","",$settings["text_color"]);
        $settings["bg_color"] = str_replace("#","",$settings["bg_color"]);
        $settings['admin_email_body'] = html_entity_decode($settings["admin_email_body"]);
        $settings['customer_email_body'] = html_entity_decode($settings["customer_email_body"]);
    }
    return $settings;
}
