<?php

ini_set('display_errors', TRUE);
error_reporting(E_ALL);
require '../../vendor/autoload.php';
use sandeepshetty\shopify_api;
require '../../conn-shopify.php';
require '../../helper.php'; 
if (isset($_GET["action"])) {
    $action = $_GET["action"];
    $shop = $_GET["shop"];
    $shopify = shopifyInit($db, $shop, $appId);
    if($action == "getCountProductShop"){
        $count = $shopify("GET", "/admin/products/count.json");
        echo json_encode($count);
    }
    if ($action == "getProducts") {
        $page = intval($_GET["page"]);
        $flag = $_GET["flag"];
        $since_id = $_GET["since_id"];
        $key_path = CACHE_PATH . $shop . "/product_page_" . ($page);
        if($flag == 0) {
            if(is_file($key_path) && (time() - filemtime($key_path) < 43200)){  
                $data_cache = file_get_contents($key_path);
                $filterProduct = json_decode($data_cache,true);
            }
            if(!isset($filterProduct)) {
                if (!is_dir(CACHE_PATH. $shop)) {
                    mkdir(CACHE_PATH. $shop, 0755, true);
                }
                $filterProduct = array();
                $products = $shopify("GET", "/admin/products.json?limit=" . LIMIT_PRODUCT_PER_PAGE . "&since_id=" . $since_id . "&fields=id,title,handle,image");
                if(is_array($products)) {
                    for($i=0;$i<count($products);$i++){
                        $filterProduct[] = $products[$i];
                    }
                    file_put_contents($key_path,is_array($filterProduct)?json_encode($filterProduct):$filterProduct);
                }
            }
        } else {
            if (!is_dir(CACHE_PATH. $shop)) {
                mkdir(CACHE_PATH. $shop, 0755, true);
            }
            $filterProduct = array();
            $products = $shopify("GET", "/admin/products.json?limit=" . LIMIT_PRODUCT_PER_PAGE . "&since_id=" . $since_id . "&fields=id,title,handle,image");
            if(is_array($products)) {
                for($i=0;$i<count($products);$i++){
                    $filterProduct[] = $products[$i];
                }
                file_put_contents($key_path,is_array($filterProduct)?json_encode($filterProduct):$filterProduct);
            }
        }
        if(is_array($filterProduct) && count($filterProduct) > 0) {
            $lastKey = count($filterProduct) - 1;
            $since_id = isset($filterProduct[$lastKey]['id']) ? $filterProduct[$lastKey]['id'] : 0;
            for($i=0;$i<count($filterProduct);$i++){
                if($filterProduct[$i]["image"]["src"] != ''){
                    $filterProduct[$i]["imageUrl"] = $filterProduct[$i]["image"]["src"];
                } else {
                    $filterProduct[$i]["imageUrl"] = $rootLink."/assets/images/no-image.png";
                }
                $faqs = countAllQuestionsByProduct($db, $shop, $filterProduct[$i]["id"]);
                $filterProduct[$i]["faqs"] = $faqs;
                $filterProduct[$i]["productUrl"] = "https://".$shop."/products/".$filterProduct[$i]["handle"];
            }
        }
        echo json_encode([
            "products" => $filterProduct,
            "since_id" => $since_id
        ]);
    }
    if ($action == "getQuestionsByProductId") {
        $id = $_GET["id"];
        $product = $shopify("GET", "/admin/products/$id.json?fields=id,title,handle,image");
        if(is_array($product)) {
            $faqs = getAllQuestionsByProduct($db, $shop, $product["id"]);
            $product["faqs"] = $faqs;
            if($product["image"]["src"]){
                $product["imageUrl"] = $product["image"]["src"];
            } else {
                $product["imageUrl"] = $rootLink."/assets/images/no-image.png";
            }
            $product["productUrl"] = "https://".$shop."/products/".$product["handle"];
        } else {
            $product = array();
        }
        echo json_encode($product);
    }
}
if (isset($_POST['action'])) {
    $action     = $_POST['action'];
    $shop       = $_POST["shop"];
    $shopify    = shopifyInit($db, $shop, $appId);
    $settings = db_fetch_row("SELECT * FROM product_faqs_settings WHERE shop = '$shop'");
    if ($action == "publishAllQuestions") {
        $id = $_POST["id"];
        $db->query("UPDATE product_faqs_database SET publish='1' WHERE shop = '$shop' AND product_id = '$id'");
    }
    if ($action == "unpublishAllQuestions") {
        $id = $_POST["id"];
        $db->query("UPDATE product_faqs_database SET publish='0' WHERE shop = '$shop' AND product_id = '$id'");
    }
    if ($action == "deleteAllQuestions") {
        // Product Id
        $id = $_POST["id"];
        $query = $db->query("DELETE FROM product_faqs_database WHERE shop = '$shop' AND product_id = '$id'");
        if($query){
            $faqs = getAllQuestionsByProduct($db, $shop, $id);
            $sqlDelete = "";
            for($i=0;$i<count($faqs);$i++){
                if($i == 0) $sqlDelete .= strval($faqs[$i]["id"]);
                else $sqlDelete .= ','.strval($faqs[$i]["id"]);
            }
            if($sqlDelete != '') {
                $sql = "DELETE FROM product_faqs_answer_list WHERE shop = ".$shop." AND question_id IN (".$sqlDelete.")";
                $db->query($sql);
            }
        }
    }
    if ($action == "addNewQuestion") {
        $faqs = $_POST["faqs"];
        if($settings['timezone']) date_default_timezone_set($settings['timezone']);
        else date_default_timezone_set('UTC');
        $data_insert = [
            'product_id'    => $faqs["product_id"],
            'faqs_name'     => $faqs["faqs_name"],
            'faqs_email'    => $faqs["faqs_email"],
            'faqs_question' => $faqs["faqs_question"],
            'publish'       => $faqs["publish"],
            'publishdate'   => date("Y-m-d H:i:s", strtotime($faqs["publishdate"])),
            'shop'          => $shop,
        ];
        $id = db_insert('product_faqs_database', $data_insert);

        if(isset($id ) && $faqs["faqs_answer_name"] != "") {
            $data_insert1 = [
                'question_id'   => $id,
                'name'          => $faqs["faqs_answer_name"],
                'email'         => $faqs["faqs_answer_email"],
                'answer'        => $faqs["faqs_answer"],
                'publish'       => $faqs["faqs_answer_publish"],
                'publishdate'   => date("Y-m-d H:i:s", strtotime($faqs["faqs_answer_publishdate"])),
                'shop'          => $shop,
            ];
            db_insert('product_faqs_answer_list', $data_insert1);
        }
    }
    if ($action == "saveEditQuestion") {
        $faq = $_POST["faq"];
        $url = $_POST["url"];
        $id = $faq["id"];
        if($settings['timezone']) date_default_timezone_set($settings['timezone']);
        else date_default_timezone_set('UTC');
        $data = array(
            'faqs_name'     => $faq["faqs_name"],
            'faqs_email'    => $faq["faqs_email"],
            'faqs_question' => $faq["faqs_question"],
            'publish'       => $faq["publish"],
            'publishdate'   => date("Y-m-d H:i:s", strtotime($faq["publishdate"])),
        );  
        db_update("product_faqs_database",$data,"shop = '$shop' AND id = '$id'");
        
        if(isset($faq["answer_lists"]) && count($faq["answer_lists"]) > 0 ) {
            for($i=0;$i<count($faq["answer_lists"]);$i++) {
                $answerId = $faq["answer_lists"][$i]["id"];
                if(isset($faq["answer_lists"][$i]['newAnswer']) && $faq["answer_lists"][$i]['newAnswer'] == 1){
                    $data_insert = [
                        'question_id'   => $id,
                        'name'          => $faq["answer_lists"][$i]["name"],
                        'email'         => $faq["answer_lists"][$i]["email"],
                        'answer'        => $faq["answer_lists"][$i]["answer"],
                        'publish'       => $faq["answer_lists"][$i]["publish"],
                        'publishdate'   => date("Y-m-d H:i:s", strtotime($faq["answer_lists"][$i]["publishdate"])),
                        'shop'          => $shop,
                    ];
                    $resultInsert = db_insert('product_faqs_answer_list', $data_insert);
                    if(isset($id)) {
                        if($faq["faqs_email"] != $settings["admin_email"]){
                            $settingsEmail = getSettingsGeneralEmail($settings);
                            $shopInfo = $shopify("GET", "/admin/shop.json");
                            $product = getDataById($shopify,$productid,'products',$filter = null);
                            $producturl = "<a target='_blank' href='https://".$shop."/products/".$product["handle"]."'>".$product["title"]."</a>";
                            $questionInfor = "
                                <p><strong>Name:</strong> ".$faq["answer_lists"][$i]["name"]."</p>
                                <p><strong>Email:</strong> ".$faq["answer_lists"][$i]["email"]."</p>
                                <p><strong>Question:</strong> ".$faq["answer_lists"][$i]["answer"]."</p>
                            ";

                            $settings["customer_email_subject"] = str_replace("{product_name}", $product["title"] ,$settings["customer_email_subject"]);
                            $settings["customer_email_body"] = str_replace("{!! shop_name !!}", $shopInfo["name"] ,$settings["customer_email_body"]);
                            $settings["customer_email_body"] = str_replace("{!! product_name !!}",$producturl,$settings["customer_email_body"]);
                            $settings["customer_email_body"] = str_replace("{!! question_information !!}",$questionInfor,$settings["customer_email_body"]);
                            $settingsEmail['emailTo'] = $faq["answer_lists"][$i]["email"];
                            $settingsEmail['titleEmail'] = $settings['customer_email_subject'];
                            $settingsEmail['content'] =  $settings["customer_email_body"];
                            $checkSendMail = sendEmail($settingsEmail, $settings['admin_email']);
                        }
                    }
                } else {
                    $data = array(
                        'name'          => $faq["answer_lists"][$i]["name"],
                        'email'         => $faq["answer_lists"][$i]["email"],
                        'answer'        => $faq["answer_lists"][$i]["answer"],
                        'publish'       => $faq["answer_lists"][$i]["publish"],
                        'publishdate'   => date("Y-m-d H:i:s", strtotime($faq["answer_lists"][$i]["publishdate"])),
                    );  
                    db_update("product_faqs_answer_list",$data,"shop = '$shop' AND id = '$answerId'");
                }
            }
        }
    }
    if ($action == "deleteQuestion") {
        $id = $_POST["id"];
        $db->query("DELETE FROM product_faqs_database WHERE shop = '$shop' AND id = '$id'");
        $db->query("DELETE FROM product_faqs_answer_list WHERE shop = '$shop' AND question_id = '$id'");
    }
    if ($action == "lockQuestion") {
        $id = $_POST["id"];
        $db->query("UPDATE product_faqs_database SET locked='1' WHERE shop = '$shop' AND id = '$id'");
    }
    if ($action == "unlockQuestion") {
        $id = $_POST["id"];
        $db->query("UPDATE product_faqs_database SET locked='0' WHERE shop = '$shop' AND id = '$id'");
    }
    if ($action == "deleteAnswer") {
        // Answer Id
        $id = $_POST["id"];
        $db->query("DELETE FROM product_faqs_answer_list WHERE shop = '$shop' AND id = '$id'");
    }
}
function countAllQuestionsByProduct($db, $shop, $id) {
    $count = db_fetch_row("SELECT COUNT(*) FROM product_faqs_database WHERE shop ='$shop' AND product_id = '$id'");
    return $count['COUNT(*)'];
}
function getAllQuestionsByProduct($db, $shop, $id) {
    $sql = "SELECT * FROM product_faqs_database WHERE shop = '$shop' AND product_id = '$id' ORDER BY publishdate DESC";
    $query = $db->query($sql);
    $lists = array();
    if ($query) {
        while ($row = $query->fetch_assoc()) {
            $row["publishdate"] = date("m/d/Y H:i", strtotime($row["publishdate"]));
            $row["answer_lists"] = getAnswerByQuestionId($db, $shop, $row["id"]);
            $lists[] = $row;
            
        }
    }
    return $lists;
}
function getAnswerByQuestionId($db, $shop, $id) {
    $sql = "SELECT * FROM product_faqs_answer_list WHERE shop = '$shop' AND question_id = '$id'";
    $query = $db->query($sql);
    $lists = array();
    if ($query) {
        while ($row = $query->fetch_assoc()) {
            $row["publishdate"] = date("m/d/Y H:i", strtotime($row["publishdate"]));
            $lists[] = $row;
        }
    }
    return $lists;
}
