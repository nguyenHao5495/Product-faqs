<?php
ini_set('display_errors', true);
error_reporting(0);
require 'vendor/autoload.php';
use PHPMailer\PHPMailer\Exception;
require 'conn-shopify.php';
use PHPMailer\PHPMailer\PHPMailer;
use sandeepshetty\shopify_api;
require 'phpmailer/Exception.php';
require 'phpmailer/PHPMailer.php';
require 'phpmailer/SMTP.php';

function show_array($data)
{
    if (is_array($data)) {
        echo "<pre>";
        print_r($data);
        echo "</pre>";
    }
}

function db_query($query_string)
{
    global $db;
    $result = mysqli_query($db, $query_string);
    if (!$result) {
        echo ('Query Error' . $query_string);
    }
    return $result;
}

function redirect($data)
{
    header("Location: $data");
}

function getCurl($url)
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1');
    $response = curl_exec($ch);
    if ($response === false) {
        $api_response = curl_error($ch);
    } else {
        $api_response = $response;
    }
    curl_close($ch);
    return $api_response;
}

function valaditon_get($data)
{
    if ($data) {
        return $data;
    } else {
        $data = "";
        return $data;
    }
}

function result_fetch_object($data)
{
    $result = $data->fetch_object();
    return $result;
}

function fetchDbObject($sql)
{
    global $db;
    global $shop;
    $query = $db->query($sql);
    $object = array();
    if ($query && mysqli_num_rows($query) > 0) {
        while ($row = $query->fetch_assoc()) {
            $object = $row;
        }
    }
    return $object;
}

