<?php
ini_set('display_errors', true);
error_reporting(E_ALL);
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require 'vendor/autoload.php';

use sandeepshetty\shopify_api;

require 'conn-shopify.php';
require 'helper.php';

if (isset($_GET["action"])) {
    $action = $_GET["action"];
    $shop = $_GET["shop"];
    $shopify = shopifyInit($db, $shop, $appId);
    $shopInfo = $shopify("GET", "/admin/shop.json");
    $settings = db_fetch_row("SELECT * FROM product_faqs_settings WHERE shop = '$shop'");
    $version = time(); // 2
    if ($action == "checkInstallApp") {
        $expired = checkExpired($shop, $appId, $trialTime);
        $shop_data = db_fetch_row("select * from tbl_usersettings where store_name = '$shop' and app_id = $appId");
        if (isset($shop_data['installed_date'])) {
            $installed = true;
        } else {
            $installed = false;
        }
        $response = array(
            "install" => $installed,
            "expired" => $expired,
            "ver" => $version,
        );
        echo json_encode($response);
    }
    if ($action == "getProductFaqs") {
        $productid = (isset($_GET['productid'])) ? $_GET['productid'] : null;
        $lists = getQuestions($shop, $settings, $productid, $settings["per_page"], 0);
        $response = array(
            "count" => countAllQuestions($shop, $productid),
            "lists" => $lists,
        );
        echo json_encode($response);
    }
}
if (isset($_POST["action"])) {
    $action = $_POST["action"];
    $shop = $_POST["shop"];

    if ($action == "submitQuestion") {
        $data = (isset($_POST['data'])) ? json_decode($_POST['data'], true) : array();
        $productid = (isset($_POST['productid'])) ? $_POST['productid'] : null;
        if ($productid != null) {
            $settings = getShopFullSettings($shop);
            if ($settings['timezone']) {
                date_default_timezone_set($settings['timezone']);
            } else {
                date_default_timezone_set('UTC');
            }

            $publish = $settings["auto_publish"] == 1 ? 1 : 0;
            $resultInsert = saveProductQuestion($productid, $publish, $shop, $data);
            if ($resultInsert == true) {
                $checkSendMail = false;
                if ($settings["admin_send_mail"] == 1 && $settings['admin_email'] != '') {
                    if ($settingsEmail === false
                        || $settings["customer_email_body"] == '' || $settings["customer_email_body"] == null
                        || $settings["admin_email_body"] == '' || $settings['admin_email_body'] == null) {
                        sendEmailConfigNotification($settings['admin_email']);
                    }
                    $settingsEmail = getSettingsGeneralEmail($settings);
                    $shopify = shopifyInit($db, $shop, $appId);
                    $shopInfo = $shopify("GET", "/admin/shop.json");
                    $product = getDataById($shopify, $productid, 'products', $filter = null);
                    $producturl = "<a target='_blank' href='https://" . $shop . "/products/" . $product["handle"] . "'>" . $product["title"] . "</a>";
                    $questionInfor = "
                        <p><strong>Name:</strong> " . $data["faqName"] . "</p>
                        <p><strong>Email:</strong> " . $data["faqEmail"] . "</p>
                        <p><strong>Question:</strong> " . $data["faqQuestion"] . "</p>
                    ";

                    $settings["admin_email_subject"] = str_replace("{product_name}", $product["title"], $settings["admin_email_subject"]);
                    $settings["admin_email_body"] = str_replace("{!! shop_name !!}", $shopInfo["name"], $settings["admin_email_body"]);
                    $settings["admin_email_body"] = str_replace("{!! product_name !!}", $producturl, $settings["admin_email_body"]);
                    $settings["admin_email_body"] = str_replace("{!! question_information !!}", $questionInfor, $settings["admin_email_body"]);
                    $settingsEmail['emailTo'] = $settings["admin_email"];
                    $settingsEmail['titleEmail'] = $settings['admin_email_subject'];
                    $settingsEmail['content'] = $settings["admin_email_body"];
                    $checkSendMail = sendEmail($settingsEmail, $settings['admin_email']);
                }
                echo json_encode($checkSendMail);
            } else {
                echo json_encode('error');
            }
        } else {
            echo json_encode('error');
        }
    }
    if ($action == "submitReply") {
        $data = (isset($_POST['data'])) ? json_decode($_POST['data'], true) : array();
        $id = (isset($_POST['id'])) ? $_POST['id'] : null;
        $productid = (isset($_POST['productid'])) ? $_POST['productid'] : null;
        if ($productid != null) {
            $settings = getShopFullSettings($shop);
            if ($settings['timezone']) {
                date_default_timezone_set($settings['timezone']);
            } else {
                date_default_timezone_set('UTC');
            }

            $publish = $settings["auto_publish"] == 1 ? 1 : 0;
            $resultInsert = saveAnswer($id, $publish, $shop, $data);
            if ($resultInsert == true) {
                $checkSendMail = true;
                $settingsEmail = getSettingsGeneralEmail($settings);
                if ($settingsEmail === false
                    || $settings["customer_email_body"] == '' || $settings["customer_email_body"] == null
                    || $settings["admin_email_body"] == '' || $settings['admin_email_body'] == null) {
                    sendEmailConfigNotification($settings['admin_email']);
                }
                $shopify = shopifyInit($db, $shop, $appId);
                $shopInfo = $shopify("GET", "/admin/shop.json");
                $product = getDataById($shopify, $productid, 'products', $filter = null);
                $producturl = "<a target='_blank' href='https://" . $shop . "/products/" . $product["handle"] . "'>" . $product["title"] . "</a>";
                $questionInfor = "
                    <p><strong>Name:</strong> " . $data["faqName"] . "</p>
                    <p><strong>Email:</strong> " . $data["faqEmail"] . "</p>
                    <p><strong>Question:</strong> " . $data["faqQuestion"] . "</p>
                ";
                if ($settings["admin_send_mail"] == 1 && $settings['admin_email'] != '') {
                    $settings["admin_email_subject"] = str_replace("{product_name}", $product["title"], $settings["admin_email_subject"]);
                    $settings["admin_email_body"] = str_replace("{!! shop_name !!}", $shopInfo["name"], $settings["admin_email_body"]);
                    $settings["admin_email_body"] = str_replace("{!! product_name !!}", $producturl, $settings["admin_email_body"]);
                    $settings["admin_email_body"] = str_replace("{!! question_information !!}", $questionInfor, $settings["admin_email_body"]);
                    $settingsEmail['emailTo'] = $settings["admin_email"];
                    $settingsEmail['titleEmail'] = $settings['admin_email_subject'];
                    $settingsEmail['content'] = $settings["admin_email_body"];
                    $checkSendMail = sendEmail($settingsEmail, $settings['admin_email']);
                }
                if ($data["faqEmail"] != $settings["admin_email"]) {
                    $settings["customer_email_subject"] = str_replace("{product_name}", $product["title"], $settings["customer_email_subject"]);
                    $settings["customer_email_body"] = str_replace("{!! shop_name !!}", $shopInfo["name"], $settings["customer_email_body"]);
                    $settings["customer_email_body"] = str_replace("{!! product_name !!}", $producturl, $settings["customer_email_body"]);
                    $settings["customer_email_body"] = str_replace("{!! question_information !!}", $questionInfor, $settings["customer_email_body"]);
                    $settingsEmail['emailTo'] = $data["faqEmail"];
                    $settingsEmail['titleEmail'] = $settings['customer_email_subject'];
                    $settingsEmail['content'] = $settings["customer_email_body"];
                    $checkSendMail = sendEmail($settingsEmail, $settings['admin_email']);
                }
                echo json_encode($checkSendMail);
            } else {
                echo json_encode('error');
            }
        }
    }
    if ($action == "voteUpQuestion") {
        $id = (isset($_POST['questionId'])) ? $_POST['questionId'] : "";
        $vote = (isset($_POST['vote'])) ? intval($_POST["vote"]) : 0;
        $vote++;
        $db->query("UPDATE product_faqs_database SET vote='$vote' WHERE id = '$id'");
        echo json_encode($vote);
    }
    if ($action == "voteDownQuestion") {
        $id = (isset($_POST['questionId'])) ? $_POST['questionId'] : "";
        $vote = (isset($_POST['vote'])) ? intval($_POST["vote"]) : 0;
        $vote--;
        $db->query("UPDATE product_faqs_database SET vote='$vote' WHERE id = '$id'");
        echo json_encode($vote);
    }
    if ($action == "getMoreQuestion") {
        $productid = (isset($_POST['productid'])) ? $_POST['productid'] : "";
        $offset = (isset($_POST['offset'])) ? $_POST['offset'] : "";
        $settings = db_fetch_row("SELECT * FROM product_faqs_settings WHERE shop = '$shop'");
        $shopify = shopifyInit($db, $shop, $appId);
        $product = getDataById($shopify, $productid, 'products', $filter = null);

        if ($offset != "") {
            $list = getQuestions($shop, $settings, $productid, $settings["per_page"], $offset);
        } else {
            $list = array();
        }
        echo json_encode($list);
    }
}
function getShopFullSettings($shop)
{
    $query = db_fetch_row("select * from product_faqs_settings where shop = '$shop'");
    if (!empty($query)) {
        $query["admin_email_body"] = html_entity_decode($query["admin_email_body"]);
        $query["customer_email_body"] = html_entity_decode($query["customer_email_body"]);
    }
    return $query;
}
function getQuestions($shop, $settings, $id, $limit, $offset)
{
    $data = db_fetch_array("SELECT * FROM product_faqs_database WHERE shop = '$shop' and product_id = '$id' and publish = '1' ORDER BY id DESC LIMIT " . $limit . " OFFSET " . $offset);
    if (!empty($data)) {
        foreach ($data as $key => &$row) {
            $row["answer_lists"] = getQuestionsByQuestionId($shop, $row["id"]);
            $row["askAgo"] = publishDateCalculate($settings, $row["publishdate"]);
            foreach ($row["answer_lists"] as $key => &$answer) {
                $answer["answerAgo"] = publishDateCalculate($settings, $answer["publishdate"]);
            }
        }
        return $data;
    } else {
        return array();
    }
}
function countAllQuestions($shop, $id)
{
    $count = db_fetch_row("SELECT COUNT(*) FROM product_faqs_database WHERE shop ='$shop' and product_id = '$id' and publish = '1'");
    return $count['COUNT(*)'];
}

