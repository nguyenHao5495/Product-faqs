<?php
header('Set-Cookie: cross-site-cookie=name; SameSite=None; Secure');
require 'vendor/autoload.php';
use sandeepshetty\shopify_api;
require 'helper.php'; 
session_start();

$app_settings = db_fetch_row("SELECT * FROM tbl_appsettings WHERE id = $appId");


if(!empty($_GET['shop'])){ //check if the shop name is passed in the URL
	$shop = $_GET['shop']; //shop-name.myshopify.com
	$select_store = db_fetch_row("SELECT store_name FROM tbl_usersettings WHERE store_name = '$shop' and app_id = $appId"); //check if the store exists
  
	if(!empty($select_store)){
		if(shopify_api\is_valid_request($_GET, $app_settings['shared_secret'])){ //check if its a valid request from Shopify
			header('Location: '.$rootLink.'/admin/myapp/build?shop='.$shop); //redirect to the admin page
		}
      
	}else{
        
		//convert the permissions to an array
		$permissions = $app_settings['permissions'];
		//get the permission url
		$permission_url = shopify_api\permission_url(
			$_GET['shop'], $app_settings['api_key'], $permissions
		);
        $permission_url .= '&redirect_uri=' . $app_settings['redirect_url'];
		header('Location: ' . $permission_url); //redirect to the permission url
	}
}

?>