function db_insert($table, $data)
{
    global $db;
    $fields = "(" . implode(", ", array_keys($data)) . ")";
    $values = "";

    foreach ($data as $field => $value) {
        if ($value === null) {
            $values .= "NULL, ";
            // } elseif (is_numeric($value)) {
            //     $values .= $value . ", ";
        } elseif ($value == 'true' || $value == 'false') {
            $values .= $value . ", ";
        } else {
            $values .= "'" . addslashes($value) . "', ";
        }
    }
    $values = substr($values, 0, -2);
    db_query("
            INSERT INTO $table $fields
            VALUES($values)
        ");
    return mysqli_insert_id($db);
}

function db_update($table, $data, $where)
{
    global $db;
    $sql = "";
    foreach ($data as $field => $value) {
        if ($value === null) {
            $sql .= "$field=NULL, ";
        } elseif (is_numeric($value)) {
            $sql .= "$field=" . addslashes($value) . ", ";
        } elseif ($value == 'true' || $value == 'false') {
            $sql .= "$field=" . addslashes($value) . ", ";
        } else {
            $sql .= "$field='" . addslashes($value) . "', ";
        }

    }
    $sql = substr($sql, 0, -2);
    db_query("
        UPDATE `$table`
        SET $sql
        WHERE $where
    ");
    return mysqli_affected_rows($db);
}

function db_duplicate($table, $data, $content_duplicate)
{
    global $db;
    $fields = "(" . implode(", ", array_keys($data)) . ")";
    $values = "(";
    foreach ($data as $field => $value) {
        if ($value === null) {
            $values .= "NULL, ";
        } elseif ($value === true || $value === false) {
            $values .= "$value, ";
        } else {
            $values .= "'" . addslashes($value) . "',";
        }

    }
    $values = rtrim($values, ',');
    $values .= ")";
    $query = "INSERT INTO $table  $fields  VALUES $values ON DUPLICATE KEY UPDATE $content_duplicate";
    db_query($query);
    return mysqli_insert_id($db);
}

function db_delete($table, $where)
{
    global $db;
    $query_string = "DELETE FROM " . $table . " WHERE $where";
    db_query($query_string);
    return mysqli_affected_rows($db);
}

function db_fetch_array($query_string)
{
    global $db;
    $result = array();
    $mysqli_result = db_query($query_string);
    if (!is_bool($mysqli_result)) {
        while ($row = mysqli_fetch_assoc($mysqli_result)) {
            $result[] = $row;
        }
        mysqli_free_result($mysqli_result);
    }
    return $result;
}

function db_fetch_row($query_string)
{
    global $db;
    $result = array();
    $mysqli_result = db_query($query_string);
    $result = mysqli_fetch_assoc($mysqli_result);
    mysqli_free_result($mysqli_result);
    return $result;
}

function checkExistArray($array1, $array2)
{
    if (is_array($array1) && is_array($array2)) {
        $check = array();
        foreach ($array1 as $v1) {
            array_push($check, $v1);
        }
        foreach ($array2 as $v2) {
            if (in_array($v2, $check)) {
                return $result = 1;
                break;
            } else {
                $result = 0;
            }
        }
    } else {
        return 0;
    }
    return $result;
}

// đo tốc độ thực thi
function getmicrotime()
{
    list($usec, $sec) = explode(" ", microtime());
    return ((float) $usec + (float) $sec);
}

function cvf_convert_object_to_array($data)
{
    if (is_object($data)) {
        $data = get_object_vars($data);
    }
    if (is_array($data)) {
        return array_map(__FUNCTION__, $data);
    } else {
        return $data;
    }
}

function creatSlug($string, $plusString)
{
    $search = array(
        '#(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)#',
        '#(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)#',
        '#(ì|í|ị|ỉ|ĩ)#',
        '#(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)#',
        '#(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)#',
        '#(ỳ|ý|ỵ|ỷ|ỹ)#',
        '#(đ)#',
        '#(À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ)#',
        '#(È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ)#',
        '#(Ì|Í|Ị|Ỉ|Ĩ)#',
        '#(Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ)#',
        '#(Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ)#',
        '#(Ỳ|Ý|Ỵ|Ỷ|Ỹ)#',
        '#(Đ)#',
        "/[^a-zA-Z0-9\-\_]/",
    );
    $replace = array(
        'a',
        'e',
        'i',
        'o',
        'u',
        'y',
        'd',
        'A',
        'E',
        'I',
        'O',
        'U',
        'Y',
        'D',
        '-',
    );
    $string = preg_replace($search, $replace, $string);
    $string = preg_replace('/(-)+/', '-', $string);
    $string = strtolower($string);
    return $string . $plusString;
}

// SHOPIFY
function deleteWebhook($shopify, $id)
{
    $result = $shopify("DELETE", "/admin/webhooks/" . $id . ".json");
    return $result;
}
function createWebhook($shopify, $link)
{
    $webhook = array(
        "webhook" => array(
            "topic" => "products/create",
            "address" => $link,
            "format" => "json",
        ),
    );
    $result = $shopify("POST", "/admin/webhooks.json", $webhook);
    return $result;
}
function editWebhook($shopify, $link, $id)
{
    $webhook = array(
        "webhook" => array(
            "id" => $id,
            "topic" => "products/create",
            "address" => $link,
            "format" => "json",
        ),
    );
    $result = $shopify("PUT", "/admin/webhooks.json", $webhook);
    return $result;
}
function getListWebhook($shopify)
{
    $result = $shopify("GET", "/admin/webhooks.json");
    return $result;
}
function cleanString($text)
{
    $map = array(
        array("|", ""),
        array("-", ""),
        array(")", ""),
        array("(", ""),
        array(" ", ""),
        array("&", ""),
        array("'", ""),
        array('"', ""),
        array("/", ""),
        array("[", ""),
        array("]", ""),
        array("\\", ""),
    );
    if (is_array($map)) {
        foreach ($map as $pair) {
            $text = str_replace($pair[0], $pair[1], $text);
        }

    }
    return $text;
}
function getnextday($num, $date)
{
    return date("Y-m-d H:i:s", strtotime("+" . $num . " day", strtotime($date)));
}
function getbackday($num, $date)
{
    return date("Y-m-d H:i:s", strtotime("-" . $num . " day", strtotime($date)));
}

function shopifyInit($db, $shop, $appId)
{
    $select_settings = $db->query("SELECT * FROM tbl_appsettings WHERE id = $appId");
    $app_settings = $select_settings->fetch_object();
    $shop_data = $db->query("select * from tbl_usersettings where store_name = '" . $shop . "' and app_id = $appId");
    $shop_data = $shop_data->fetch_object();
    if (!isset($shop_data->access_token)) {
        die("Please check the store: " . $shop . " seems to be incorrect access_token.");
    }
    $shopify = shopify_api\client(
        $shop, $shop_data->access_token, $app_settings->api_key, $app_settings->shared_secret
    );
    return $shopify;
}

function getDataById($shopify, $id, $topic, $filter = null)
{
    $data = $shopify("GET", "/admin/$topic/$id.json?" . $filter);
    return $data;
}

function returnBooleanData($data)
{
    if ($data == 'true') {
        return 1;
    } else {
        return 0;
    }

}

function deleteDataCache($dir)
{
    if (is_dir($dir)) {
        $structure = glob(rtrim($dir, "/") . '/*');
        if (is_array($structure)) {
            foreach ($structure as $file) {
                if (is_dir($file)) {
                    recursiveRemove($file);
                } else if (is_file($file)) {
                    @unlink($file);
                }

            }
        }
        rmdir($dir);
    }
}

function createShopSettingsFile($shop)
{
    if (!is_dir(CACHE_PATH . $shop)) {
        mkdir(CACHE_PATH . $shop, 0755, true);
    }
    $key_path = CACHE_PATH . $shop . "/data.json";
    $settings = getShopSettingsForGenerating($shop);
    $data = [
        "app" => [
            "settings" => $settings,
        ],
    ];
    $result = file_put_contents($key_path, json_encode($data));
    return $result;
}

function saveScriptTagId($shop, $shopify, $table)
{
    $scriptTags = $shopify("GET", "/admin/api/2019-04/script_tags.json");
    $scriptTag = $scriptTags[0];
    $scriptTagId = $scriptTag["id"];
    $settings = fetchDbObject("SELECT * FROM $table WHERE shop = '$shop'");
    $settings["script_tagid"] = $scriptTagId;
    $query = db_update($table, $settings, "shop = '$shop'");
    return $scriptTagId;
}

function updateScriptTag($shop, $shopify, $table, $clientJsUrl)
{
    $date = new DateTime();
    $settings = fetchDbObject("SELECT script_tagid FROM $table WHERE shop = '$shop'");
    $newVersion = $date->format('ymdHis');
    $scriptTagId = $settings["script_tagid"];
    $updatedScriptTag = $shopify("PUT", "/admin/api/2019-04/script_tags/$scriptTagId.json", [
        "script_tag" => [
            "id" => $scriptTagId,
            "src" => $clientJsUrl . "?v=" . $newVersion,
        ],
    ]);
    return $updatedScriptTag;
}

function getShopSettingsForGenerating($shop)
{
    $settings = db_fetch_row("SELECT * FROM product_faqs_settings WHERE shop = '$shop'");
    if (!empty($settings)) {
        if (isset($settings['id'])) {
            unset($settings['id']);
        }

        if (isset($settings['shop'])) {
            unset($settings['shop']);
        }

        if (isset($settings['admin_email'])) {
            unset($settings['admin_email']);
        }

        if (isset($settings['admin_email_subject'])) {
            unset($settings['admin_email_subject']);
        }

        if (isset($settings['admin_email_body'])) {
            unset($settings['admin_email_body']);
        }

        if (isset($settings['admin_email_smtp'])) {
            unset($settings['admin_email_smtp']);
        }

        if (isset($settings['admin_email_user'])) {
            unset($settings['admin_email_user']);
        }

        if (isset($settings['admin_email_pass'])) {
            unset($settings['admin_email_pass']);
        }

        if (isset($settings['screen_name'])) {
            unset($settings['screen_name']);
        }

        if (isset($settings['customer_email_body'])) {
            unset($settings['customer_email_body']);
        }

    }
    return $settings;
}

function saveProductQuestion($id, $publish, $shop, $data)
{
    $data_insert = [
        'product_id' => $id,
        'faqs_name' => $data['faqName'],
        'faqs_email' => $data['faqEmail'],
        'faqs_question' => $data['faqQuestion'],
        'publish' => $publish,
        'publishdate' => date("Y-m-d H:i:s"),
        'shop' => $shop,
    ];
    $id = db_insert('product_faqs_database', $data_insert);
    if (isset($id)) {
        return true;
    }

    return "fail";
}

function saveAnswer($id, $publish, $shop, $data)
{
    $data_insert = [
        'question_id' => $id,
        'name' => $data['faqName'],
        'email' => $data['faqEmail'],
        'answer' => $data['faqQuestion'],
        'publish' => $publish,
        'publishdate' => date("Y-m-d H:i:s"),
        'shop' => $shop,
    ];
    $id = db_insert('product_faqs_answer_list', $data_insert);
    if (isset($id)) {
        return true;
    }

    return "fail";
}

function getSettingsGeneralEmail($settings)
{
    $settingsEmail = [];
    if ($settings['admin_email_smtp'] == '' || $settings['admin_email_smtp'] == null) {
        return false;
    }

    if ($settings['admin_email_user'] == '' || $settings['admin_email_user'] == null) {
        return false;
    }

    if ($settings['admin_email_pass'] == '' || $settings['admin_email_pass'] == null) {
        return false;
    }

    if ($settings['admin_email_encryption'] == '' || $settings['admin_email_encryption'] == null) {
        return false;
    }

    if ($settings['admin_email_port'] == '' || $settings['admin_email_port'] == null) {
        return false;
    }

    if ($settings['screen_name'] == '' || $settings['screen_name'] == null) {
        return false;
    }

    $settingsEmail['host'] = $settings["admin_email_smtp"];
    $settingsEmail['username'] = $settings["admin_email_user"];
    $settingsEmail['password'] = $settings["admin_email_pass"];
    $settingsEmail['SMTPSecure'] = $settings["admin_email_encryption"];
    $settingsEmail['port'] = intval($settings["admin_email_port"]);
    $settingsEmail['emailForm'] = $settings["admin_email"];
    $settingsEmail['usernameSend'] = $settings['screen_name'];
    return $settingsEmail;
}

function sendEmail($settings, $adminEmail)
{
    if (isset($settings['username'])) {
        $mail = new PHPMailer(true);
        //Server settings
        $mail->ErrorInfo;
        try {
            //Server settings
            $mail->CharSet = "utf-8";
            $mail->SMTPDebug = 0;
            $mail->isSMTP();
            $mail->Host = $settings['host'];

            $mail->SMTPAuth = true;
            $mail->Username = $settings['username'];
            $mail->Password = $settings['password'];

            $mail->SMTPSecure = $settings['SMTPSecure'];
            $mail->Port = $settings['port'];

            $mail->setFrom($settings["emailForm"], $settings["usernameSend"]);
            $mail->addAddress($settings['emailTo'], $settings['titleEmail']);
            $mail->AddReplyTo($settings['emailForm'], $settings['titleEmail']);
            //Content
            $mail->isHTML(true);
            $mail->Subject = $settings['titleEmail'];
            $mail->Body = $settings['content'];
            $mail->send();
            return true;
        } catch (Exception $e) {
            if ($adminEmail === $settings['emailTo']) {
                sendErrorMailingToShopAdmin($adminEmail, $mail->ErrorInfo);
            }
            return "Email configure error";
        }
    } else {
        return 'Please note that you must enter your email account information in the Email Template tab!';
    }
}
function sendErrorMailingToShopAdmin($adminEmail, $errorInfo)
{
    $mail = defaultEmailInit();
    $mail->setFrom('do_not_reply@omegatheme.com', 'Omegatheme Support');
    $mail->addAddress($adminEmail, 'Mailer Error');
    $mail->isHTML(true);
    $mail->Subject = 'Message could not be sent. Mailer Error!';
    $mail->Body = '<p>Your customer has submited a new quote but message could not be sent. Mailer Error: <p>
                    <p><strong>' . $errorInfo . '</strong></p>
                    <p>Please check your email account information in the Email Template tab again</p>';

    $mail->send();
}

function sendEmailConfigNotification($adminEmail)
{
    $mail = defaultEmailInit();
    $mail->setFrom('do_not_reply@omegatheme.com', 'Omegatheme Support');
    $mail->addAddress($adminEmail, 'Mailer Error');
    $mail->isHTML(true);
    $mail->Subject = 'Message could not be sent. Mailer Error!';
    $mail->Body = '<p>Please note that you must enter your account information in the Email Template tab!</p>';

    $mail->send();
}

function defaultEmailInit()
{
    $mail = new PHPMailer(true);
    //Server settings
    $mail->SMTPDebug = 0; // Enable verbose debug output
    $mail->isSMTP(); // Set mailer to use SMTP
    $mail->Host = 'smtp.gmail.com'; // Specify main and backup SMTP servers
    $mail->SMTPAuth = true; // Enable SMTP authentication
    $mail->Username = 'contact@omegatheme.com'; // SMTP username
    $mail->Password = 'xipat100'; // SMTP password
    $mail->SMTPSecure = 'ssl'; // Enable TLS encryption, `ssl` also accepted
    $mail->Port = 465; // TCP port to connect to

    return $mail;
}