function getQuestionsByQuestionId($shop, $id)
{
    $data = db_fetch_array("SELECT * FROM product_faqs_answer_list WHERE shop = '$shop' AND question_id = '$id'");
    if (!empty($data)) {
        return $data;
    } else {
        return array();
    }
}

function publishDateCalculate($settings, $datetime)
{
    if ($settings['timezone']) {
        date_default_timezone_set($settings['timezone']);
    } else {
        date_default_timezone_set('UTC');
    }

    $askAgo = "";
    if ($settings["typeDate"] == '1') {
        $dateFormat = $settings["dateTime"];
        $askAgo = "on " . date("{$dateFormat}", strtotime($datetime));
    } else {
        // $now = date("Y-m-d H:i:s");
        $diff = abs(time() - strtotime($datetime));
        $years = floor($diff / (365 * 60 * 60 * 24));
        $months = floor(($diff - $years * 365 * 60 * 60 * 24) / (30 * 60 * 60 * 24));
        $days = floor(($diff - $years * 365 * 60 * 60 * 24 - $months * 30 * 60 * 60 * 24) / (60 * 60 * 24));
        $hours = floor(($diff - $years * 365 * 60 * 60 * 24 - $months * 30 * 60 * 60 * 24 - $days * 60 * 60 * 24) / (60 * 60));
        $minutes = floor(($diff - $years * 365 * 60 * 60 * 24 - $months * 30 * 60 * 60 * 24 - $days * 60 * 60 * 24 - $hours * 60 * 60) / 60);
        $seconds = floor(($diff - $years * 365 * 60 * 60 * 24 - $months * 30 * 60 * 60 * 24 - $days * 60 * 60 * 24 - $hours * 60 * 60 - $minutes * 60));
        if ($years == 0 && $months == 0 && $days == 0 && $hours == 0 && $minutes == 0 && $seconds != 0) {
            if ($seconds == 1) {
                $askAgo = '- 1 second ago';
            } else {
                $askAgo = '- ' . $seconds . ' seconds ago';
            }

        } elseif ($years == 0 && $months == 0 && $days == 0 && $hours == 0 && $minutes != 0) {
            if ($minutes == 1) {
                $askAgo = '- 1 minute ago';
            } else {
                $askAgo = '- ' . $minutes . ' minutes ago';
            }

        } elseif ($years == 0 && $months == 0 && $days == 0 && $hours != 0) {
            if ($hours == 1) {
                $askAgo = '- 1 hour ago';
            } else {
                $askAgo = '- ' . $hours . ' hours ago';
            }

        } elseif ($years == 0 && $months == 0 && $days != 0) {
            if ($days == 1) {
                $askAgo = '- 1 day ago';
            } else {
                $askAgo = '- ' . $days . ' days ago';
            }

        } elseif ($years == 0 && $months != 0) {
            if ($months == 1) {
                $askAgo = '- 1 month ago';
            } else {
                $askAgo = '- ' . $months . ' months ago';
            }

        } elseif ($years != 0) {
            if ($years == 1) {
                $askAgo = '- 1 year ago';
            } else {
                $askAgo = '- ' . $years . ' years ago';
            }

        }
    }
    return $askAgo;
}

function checkExpired($shop, $appId, $trialTime)
{
    $shop_data = db_fetch_row("select * from tbl_usersettings where store_name = '$shop' and app_id = $appId");
    if (isset($shop_data['installed_date'])) {
        $installedDate = $shop_data['installed_date'];
        $clientStatus = $shop_data['status'];

        $date1 = new DateTime($installedDate);
        $date2 = new DateTime("now");
        $interval = date_diff($date1, $date2);
        $diff = (int) $interval->format('%R%a');
        if ($diff > $trialTime && $clientStatus != 'active') {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
}