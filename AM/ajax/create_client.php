<?php

error_reporting(E_ALL ^ E_DEPRECATED ^ E_NOTICE);
ini_set('display_errors', '1');
require("../lib/db.php");

require("../lib/user.php");
foreach ($_POST as $key => $value) {
    ${$key} = $value;
}
foreach ($_GET as $key => $value) {
    ${$key} = $value;
}

$user = new UserLogin($db);

$user->confirm_login();

$variables = array();

$js = array();
switch ($action) {
    case "get_fields":
        $query = "SELECT NAME,DISPLAY_NAME FROM `vicidial_list_ref` WHERE campaign_id=? and active='1' ORDER BY field_order asc";
        $variables[] = $campaign_id;
        $stmt = $db->prepare($query);
        $stmt->execute($variables);
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $js[] = array("name" => $row["NAME"], "display_name" => $row["DISPLAY_NAME"]);
        }
        echo json_encode($js);
        break;


    case "create_client":
        $variables[] = date("Y-m-d H:i:s");
        $variables[] = "NEW";
        $temp = $user->getUser();
        $variables[] = $temp->username;
        $variables[] = isset($temp->list_id)?$temp->list_id:"0";


        foreach ($info as $value) {
            $fields = $fields . " , " . $value["name"];
            $values = $values . ", ? ";
            $variables[] = $value["value"];
        }



        $query = "insert into vicidial_list (entry_date,status,user,list_id $fields) values (?,?,?,? $values) ";
 

        $stmt = $db->prepare($query);
        $stmt->execute($variables);
        
        echo json_encode($db->lastInsertId());

        break;
}
?>